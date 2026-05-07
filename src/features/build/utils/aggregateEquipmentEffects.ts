/***
Path: /kingskolossium/src/features/build/utils/aggregateEquipmentEffects.ts
Created by: Christopher Echevarria
Date of creation: 06May2026
Purpose and Description: Pure function that sums equipment effects keyed by element_id.
  No React, no Zustand — fully testable in isolation.
  Single source of truth for all equipment summation used across TOTALS subcomponents.
***/

import type { EquipmentItem } from '../../../api/equipment';
import type { SlotId }        from '../slots';

/**
 * Sums all equipment effects across all slots.
 * Keys the result by element_id — always populated on MappedEffect.
 *
 * Rules:
 * - is_meta effects are skipped (passive/internal engine effects, not display stats)
 * - element_id === 0 is skipped (sentinel for unclassified effects)
 * - min_max_irrelevant === -1 → use eff.min (AP, MP, Range, Summons pattern)
 * - All other effects → use eff.max
 *
 * @param equipped  Record<SlotId, EquipmentItem | null> from buildStore
 * @returns         Record<elementId, summedValue>
 */

 export function aggregateEffects(
  equipped: Record<SlotId, EquipmentItem | null>
): Record<number, number> {
  const characteristic_totals: Record<number, number> = {};

  Object.values(equipped).forEach(item => {
    if (!item) return;

    (item.effects ?? []).forEach(eff => {
      if (eff.is_meta)     return;
      if (!eff.element_id) return;  // drops 0 and null/undefined

      const value = eff.min_max_irrelevant === -1 ? eff.min : eff.max;
      characteristic_totals[eff.element_id] = (characteristic_totals[eff.element_id] ?? 0) + value;
    });
  });

  return characteristic_totals;
}