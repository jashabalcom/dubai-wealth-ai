/**
 * Security utilities for edge functions
 * - Security headers (CSP, X-Frame-Options, etc.)
 * - Input sanitization for AI prompts
 * - CORS origin validation
 * - Safe error responses
 * - Request tracing and timing
 */

// =============================================================================
// REQUEST TRACING
// =============================================================================

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Request timing helper for performance monitoring
 */
export class RequestTimer {
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();
  public readonly requestId: string;

  constructor(requestId?: string) {
    this.startTime = Date.now();
    this.requestId = requestId || generateRequestId();
  }

  checkpoint(name: string): void {
    this.checkpoints.set(name, Date.now() - this.startTime);
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getTimings(): Record<string, number> {
    const timings: Record<string, number> = {
      total: this.getDuration(),
    };
    this.checkpoints.forEach((value, key) => {
      timings[key] = value;
    });
    return timings;
  }

  log(functionName: string, status: 'success' | 'error' = 'success'): void {
    const timings = this.getTimings();
    console.log(`[${this.requestId}] ${functionName} completed`, {
      status,
      duration: `${timings.total}ms`,
      checkpoints: Object.fromEntries(this.checkpoints),
    });

    // Alert on slow requests (>2 seconds)
    if (timings.total > 2000) {
      console.warn(`[SLOW REQUEST] ${this.requestId} ${functionName} took ${timings.total}ms`);
    }
  }
}

// =============================================================================
// SECURITY HEADERS
// =============================================================================

/**
 * Get security headers for edge function responses
 * Includes CSP, X-Frame-Options, and other hardening headers
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://www.google-analytics.com https://*.lovable.app https://*.lovableproject.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://meet.jit.si",
      "font-src 'self' https://fonts.gstatic.com data:",
      "media-src 'self' https: blob:",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=(self)",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-DNS-Prefetch-Control": "on",
    "X-Permitted-Cross-Domain-Policies": "none",
  };
}

// =============================================================================
// CORS UTILITIES
// =============================================================================

/**
 * Get CORS headers with origin validation
 * Falls back to wildcard in development or if no allowed origins configured
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const allowedOrigins = Deno.env.get("ALLOWED_ORIGINS")?.split(",").map(o => o.trim()).filter(Boolean) || [];
  const origin = req.headers.get("origin") || "";
  
  // If no allowed origins configured or in development, allow all
  if (allowedOrigins.length === 0) {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };
  }
  
  // Check if origin is allowed
  const isAllowed = allowedOrigins.some(allowed => 
    origin === allowed || 
    origin.endsWith(`.${allowed.replace(/^https?:\/\//, "")}`)
  );
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Map of known error patterns to safe user-facing messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  "rate limit": "Too many requests. Please try again in a moment.",
  "unauthorized": "Authentication required. Please sign in.",
  "forbidden": "You don't have permission to perform this action.",
  "not found": "The requested resource was not found.",
  "validation": "Invalid request data. Please check your input.",
  "timeout": "Request timed out. Please try again.",
  "network": "Network error. Please check your connection.",
};

/**
 * Create a safe error response that doesn't leak internal details
 * Always logs the full error server-side for debugging
 */
export function safeErrorResponse(
  error: unknown,
  corsHeaders: Record<string, string>,
  context?: string
): Response {
  // Always log full error details server-side
  console.error(`[ERROR]${context ? ` ${context}:` : ""}`, error);
  
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  
  // Check for known error patterns and return safe message
  for (const [pattern, safeMessage] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(pattern)) {
      return new Response(
        JSON.stringify({ error: safeMessage }),
        { status: getStatusCode(pattern), headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }
  
  // Default generic error message
  return new Response(
    JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function getStatusCode(pattern: string): number {
  switch (pattern) {
    case "rate limit": return 429;
    case "unauthorized": return 401;
    case "forbidden": return 403;
    case "not found": return 404;
    case "validation": return 400;
    default: return 500;
  }
}

// =============================================================================
// AUTHENTICATION HELPERS
// =============================================================================

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

export interface AuthResult {
  success: boolean;
  userId?: string;
  email?: string;
  error?: string;
  statusCode?: number;
}

export interface AdminAuthResult extends AuthResult {
  isAdmin: boolean;
}

/**
 * Verify JWT token and return user info
 * Use this for authenticated endpoints
 */
export async function verifyAuth(req: Request, supabase: SupabaseClient): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { success: false, error: "Authorization required", statusCode: 401 };
  }

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { success: false, error: "Invalid or expired token", statusCode: 401 };
  }

  return {
    success: true,
    userId: data.user.id,
    email: data.user.email,
  };
}

/**
 * Verify JWT token and check admin role
 * Use this for admin-only endpoints
 */
export async function verifyAdminAuth(req: Request, supabase: SupabaseClient): Promise<AdminAuthResult> {
  const authResult = await verifyAuth(req, supabase);
  
  if (!authResult.success) {
    return { ...authResult, isAdmin: false };
  }

  const { data: isAdmin } = await supabase.rpc('has_role', { 
    _user_id: authResult.userId, 
    _role: 'admin' 
  });

  if (!isAdmin) {
    return { 
      success: false, 
      error: "Admin access required", 
      statusCode: 403,
      userId: authResult.userId,
      email: authResult.email,
      isAdmin: false 
    };
  }

  return { 
    ...authResult, 
    isAdmin: true 
  };
}

/**
 * Get client IP for rate limiting and audit logging
 */
export function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
         req.headers.get("x-real-ip") ||
         "unknown";
}

/**
 * Log security event to audit table
 */
export async function logSecurityEvent(
  supabase: SupabaseClient,
  eventType: string,
  details: {
    userId?: string;
    ip?: string;
    userAgent?: string;
    action?: string;
    outcome?: string;
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await supabase.from('security_audit_log').insert({
      event_type: eventType,
      user_id: details.userId,
      ip_address: details.ip,
      user_agent: details.userAgent,
      action: details.action,
      outcome: details.outcome,
      resource_type: details.resourceType,
      resource_id: details.resourceId,
      details: details.metadata,
    });
  } catch (error) {
    console.error('[Security] Failed to log security event:', error);
  }
}

// =============================================================================
// AI PROMPT INPUT SANITIZATION
// =============================================================================

/** Maximum length for different input types */
const INPUT_LIMITS = {
  name: 100,
  shortText: 200,
  mediumText: 500,
  longText: 2000,
  notes: 5000,
};

/** Patterns that may indicate prompt injection attempts */
const SUSPICIOUS_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions?/i,
  /ignore\s+(all\s+)?above/i,
  /disregard\s+(all\s+)?previous/i,
  /forget\s+(all\s+)?previous/i,
  /new\s+instructions?:/i,
  /system\s*prompt/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<<SYS>>/i,
  /<\|im_start\|>/i,
  /assistant:/i,
  /user:/i,
];

/**
 * Sanitize text input for use in AI prompts
 * - Removes control characters
 * - Limits length
 * - Strips potential injection patterns
 */
export function sanitizeForAI(
  text: string | undefined | null,
  maxLength: number = INPUT_LIMITS.mediumText
): string {
  if (!text) return "";
  
  let sanitized = text
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Normalize whitespace
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Trim
    .trim();
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength) + "...";
  }
  
  return sanitized;
}

/**
 * Check if input contains suspicious prompt injection patterns
 * Returns true if suspicious patterns detected
 */
export function detectPromptInjection(text: string | undefined | null): boolean {
  if (!text) return false;
  
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Sanitize a name field (stricter than general text)
 */
export function sanitizeName(name: string | undefined | null): string {
  if (!name) return "";
  
  return name
    // Remove anything that's not letters, spaces, hyphens, apostrophes
    .replace(/[^a-zA-Z\s\-'.\u00C0-\u024F\u1E00-\u1EFF]/g, "")
    .trim()
    .substring(0, INPUT_LIMITS.name);
}

/**
 * Validate and sanitize all fields in a Golden Visa input
 */
export interface GoldenVisaInput {
  fullName: string;
  nationality: string;
  currentResidence: string;
  investmentBudget: string;
  investmentType: string;
  timeline: string;
  familySize: number;
  additionalNotes?: string;
}

export function sanitizeGoldenVisaInput(input: GoldenVisaInput): GoldenVisaInput & { hasSuspiciousContent: boolean } {
  const hasSuspiciousContent = 
    detectPromptInjection(input.fullName) ||
    detectPromptInjection(input.nationality) ||
    detectPromptInjection(input.currentResidence) ||
    detectPromptInjection(input.additionalNotes);
  
  return {
    fullName: sanitizeName(input.fullName),
    nationality: sanitizeForAI(input.nationality, INPUT_LIMITS.shortText),
    currentResidence: sanitizeForAI(input.currentResidence, INPUT_LIMITS.shortText),
    investmentBudget: sanitizeForAI(input.investmentBudget, INPUT_LIMITS.shortText),
    investmentType: sanitizeForAI(input.investmentType, INPUT_LIMITS.shortText),
    timeline: sanitizeForAI(input.timeline, INPUT_LIMITS.shortText),
    familySize: Math.min(Math.max(1, Math.floor(Number(input.familySize) || 1)), 20),
    additionalNotes: sanitizeForAI(input.additionalNotes, INPUT_LIMITS.notes),
    hasSuspiciousContent,
  };
}

/**
 * Sanitize chat messages for AI assistant
 */
export function sanitizeChatMessages(messages: Array<{ role: string; content: string }>): Array<{ role: string; content: string }> {
  return messages.map(msg => ({
    role: msg.role === "user" || msg.role === "assistant" ? msg.role : "user",
    content: sanitizeForAI(msg.content, INPUT_LIMITS.longText),
  }));
}
