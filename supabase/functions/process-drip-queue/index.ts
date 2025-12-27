import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log(`[process-drip-queue] Starting processing at ${new Date().toISOString()}`);

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get pending emails that are due
    const { data: pendingEmails, error: fetchError } = await supabaseAdmin
      .from("email_drip_queue")
      .select(`
        id,
        user_id,
        sequence_id,
        scheduled_for,
        sequence:email_drip_sequences(email_key, target_tier)
      `)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(50); // Process in batches of 50

    if (fetchError) {
      console.error("[process-drip-queue] Error fetching pending emails:", fetchError);
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log("[process-drip-queue] No pending emails to process");
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No pending emails" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`[process-drip-queue] Found ${pendingEmails.length} emails to process`);

    let processed = 0;
    let failed = 0;
    let skipped = 0;

    // Process each email
    for (const email of pendingEmails) {
      try {
        // Mark as processing to prevent duplicate sends
        await supabaseAdmin
          .from("email_drip_queue")
          .update({ status: "processing" })
          .eq("id", email.id);

        // Call the send-drip-email function
        const { data, error } = await supabaseAdmin.functions.invoke("send-drip-email", {
          body: { queue_id: email.id },
        });

        if (error) {
          console.error(`[process-drip-queue] Error sending email ${email.id}:`, error);
          await supabaseAdmin
            .from("email_drip_queue")
            .update({ 
              status: "failed", 
              error_message: error.message || "Function invocation failed" 
            })
            .eq("id", email.id);
          failed++;
        } else if (data?.success === false) {
          console.log(`[process-drip-queue] Email ${email.id} skipped: ${data.reason}`);
          skipped++;
        } else {
          processed++;
        }

        // Small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e: any) {
        console.error(`[process-drip-queue] Exception processing email ${email.id}:`, e);
        await supabaseAdmin
          .from("email_drip_queue")
          .update({ 
            status: "failed", 
            error_message: e.message || "Unknown error" 
          })
          .eq("id", email.id);
        failed++;
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[process-drip-queue] Completed in ${duration}ms: ${processed} sent, ${skipped} skipped, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed,
        skipped,
        failed,
        total: pendingEmails.length,
        duration_ms: duration,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("[process-drip-queue] Error:", error);
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
