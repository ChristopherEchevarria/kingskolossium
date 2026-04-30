/***
Path: /kingskolossium/src/features/build/utils/effectUtils.ts
Created by: Christopher Echevarria
Date of creation: 30Apr2026
Purpose and Description: Shared utilities for equipment effect rendering.
  Centralizes icon URL derivation so EffectRow and TotalCharacteristics
  use identical logic without duplication.
***/

import { API_BASE_URL } from '../../../api/client';

export const CHARACTERISTIC_ICON_BASE = `${API_BASE_URL}/assets/characteristic-icons`;
export const CHARACTERISTIC_ICON_FALLBACK = `${CHARACTERISTIC_ICON_BASE}/24-64.png`;

/**
 * Derives the icon URL from the English effect type name.
 * Convention: "type.en" → lowercase → spaces to underscores → .png
 * e.g. "Spell Damage" → "spell_damage.png"
 *      "Vitality"     → "vitality.png"
 *
 * Returns null for spell-modifier effects (start with ':' or '/')
 * which have no characteristic icon.
 */
export function iconUrlFromTypeEn(typeEn: string): string | null {
  if (!typeEn || typeEn.includes(':') || typeEn.startsWith('/')) return null;
  const keyword = typeEn.toLowerCase().replace(/\s+/g, '_');
  return `${CHARACTERISTIC_ICON_BASE}/${keyword}.png`;
}