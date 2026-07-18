import {
  ARABIC_OFFENSIVE_PHRASES,
  ARABIC_PROFANITY_WORDS,
  CRITICAL_PROFANITY,
  HIGH_SEVERITY,
} from './arabic-profanity-data';
import { MODERATION_ERROR_AR, type ModerationResult } from './arabic-profanity';

function normalizeArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u0652\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .toLowerCase()
    .trim()
    .replace(/[0-9!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]/g, ' ')
    .replace(/\s+/g, ' ');
}

function includesTerm(normalized: string, term: string): boolean {
  const normalizedTerm = normalizeArabicText(term);
  if (!normalizedTerm) return false;
  return normalized.includes(normalizedTerm);
}

export function moderateArabicText(text: string): ModerationResult {
  const normalized = normalizeArabicText(text);
  if (!normalized) {
    return { severity: 'clean', requiresReview: false, isBlocked: false };
  }

  if (CRITICAL_PROFANITY.some((word) => includesTerm(normalized, word))) {
    return { severity: 'critical', requiresReview: true, isBlocked: true };
  }

  if (HIGH_SEVERITY.some((word) => includesTerm(normalized, word))) {
    return { severity: 'high', requiresReview: true, isBlocked: false };
  }

  if (ARABIC_OFFENSIVE_PHRASES.some((phrase) => includesTerm(normalized, phrase))) {
    return { severity: 'medium', requiresReview: true, isBlocked: false };
  }

  if (ARABIC_PROFANITY_WORDS.some((word) => includesTerm(normalized, word))) {
    return { severity: 'low', requiresReview: true, isBlocked: false };
  }

  return { severity: 'clean', requiresReview: false, isBlocked: false };
}

export function assertContentAllowed(...parts: Array<string | null | undefined>): void {
  const combined = parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join('\n');

  const result = moderateArabicText(combined);
  if (result.isBlocked) {
    throw new Error(MODERATION_ERROR_AR);
  }
}
