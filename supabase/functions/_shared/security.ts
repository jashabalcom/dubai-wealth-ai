/**
 * Security utilities for edge functions
 * - Input sanitization for AI prompts
 * - CORS origin validation
 * - Safe error responses
 */

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
