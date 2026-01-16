import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface SupportRequest {
  ticketId?: string;
  message: string;
  pageUrl?: string;
  userAgent?: string;
}

const SYSTEM_PROMPT = `You are the AI Support Agent for Dubai Wealth Hub, a premium investment intelligence platform for Dubai real estate investors.

## Your Role
You are a helpful, knowledgeable, and professional support assistant. Your goal is to resolve user issues quickly while providing excellent service.

## Platform Knowledge
- **Subscription Tiers**: Free (limited access), Investor ($49/month - full tools access), Elite ($199/month - premium features + community)
- **Key Features**: ROI calculators, property analytics, AI investment assistant, academy courses, community, portfolio tracker
- **Golden Visa**: Dubai offers 10-year visas for property investments of AED 2M+ ($545K+)

## Common Issues You Can Handle
1. **Account & Profile**: Password resets, profile updates, notification settings
2. **Subscriptions**: Explaining tiers, upgrade benefits, billing questions
3. **Tools & Calculators**: How to use ROI calculator, mortgage calculator, etc.
4. **Properties**: How to search, save properties, contact agents
5. **Academy**: Course access, lesson completion, certificates
6. **Community**: How to post, connect with members, events
7. **Golden Visa**: Basic requirements and process information

## Escalation Triggers (set needsEscalation: true)
- Billing disputes or refund requests
- Account access issues (can't log in, account locked)
- Data privacy requests (GDPR, data deletion)
- Technical bugs affecting functionality
- User explicitly requests human support
- Legal concerns
- Complaints about service quality

## Response Guidelines
- Be concise but thorough
- Use markdown formatting for clarity
- Provide step-by-step instructions when helpful
- Always be empathetic and professional
- If unsure, acknowledge limitations and offer to escalate

## Context Usage
You will receive context about the user including their profile, subscription, and recent activity. Use this to personalize responses.`;

async function fetchUserContext(supabase: any, userId: string) {
  try {
    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, membership_tier, created_at, onboarding_completed")
      .eq("id", userId)
      .single();

    // Fetch recent inquiries
    const { data: inquiries } = await supabase
      .from("property_inquiries")
      .select("id, property_id, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Fetch saved properties count
    const { count: savedCount } = await supabase
      .from("saved_properties")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    return {
      profile,
      recentInquiries: inquiries || [],
      savedPropertiesCount: savedCount || 0,
    };
  } catch (error) {
    console.error("Error fetching user context:", error);
    return null;
  }
}

function buildContextMessage(context: any): string {
  if (!context?.profile) return "";
  
  const { profile, recentInquiries, savedPropertiesCount } = context;
  
  return `
## User Context
- **Name**: ${profile.full_name || "Not set"}
- **Tier**: ${profile.membership_tier || "free"}
- **Member Since**: ${new Date(profile.created_at).toLocaleDateString()}
- **Saved Properties**: ${savedPropertiesCount}
- **Recent Inquiries**: ${recentInquiries?.length || 0}
- **Onboarding Complete**: ${profile.onboarding_completed ? "Yes" : "No"}
`;
}

function classifyIntent(message: string): { category: string; priority: string; needsEscalation: boolean } {
  const lowerMessage = message.toLowerCase();
  
  // Escalation keywords
  const escalationKeywords = [
    "refund", "cancel subscription", "delete my account", "speak to human", 
    "talk to someone", "manager", "complaint", "sue", "lawyer", "legal",
    "can't log in", "locked out", "hacked", "stolen", "fraud"
  ];
  
  if (escalationKeywords.some(kw => lowerMessage.includes(kw))) {
    return { category: "escalation", priority: "high", needsEscalation: true };
  }
  
  // Billing
  if (lowerMessage.includes("billing") || lowerMessage.includes("payment") || lowerMessage.includes("charge")) {
    return { category: "billing", priority: "normal", needsEscalation: false };
  }
  
  // Technical
  if (lowerMessage.includes("bug") || lowerMessage.includes("error") || lowerMessage.includes("not working")) {
    return { category: "technical", priority: "normal", needsEscalation: false };
  }
  
  // Account
  if (lowerMessage.includes("password") || lowerMessage.includes("profile") || lowerMessage.includes("account")) {
    return { category: "account", priority: "normal", needsEscalation: false };
  }
  
  // Property
  if (lowerMessage.includes("property") || lowerMessage.includes("listing") || lowerMessage.includes("agent")) {
    return { category: "property", priority: "normal", needsEscalation: false };
  }
  
  // Visa
  if (lowerMessage.includes("visa") || lowerMessage.includes("golden visa") || lowerMessage.includes("residency")) {
    return { category: "visa", priority: "normal", needsEscalation: false };
  }
  
  return { category: "general", priority: "normal", needsEscalation: false };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { ticketId, message, pageUrl, userAgent }: SupportRequest = await req.json();
    
    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Classify the message
    const classification = classifyIntent(message);
    
    // Fetch user context if authenticated
    let userContext = null;
    if (userId) {
      userContext = await fetchUserContext(supabase, userId);
    }
    
    // Get or create ticket
    let ticket;
    let conversationHistory: Message[] = [];
    
    if (ticketId) {
      // Existing conversation
      const { data: existingTicket, error: ticketError } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("id", ticketId)
        .single();
      
      if (ticketError || !existingTicket) {
        return new Response(
          JSON.stringify({ error: "Ticket not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      ticket = existingTicket;
      conversationHistory = (ticket.conversation_history as Message[]) || [];
    } else {
      // Create new ticket
      const { data: newTicket, error: createError } = await supabase
        .from("support_tickets")
        .insert({
          user_id: userId,
          initial_message: message,
          status: "ai_handling",
          category: classification.category,
          priority: classification.priority,
          page_url: pageUrl,
          user_agent: userAgent,
          session_context: userContext ? { profile: userContext.profile } : {},
        })
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating ticket:", createError);
        throw new Error("Failed to create support ticket");
      }
      
      ticket = newTicket;
    }
    
    // Add user message to history
    conversationHistory.push({
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Store user message in support_messages table
    if (userId) {
      await supabase.from("support_messages").insert({
        ticket_id: ticket.id,
        sender_id: userId,
        sender_type: "user",
        content: message,
      });
    }
    
    // Check if an admin has joined - if so, don't generate AI response
    if (ticket.admin_id) {
      // Admin is handling, just acknowledge the message
      const { error: updateError } = await supabase
        .from("support_tickets")
        .update({
          conversation_history: conversationHistory,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", ticket.id);

      return new Response(
        JSON.stringify({
          ticketId: ticket.id,
          response: null,
          category: ticket.category,
          isEscalated: true,
          adminJoined: true,
          conversationHistory,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Build the prompt with context
    const contextMessage = buildContextMessage(userContext);
    const messagesForAI = [
      { role: "system", content: SYSTEM_PROMPT + contextMessage },
      ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
    ];
    
    // Call Lovable AI Gateway
    let aiResponse = "I apologize, but I'm having trouble processing your request right now. Would you like me to escalate this to our support team?";
    let confidenceScore = 0.5;
    
    if (lovableApiKey) {
      try {
        const aiResult = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: messagesForAI,
            max_tokens: 1000,
            temperature: 0.7,
          }),
        });
        
        if (aiResult.ok) {
          const aiData = await aiResult.json();
          aiResponse = aiData.choices?.[0]?.message?.content || aiResponse;
          confidenceScore = 0.85; // Base confidence for successful response
          
          // Lower confidence if response seems uncertain
          const uncertainPhrases = ["i'm not sure", "i don't know", "you may need to", "contact support"];
          if (uncertainPhrases.some(p => aiResponse.toLowerCase().includes(p))) {
            confidenceScore = 0.6;
          }
        } else {
          console.error("AI API error:", await aiResult.text());
        }
      } catch (aiError) {
        console.error("Error calling AI:", aiError);
      }
    }
    
    // Add AI response to history
    conversationHistory.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });

    // Store AI response in support_messages table
    // Use a system user ID for AI messages
    await supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: userId || "00000000-0000-0000-0000-000000000000",
      sender_type: "ai",
      content: aiResponse,
    });
    
    // Determine if escalation is needed
    const shouldEscalate = classification.needsEscalation || confidenceScore < 0.6;
    
    // Update ticket
    const { error: updateError } = await supabase
      .from("support_tickets")
      .update({
        conversation_history: conversationHistory,
        status: shouldEscalate ? "escalated" : "ai_handling",
        ai_confidence_score: confidenceScore,
        escalation_reason: shouldEscalate ? `Auto-escalated: ${classification.category}` : null,
        last_message_at: new Date().toISOString(),
        category: classification.category,
      })
      .eq("id", ticket.id);
    
    if (updateError) {
      console.error("Error updating ticket:", updateError);
    }
    
    console.log(`Support ticket ${ticket.id}: ${classification.category}, confidence: ${confidenceScore}, escalated: ${shouldEscalate}`);
    
    return new Response(
      JSON.stringify({
        ticketId: ticket.id,
        response: aiResponse,
        category: classification.category,
        isEscalated: shouldEscalate,
        conversationHistory,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in ai-support-agent:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
