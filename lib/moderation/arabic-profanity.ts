export {
  ARABIC_PROFANITY_WORDS,
  ARABIC_OFFENSIVE_PHRASES,
  CRITICAL_PROFANITY,
  HIGH_SEVERITY,
} from './arabic-profanity-data';

export type ModerationSeverity = 'clean' | 'critical' | 'high' | 'medium' | 'low';

export interface ModerationResult {
  severity: ModerationSeverity;
  requiresReview: boolean;
  isBlocked: boolean;
}

export const MODERATION_ERROR_AR =
  'يحتوي النص على ألفاظ غير لائقة. يرجى تعديله وإعادة المحاولة.';
