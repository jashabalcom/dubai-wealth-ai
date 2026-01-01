import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { format = "json" } = await req.json().catch(() => ({}));

    console.log(`Exporting user data for user ${user.id} in ${format} format`);

    // Collect all user data
    const userData: Record<string, unknown> = {
      export_date: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
    };

    // Profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    userData.profile = profile;

    // Saved properties
    const { data: savedProperties } = await supabase
      .from("saved_properties")
      .select("*, properties(title, slug, location_area, price_aed)")
      .eq("user_id", user.id);
    userData.saved_properties = savedProperties;

    // Property notes
    const { data: propertyNotes } = await supabase
      .from("property_notes")
      .select("*, properties(title, slug)")
      .eq("user_id", user.id);
    userData.property_notes = propertyNotes;

    // AI strategies
    const { data: aiStrategies } = await supabase
      .from("ai_strategies")
      .select("*")
      .eq("user_id", user.id);
    userData.ai_strategies = aiStrategies;

    // Property inquiries
    const { data: inquiries } = await supabase
      .from("property_inquiries")
      .select("*, properties(title, slug)")
      .eq("user_id", user.id);
    userData.property_inquiries = inquiries;

    // Community posts
    const { data: posts } = await supabase
      .from("community_posts")
      .select("*")
      .eq("user_id", user.id);
    userData.community_posts = posts;

    // Community comments
    const { data: comments } = await supabase
      .from("community_comments")
      .select("*")
      .eq("user_id", user.id);
    userData.community_comments = comments;

    // Direct messages (sent)
    const { data: sentMessages } = await supabase
      .from("direct_messages")
      .select("*")
      .eq("sender_id", user.id);
    userData.sent_messages = sentMessages;

    // Connections
    const { data: connections } = await supabase
      .from("connections")
      .select("*")
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);
    userData.connections = connections;

    // Lesson progress
    const { data: lessonProgress } = await supabase
      .from("lesson_progress")
      .select("*, lessons(title, slug)")
      .eq("user_id", user.id);
    userData.lesson_progress = lessonProgress;

    // Event registrations
    const { data: eventRegs } = await supabase
      .from("event_registrations")
      .select("*, community_events(title, event_date)")
      .eq("user_id", user.id);
    userData.event_registrations = eventRegs;

    // Portfolios
    const { data: portfolios } = await supabase
      .from("portfolios")
      .select("*, portfolio_properties(*)")
      .eq("user_id", user.id);
    userData.portfolios = portfolios;

    // Member follows
    const { data: follows } = await supabase
      .from("member_follows")
      .select("*")
      .eq("follower_id", user.id);
    userData.following = follows;

    // Format response
    if (format === "csv") {
      // Simple CSV export of profile
      const csvRows = [
        "Field,Value",
        `Email,${user.email}`,
        `Full Name,${profile?.full_name || ""}`,
        `Membership Tier,${profile?.membership_tier || "free"}`,
        `Created At,${profile?.created_at || ""}`,
        `Saved Properties Count,${savedProperties?.length || 0}`,
        `AI Strategies Count,${aiStrategies?.length || 0}`,
        `Community Posts Count,${posts?.length || 0}`,
      ];

      return new Response(csvRows.join("\n"), {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="user-data-export-${user.id}.csv"`,
        },
      });
    }

    // Default: JSON format
    return new Response(JSON.stringify(userData, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="user-data-export-${user.id}.json"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
