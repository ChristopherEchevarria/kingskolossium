/***
Path: /kingskolossium/src/features/build/utils/combatBaseValues.ts
Created by: Christopher Echevarria
Date of creation: 06May2026
Purpose and Description: Pure helpers for stats that have a level-dependent or fixed
  base value independent of equipment. Used by CombatStats and PrimaryStats subcomponents
  to determine displayed totals and value color (grey = no equipment delta).

  Base values:
    AP         — 6 at levels 1–99, 7 at levels 100+
    MP         — always 3
    Vitality   — 55 + (level - 1) * 5   (55 at lvl 1, 1050 at lvl 200)
    Prospecting — always 100
    Pods       — always 1000
***/

// ── Base value helpers ────────────────────────────────────────────────────────
export function baseAP(level: number): number {
  return level >= 100 ? 7 : 6;
}

export function baseMP(): number {
  return 3;
}

export function baseVitality(level: number): number {
  return 55 + (level - 1) * 5;
}

export function baseProspecting(): number {
  return 100;
}

export function basePods(): number {
  return 1000;
}

// ── element_id constants for base-value stats ─────────────────────────────────
// Kept here so subcomponents don't hard-code magic numbers.
// Must match characteristicGroups.ts entries.
export const ELEMENT_ID_AP          = 12;
export const ELEMENT_ID_MP          = 8;
export const ELEMENT_ID_VITALITY    = 9;
export const ELEMENT_ID_PROSPECTING = 25;
export const ELEMENT_ID_PODS        = 220;

// ── Color logic ───────────────────────────────────────────────────────────────

/**
 * Returns the Tailwind-compatible hex color for a stat value cell.
 *
 * Color rules (driven by equipment delta, not displayed total):
 *   equipmentDelta === 0  → grey   (base value only, no equipment contribution)
 *   equipmentDelta  > 0  → green
 *   equipmentDelta  < 0  → red
 */
export function statColor(equipmentDelta: number): string {
  if (equipmentDelta > 0) return '#4ade80';  // green-400
  if (equipmentDelta < 0) return '#f87171';  // red-400
  return '#6b7280';                          // gray-500
}

/**
 * Computes the total displayed value for a stat.
 * For stats with a base value, adds the base. For equipment-only stats, returns delta.
 *
 * @param elementId       element_id of the stat
 * @param equipDelta      summed equipment contribution (from useEquipmentTotals)
 * @param level           current character level (from buildStore.characterLevel)
 */

 export function totalStatValue(
  elementId: number,
  equipDelta: number,
  level: number
): number {
  switch (elementId) {
    case ELEMENT_ID_AP:          return baseAP(level)          + equipDelta;
    case ELEMENT_ID_MP:          return baseMP()               + equipDelta;
    case ELEMENT_ID_VITALITY:    return baseVitality(level)    + equipDelta;
    case ELEMENT_ID_PROSPECTING: return baseProspecting()      + equipDelta;
    case ELEMENT_ID_PODS:        return basePods()             + equipDelta;
    default:                     return equipDelta;
  }
}