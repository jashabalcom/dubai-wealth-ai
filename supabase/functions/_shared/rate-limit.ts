import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check and update rate limit for a given key
 * @param key - Unique identifier (e.g., user_id, IP address)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowSeconds - Time window in seconds
 * @returns RateLimitResult with allowed status and remaining count
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  // Get current count for this key within the window
  const { data: existing, error: fetchError } = await supabase
    .from("rate_limits")
    .select("id, count, window_start")
    .eq("key", key)
    .gte("window_start", windowStart.toISOString())
    .order("window_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error("[RATE-LIMIT] Error fetching rate limit:", fetchError);
    // Fail open - allow request if we can't check rate limit
    return { allowed: true, remaining: maxRequests - 1, resetAt: expiresAt };
  }

  if (existing) {
    // Entry exists within window - check if limit exceeded
    if (existing.count >= maxRequests) {
      const resetAt = new Date(new Date(existing.window_start).getTime() + windowSeconds * 1000);
      return { allowed: false, remaining: 0, resetAt };
    }

    // Increment counter
    const { error: updateError } = await supabase
      .from("rate_limits")
      .update({ count: existing.count + 1 })
      .eq("id", existing.id);

    if (updateError) {
      console.error("[RATE-LIMIT] Error updating rate limit:", updateError);
    }

    const resetAt = new Date(new Date(existing.window_start).getTime() + windowSeconds * 1000);
    return { allowed: true, remaining: maxRequests - existing.count - 1, resetAt };
  }

  // No entry exists - create new one
  const { error: insertError } = await supabase
    .from("rate_limits")
    .insert({
      key,
      count: 1,
      window_start: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    });

  if (insertError) {
    console.error("[RATE-LIMIT] Error inserting rate limit:", insertError);
  }

  return { allowed: true, remaining: maxRequests - 1, resetAt: expiresAt };
}

/**
 * Generate rate limit key for a user
 */
export function getUserRateLimitKey(functionName: string, userId: string): string {
  return `${functionName}:user:${userId}`;
}

/**
 * Generate rate limit key for an IP address
 */
export function getIpRateLimitKey(functionName: string, ip: string): string {
  return `${functionName}:ip:${ip}`;
}

/**
 * Get client IP from request headers
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Create rate limit error response
 */
export function rateLimitResponse(resetAt: Date, corsHeaders: Record<string, string>): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retry_after: Math.ceil((resetAt.getTime() - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString(),
      },
    }
  );
}
