/**
 * Input validation utilities for security
 */

// Sanitize HTML to prevent XSS
export function sanitizeHtml(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Validate phone number (basic international format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{8,20}$/;
  return phoneRegex.test(phone);
}

// Validate UUID format
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Validate and sanitize URL
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Sanitize for database queries (basic SQL injection prevention)
export function sanitizeForQuery(input: string): string {
  return input.replace(/[';\\]/g, '');
}

// Validate price input
export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && price <= 1000000000 && Number.isFinite(price);
}

// Validate area/size input
export function isValidArea(area: number): boolean {
  return typeof area === 'number' && area >= 0 && area <= 100000 && Number.isFinite(area);
}

// Validate percentage input
export function isValidPercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100 && Number.isFinite(value);
}

// Truncate string to max length safely
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

// Validate and constrain pagination
export function validatePagination(page: number, limit: number): { page: number; limit: number } {
  return {
    page: Math.max(1, Math.floor(page) || 1),
    limit: Math.min(100, Math.max(1, Math.floor(limit) || 10)),
  };
}

// Escape regex special characters
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Validate search query
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .slice(0, 200) // Max 200 chars
    .replace(/[<>]/g, ''); // Remove potential HTML
}
