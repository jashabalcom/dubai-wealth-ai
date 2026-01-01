/**
 * Normalizes database urgency_level values to UI-supported values.
 * Database may contain: 'breaking', 'high', 'normal', 'evergreen', null, or unknown values.
 * UI supports: 'urgent', 'important', 'normal'
 */

export type UrgencyLevel = 'normal' | 'important' | 'urgent';

export function normalizeUrgencyLevel(dbValue: string | null | undefined): UrgencyLevel {
  if (!dbValue) return 'normal';
  
  const normalized = dbValue.toLowerCase().trim();
  
  switch (normalized) {
    case 'breaking':
    case 'urgent':
      return 'urgent';
    case 'high':
    case 'important':
      return 'important';
    case 'normal':
    case 'evergreen':
    case 'low':
    default:
      return 'normal';
  }
}
