/***
Path: /kingskolossium/src/features/build/components/totals/SecondaryDamageStats.tsx
Created by: Christopher Echevarria
Date of creation: 06May2026
Purpose and Description: Secondary damage and resistance card — All Damage, Critical
  Damage/Resistance, Pushback, Trap Power/Damage. All equipment-only (base 0).
  Wrapped in liquid-glass island.
***/

import { useBuildStore }       from '../../stores/buildStore';
import { useHeaderStore }      from '../../../header/stores/headerStore';
import { useEquipmentTotals }  from '../../hooks/useEquipmentTotals';
import { STAT_GROUPS }         from '../../characteristicGroups';
import { StatRow }             from './StatRow';

export function SecondaryDamageStats() {
  const characteristics = useBuildStore(s => s.characteristics);
  const language        = useHeaderStore(s => s.language);
  const equipTotals     = useEquipmentTotals();
  const lang            = language as 'en' | 'fr' | 'es';

  return (
    <div className="liquid-glass rounded-xl p-3 flex flex-col gap-1.5">
      <span className="font-mono text-[9px] text-white/25 uppercase tracking-widest mb-0.5">
        {STAT_GROUPS.resistance.label}
      </span>
      {STAT_GROUPS.resistance.stats.map(({ characteristic_id, element_id, icon }) => {
        const char  = characteristics[characteristic_id];
        const label = char ? (char[`name_${lang}`] || char.name_en) : `[${characteristic_id}]`;
        const equipDelta = equipTotals[element_id] ?? 0;
        return (
          <StatRow
            key={characteristic_id}
            icon={icon}
            label={label}
            displayValue={equipDelta}
            equipDelta={equipDelta}
          />
        );
      })}
    </div>
  );
}