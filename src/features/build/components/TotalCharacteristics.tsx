/***
Path: /kingskolossium/src/features/build/components/TotalCharacteristics.tsx
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: Displays summed characteristic totals across all equipped items.
  Two independent data streams:
  - Reference data (labels + icons) from buildStore.characteristics — static after mount.
  - Transactional data (values) from buildStore.equipped — recalculated on equip changes.
***/

import { useMemo }                                    from 'react';
import { useBuildStore }                              from '../stores/buildStore';
import { useHeaderStore }                             from '../../header/stores/headerStore';
import { STAT_GROUPS }                                from '../characteristicGroups';
import { CHARACTERISTIC_ICON_BASE,
         CHARACTERISTIC_ICON_FALLBACK }               from '../utils/effectUtils';

// ── StatRow ───────────────────────────────────────────────────────────────
interface StatRowProps {
  icon:  string;  // from characteristics table — drives icon filename
  label:   string;  // already resolved to correct language by parent
  value:   number;  // sum from equipTotals, 0 when no item contributes
}

function StatRow({ icon, label, value }: StatRowProps) {
  const isNegative = value < 0;
  const url = `${CHARACTERISTIC_ICON_BASE}/${icon}`;

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
        style={{ color: isNegative ? '#f87171' : '#4ade80' }}
      >
        {value > 0 ? `+${value}` : value}
      </span>
    </div>
  );
}

// ── TotalCharacteristics ──────────────────────────────────────────────────
export function TotalCharacteristics() {
  // Stream 1 — Reference data: labels + icons, static after BuildPage mount
  const characteristics = useBuildStore(s => s.characteristics);

  // Stream 2 — Transactional data: numeric values, reactive to equipped changes
  const equipped = useBuildStore(s => s.equipped);
  const language = useHeaderStore(s => s.language);

  const equipTotals = useMemo<Record<number, number>>(() => {

    const acc: Record<number, number> = {};
    Object.values(equipped).forEach(item => {
      if (!item) return;
      console.log('[item effects raw]', item.name, item.effects?.map(e => ({
        type_en: e.type.en,
        element_id: e.element_id,
        max: e.max,
        effective_value: (e.min_max_irrelevant === -1 ? e.min : e.max)
      })));

      (item.effects ?? []).forEach(eff => {
        if (eff.is_meta) return;
        const value = eff.min_max_irrelevant === -1 ? eff.min : eff.max;
        acc[eff.element_id] = (acc[eff.element_id] ?? 0) + value;

      });
    });
    return acc;
  }, [equipped]);

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
              {group.stats.map(({ characteristic_id,element_id, icon }) => {
                const char  = characteristics[characteristic_id];
                const lang  = language as 'en' | 'fr' | 'es';
                const label = char
                  ? (char[`name_${lang}`] || char.name_en)
                  : `[${characteristic_id}]`;

                const value = equipTotals[element_id] ?? 0;
                return (
                  <StatRow
                    key={characteristic_id}
                    icon={icon}
                    label={label}
                    value={value}
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