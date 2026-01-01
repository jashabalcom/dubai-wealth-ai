// Shared admin authentication utilities
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export interface AdminAuthResult {
  isAdmin: boolean;
  userId: string | null;
  error?: string;
}

export async function verifyAdmin(req: Request): Promise<AdminAuthResult> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    return { isAdmin: false, userId: null, error: "No authorization header" };
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get the user from the token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return { isAdmin: false, userId: null, error: "Invalid token" };
    }

    // Check if user has admin role using the has_role function
    const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError) {
      console.error("Error checking admin role:", roleError);
      return { isAdmin: false, userId: user.id, error: "Failed to verify role" };
    }

    return { isAdmin: hasRole === true, userId: user.id };
  } catch (error) {
    console.error("Admin verification error:", error);
    return { isAdmin: false, userId: null, error: "Verification failed" };
  }
}

export function unauthorizedResponse(message: string = "Unauthorized"): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

export function forbiddenResponse(message: string = "Admin access required"): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

// Helper to require admin access
export async function requireAdmin(req: Request): Promise<{ userId: string } | Response> {
  const result = await verifyAdmin(req);
  
  if (!result.userId) {
    return unauthorizedResponse(result.error || "Not authenticated");
  }
  
  if (!result.isAdmin) {
    return forbiddenResponse("Admin access required");
  }
  
  return { userId: result.userId };
}
