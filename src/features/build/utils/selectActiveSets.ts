/***
 * Path: /kingskolossium/src/features/build/utils/selectActiveSets.ts
 * Created by: Christopher Echevarria
 * Date of creation: 08May2026
 * Purpose and Description: Pure function that derives ActiveSet[] from the
 *   full sets index and the current equipped record.
 *   No React, no Zustand — fully testable in isolation.
 *   A set is active when >= 2 of its item_ids are currently equipped.
 ***/

import type { MappedSet, ActiveSet } from '../../../api/sets';
import type { EquipmentItem }        from '../../../api/equipment';
import type { SlotId }               from '../slots';

/**
 * Derives which sets are active from the current equipped state.
 *
 * Rules:
 * - A set is active when equippedCount >= 2
 * - tier === equippedCount (matches the effects tier key)
 * - Sets with tier "1" always have empty effects — never included
 * - equippedItemIds preserves insertion order (slot order) for display
 *
 * @param setsIndex  Full MappedSet[] loaded once at session start
 * @param equipped   Current Record<SlotId, EquipmentItem | null> from buildStore
 * @returns          ActiveSet[] sorted by tier descending, then set_id ascending
 */
export function selectActiveSets(
  setsIndex:  MappedSet[],
  equipped:   Record<SlotId, EquipmentItem | null>,
): ActiveSet[] {
  // Build a Set<number> of all currently equipped item_ids for O(1) lookup
  const equippedItemIdSet = new Set<number>(
    Object.values(equipped)
      .filter((item): item is EquipmentItem => item !== null)
      .map(item => item.item_id)
  );

  const result: ActiveSet[] = [];

  for (const set of setsIndex) {
    const equippedItemIds = set.item_ids.filter(id => equippedItemIdSet.has(id));
    const tier = equippedItemIds.length;

    if (tier < 2) continue;   // tier 1 = no bonus, tier 0 = not active

    result.push({ set, equippedItemIds, tier });
  }

  // Sort: highest tier first (most pieces equipped), ties broken by set_id
  result.sort((a, b) => b.tier - a.tier || a.set.set_id - b.set.set_id);

  return result;
}