/**
 * Escape HTML special characters to prevent HTML injection in emails
 * This is critical for security when embedding user-provided content in HTML emails
 */
export function escapeHtml(text: string | undefined | null): string {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

/**
 * Escape HTML but preserve line breaks as <br> tags
 * Use for multi-line user content like messages
 */
export function escapeHtmlPreserveBreaks(text: string | undefined | null): string {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

/**
 * Escape for use in email subject lines
 * Strips all HTML and dangerous characters
 */
export function escapeEmailSubject(text: string | undefined | null): string {
  if (!text) return '';
  
  return text
    .replace(/[<>]/g, '')
    .replace(/[\r\n]/g, ' ')
    .trim()
    .substring(0, 200); // Limit subject length
}
