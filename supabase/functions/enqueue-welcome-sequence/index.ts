import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnqueueRequest {
  user_id?: string;
  email: string;
  full_name?: string;
  membership_tier?: string; // Supports: free, investor, elite, off_plan, rental, golden_visa
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email, full_name, membership_tier = 'free' }: EnqueueRequest = await req.json();

    // Support both user_id-based and email-only subscriptions
    const identifier = user_id || email;
    console.log(`[enqueue-welcome-sequence] Processing for: ${identifier}, tier: ${membership_tier}`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Map intent types to target_tier in sequences
    // off_plan, rental, golden_visa are intent types stored in email_subscribers.investor_intent
    // These map to target_tier in email_drip_sequences
    const targetTier = membership_tier;

    // Get all active sequences for this tier
    const { data: sequences, error: seqError } = await supabaseAdmin
      .from("email_drip_sequences")
      .select("*")
      .eq("target_tier", targetTier)
      .eq("is_active", true)
      .order("day_offset", { ascending: true });

    if (seqError) {
      console.error("[enqueue-welcome-sequence] Error fetching sequences:", seqError);
      throw seqError;
    }

    if (!sequences || sequences.length === 0) {
      console.log(`[enqueue-welcome-sequence] No sequences found for tier: ${targetTier}`);
      return new Response(JSON.stringify({ success: true, queued: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`[enqueue-welcome-sequence] Found ${sequences.length} sequences for tier: ${targetTier}`);

    // For email-only subscribers, we need to create or get a pseudo user_id
    // We'll use a hash of the email as a deterministic UUID
    let effectiveUserId = user_id;
    if (!user_id) {
      // Create a deterministic UUID from email for non-authenticated users
      const encoder = new TextEncoder();
      const data = encoder.encode(email.toLowerCase());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = new Uint8Array(hashBuffer);
      // Convert first 16 bytes to UUID format
      const uuid = [
        hashArray.slice(0, 4),
        hashArray.slice(4, 6),
        hashArray.slice(6, 8),
        hashArray.slice(8, 10),
        hashArray.slice(10, 16)
      ].map((arr, i) => {
        const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
        // Set version 5 (SHA-1 based) bits for second group
        if (i === 2) return '5' + hex.slice(1);
        // Set variant bits for third group
        if (i === 3) return (parseInt(hex[0], 16) & 0x3 | 0x8).toString(16) + hex.slice(1);
        return hex;
      }).join('-');
      effectiveUserId = uuid;
    }

    // Calculate scheduled times and create queue entries
    const now = new Date();
    const queueEntries = sequences.map((seq) => {
      const scheduledFor = new Date(now);
      scheduledFor.setDate(scheduledFor.getDate() + seq.day_offset);
      // For day 0, send after 5 minutes delay to avoid overwhelming
      if (seq.day_offset === 0) {
        scheduledFor.setMinutes(scheduledFor.getMinutes() + 5);
      } else {
        // Schedule for 10:00 AM UAE time (UTC+4)
        scheduledFor.setUTCHours(6, 0, 0, 0);
      }
      
      return {
        user_id: effectiveUserId,
        sequence_id: seq.id,
        scheduled_for: scheduledFor.toISOString(),
        status: "pending",
      };
    });

    // Insert all queue entries (upsert to handle re-enrollment)
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("email_drip_queue")
      .upsert(queueEntries, { 
        onConflict: "user_id,sequence_id",
        ignoreDuplicates: true 
      })
      .select();

    if (insertError) {
      console.error("[enqueue-welcome-sequence] Error inserting queue entries:", insertError);
      throw insertError;
    }

    console.log(`[enqueue-welcome-sequence] Queued ${queueEntries.length} emails for: ${identifier}`);

    // Also trigger the immediate welcome email for user signups
    if (user_id) {
      try {
        const { error: welcomeError } = await supabaseAdmin.functions.invoke("send-welcome-email", {
          body: { email, name: full_name },
        });
        if (welcomeError) {
          console.warn("[enqueue-welcome-sequence] Welcome email failed:", welcomeError);
        }
      } catch (e) {
        console.warn("[enqueue-welcome-sequence] Welcome email invocation failed:", e);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        queued: queueEntries.length,
        user_id: effectiveUserId,
        tier: targetTier 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[enqueue-welcome-sequence] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
