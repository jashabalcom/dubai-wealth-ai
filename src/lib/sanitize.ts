import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify with a strict configuration
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'a', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

/**
 * Sanitize markdown-converted HTML for lesson/post content
 */
export function sanitizeMarkdownHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'a', 'span', 'div',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ADD_ATTR: ['target'],
  });
}

/**
 * Escape HTML for plain text display (no HTML allowed)
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
