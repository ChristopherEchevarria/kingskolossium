/***
Path: kingskolossium/src/features/build/primaryStats.ts
Created by: Christopher Echevarria
Date of creation: 30Apr2026
Purpose and Description:
***/

import { STAT_GROUPS } from './characteristicGroups';

// ── Types ─────────────────────────────────────────────────────────────────
export type PrimaryStatId =
  | 'vitality' | 'strength' | 'intelligence'
  | 'chance'   | 'agility'  | 'wisdom';

// ── Stat ordering (drives render order in PrimaryStats subcomponent) ──────
export const PRIMARY_STAT_IDS: PrimaryStatId[] = [
  'vitality', 'strength', 'intelligence', 'chance', 'agility', 'wisdom',
];

// ── characteristic_id bridge (joins player points → equipment aggregation) ─
// Source of truth lives in characteristicGroups.ts — we derive from it here
// so there is exactly one place to update when 3.7 renames IDs.
const primaryGroupStats = STAT_GROUPS.primary.stats;

export const PRIMARY_STAT_CHAR_ID: Record<PrimaryStatId, number> = {
  vitality:     11,
  strength:     10,
  intelligence: 15,
  chance:       13,
  agility:      14,
  wisdom:       12,
};

// ── Point pool ────────────────────────────────────────────────────────────
export const TOTAL_STAT_POINTS = 995;  // level 200: (200-1) * 5

export const EMPTY_PRIMARY: Record<PrimaryStatId, number> = {
  vitality: 0, strength: 0, intelligence: 0, chance: 0, agility: 0, wisdom: 0,
};

// ── Cost functions ────────────────────────────────────────────────────────
const TIERED_RATES = [
  { limit: 100, rate: 1 },
  { limit: 100, rate: 2 },
  { limit: 100, rate: 3 },
  { limit: 98, rate: 4 },  // max 398 points for tiered stats
] as const;

export function totalPoolCost(stat: PrimaryStatId, value: number): number {
  if (stat === 'vitality') return value;
  if (stat === 'wisdom')   return value * 3;
  let cost = 0;
  let remaining = value;
  for (const tier of TIERED_RATES) {
    if (remaining <= 0) break;
    const used = Math.min(remaining, tier.limit);
    cost += used * tier.rate;
    remaining -= used;
  }
  return cost;
}

export function maxAllocatable(stat: PrimaryStatId, availablePool: number): number {
  if (stat === 'vitality') return Math.min(995, availablePool);
  if (stat === 'wisdom')   return Math.min(331, Math.floor(availablePool / 3));
  let pts = 0;
  let spent = 0;
  for (const tier of TIERED_RATES) {
    for (let i = 0; i < tier.limit; i++) {
      if (spent + tier.rate > availablePool) return pts;
      spent += tier.rate;
      pts++;
    }
  }
  return pts;
}