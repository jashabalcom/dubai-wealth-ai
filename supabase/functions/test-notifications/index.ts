import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, testType } = await req.json();

    if (!userId) {
      throw new Error("userId is required");
    }

    const notifications = [];

    // Generate test notifications based on type or send all
    const typesToSend = testType ? [testType] : [
      'message',
      'connection_request',
      'connection_accepted',
      'post_comment',
      'event_new',
      'announcement'
    ];

    for (const type of typesToSend) {
      let notification;
      
      switch (type) {
        case 'message':
          notification = {
            user_id: userId,
            type: 'message',
            title: 'New message from Sarah Chen',
            body: 'Hey! I saw your post about JVC investments. Would love to connect and share insights about the market.',
            link: '/community/messages',
            metadata: { sender_name: 'Sarah Chen' }
          };
          break;
          
        case 'connection_request':
          notification = {
            user_id: userId,
            type: 'connection_request',
            title: 'Connection request from Oliver Thompson',
            body: 'Oliver Thompson wants to connect with you. They are interested in networking with serious investors.',
            link: '/community/connections',
            metadata: { requester_name: 'Oliver Thompson' }
          };
          break;
          
        case 'connection_accepted':
          notification = {
            user_id: userId,
            type: 'connection_accepted',
            title: 'Rajesh Sharma accepted your connection',
            body: 'You are now connected with Rajesh Sharma. Start a conversation!',
            link: '/community/connections',
            metadata: { accepter_name: 'Rajesh Sharma' }
          };
          break;
          
        case 'post_comment':
          notification = {
            user_id: userId,
            type: 'post_comment',
            title: 'New comment on your post',
            body: 'Wei Zhang commented: "Great analysis! I have been seeing similar trends in the Marina area."',
            link: '/community/discussions',
            metadata: { commenter_name: 'Wei Zhang', post_title: 'Market Analysis Q4' }
          };
          break;
          
        case 'event_new':
          notification = {
            user_id: userId,
            type: 'event_new',
            title: 'New Event: Dubai Investment Masterclass',
            body: 'Join us for an exclusive webinar on off-plan investment strategies. December 20th at 7PM GST.',
            link: '/community/events',
            metadata: { event_title: 'Dubai Investment Masterclass', event_date: '2024-12-20' }
          };
          break;
          
        case 'announcement':
          notification = {
            user_id: userId,
            type: 'announcement',
            title: 'Platform Update: New Features Released!',
            body: 'We have launched the notification center, enhanced member directory with 130+ members, and improved community features.',
            link: '/dashboard',
            metadata: { announcement_type: 'feature_release' }
          };
          break;
      }
      
      if (notification) {
        notifications.push(notification);
      }
    }

    // Insert all notifications
    const { data, error } = await supabaseClient
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) {
      throw error;
    }

    console.log(`Created ${notifications.length} test notifications for user ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${notifications.length} test notifications`,
        notifications: data
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error creating test notifications:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
