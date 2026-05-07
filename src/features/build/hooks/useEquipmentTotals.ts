/***
Path: /kingskolossium/src/features/build/hooks/useEquipmentTotals.ts
Created by: Christopher Echevarria
Date of creation: 06May2026
Purpose and Description: Memoized selector hook that subscribes to buildStore.equipped
  and returns aggregated element_id → value totals.
  All TOTALS subcomponents call this one hook so aggregation runs once per equip change,
  not once per subcomponent.
***/

import { useMemo }           from 'react';
import { useBuildStore }     from '../stores/buildStore';
import { aggregateEffects }  from '../utils/aggregateEquipmentEffects';

/**
 * Returns the current summed equipment totals keyed by element_id.
 * Re-computes only when the equipped record changes.
 *
 * Usage:
 *   const totals = useEquipmentTotals();
 *   const vitality = totals[9] ?? 0;  // element_id 9 = Vitality
 */

 export function useEquipmentTotals(): Record<number, number> {
  const equipped = useBuildStore(s => s.equipped);
  return useMemo(() => aggregateEffects(equipped), [equipped]);
}