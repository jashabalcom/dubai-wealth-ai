import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnqueueRequest {
  user_id: string;
  email: string;
  full_name?: string;
  membership_tier?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email, full_name, membership_tier = 'free' }: EnqueueRequest = await req.json();

    console.log(`[enqueue-welcome-sequence] Processing for user: ${user_id}, tier: ${membership_tier}`);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all active sequences for this tier
    const { data: sequences, error: seqError } = await supabaseAdmin
      .from("email_drip_sequences")
      .select("*")
      .eq("target_tier", membership_tier)
      .eq("is_active", true)
      .order("day_offset", { ascending: true });

    if (seqError) {
      console.error("[enqueue-welcome-sequence] Error fetching sequences:", seqError);
      throw seqError;
    }

    if (!sequences || sequences.length === 0) {
      console.log(`[enqueue-welcome-sequence] No sequences found for tier: ${membership_tier}`);
      return new Response(JSON.stringify({ success: true, queued: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`[enqueue-welcome-sequence] Found ${sequences.length} sequences for tier: ${membership_tier}`);

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
        user_id,
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

    console.log(`[enqueue-welcome-sequence] Queued ${queueEntries.length} emails for user: ${user_id}`);

    // Also trigger the immediate welcome email
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        queued: queueEntries.length,
        user_id,
        tier: membership_tier 
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
