/***
Path: /kingskolossium/src/features/build/components/TotalCharacteristics.tsx
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: Displays summed characteristic totals across all equipped items.
  Two independent data streams:
  - Reference data (labels + icons) from buildStore.characteristics — static after mount.
  - Transactional data (values) from useEquipmentTotals hook — recalculated on equip changes.
  Aggregation key: eff.element_id (always populated on MappedEffect).
  Label resolution: characteristic_id → characteristics store.
  Color logic: driven by equipment delta via statColor() — grey=no contribution, green=positive, red=negative.
***/

import { useBuildStore }                              from '../stores/buildStore';
import { useHeaderStore }                             from '../../header/stores/headerStore';
import { STAT_GROUPS }                                from '../characteristicGroups';
import { useEquipmentTotals }                         from '../hooks/useEquipmentTotals';
import { statColor, totalStatValue }                  from '../utils/combatBaseValues';
import { CHARACTERISTIC_ICON_BASE,
         CHARACTERISTIC_ICON_FALLBACK }               from '../utils/effectUtils';

// ── StatRow ───────────────────────────────────────────────────────────────────
interface StatRowProps {
  icon:          string;
  label:         string;
  displayValue:  number;   // base + equipment delta (what the player sees)
  equipDelta:    number;   // equipment contribution only (drives color)
}

function StatRow({ icon, label, displayValue, equipDelta }: StatRowProps) {
  const color = statColor(equipDelta);
  const url   = `${CHARACTERISTIC_ICON_BASE}/${icon}`;

  return (
    <div className="grid grid-cols-[16px,1fr,auto] gap-x-2 items-center">
      <img
        src={url}
        alt=""
        className="w-4 h-4 object-contain flex-shrink-0"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = CHARACTERISTIC_ICON_FALLBACK; }}
      />
      <span className="font-mono text-[10px] text-white/50 truncate">{label}</span>
      <span
        className="font-mono text-[10px] font-bold tabular-nums"
        style={{ color }}
      >
        {displayValue > 0 ? `+${displayValue}` : displayValue}
      </span>
    </div>
  );
}

// ── TotalCharacteristics ──────────────────────────────────────────────────────
export function TotalCharacteristics() {
  const characteristics = useBuildStore(s => s.characteristics);
  const characterLevel  = useBuildStore(s => s.characterLevel);
  const language        = useHeaderStore(s => s.language);
  const equipTotals     = useEquipmentTotals();

  return (
    <div className="liquid-glass rounded-xl p-3 flex flex-col gap-2">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
          Totals
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {Object.entries(STAT_GROUPS).map(([groupKey, group]) => (
          <div key={groupKey} className="flex flex-col gap-1">
            <span className="font-mono text-[9px] text-white/25 uppercase tracking-widest px-1">
              {group.label}
            </span>
            <div className="flex flex-col gap-1 px-1">
              {group.stats.map(({ characteristic_id, element_id, icon }) => {
                const char  = characteristics[characteristic_id];
                const lang  = language as 'en' | 'fr' | 'es';
                const label = char
                  ? (char[`name_${lang}`] || char.name_en)
                  : `[${characteristic_id}]`;

                const equipDelta   = equipTotals[element_id] ?? 0;
                const displayValue = totalStatValue(element_id, equipDelta, characterLevel);

                return (
                  <StatRow
                    key={characteristic_id}
                    icon={icon}
                    label={label}
                    displayValue={displayValue}
                    equipDelta={equipDelta}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TotalCharacteristics;