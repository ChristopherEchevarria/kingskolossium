/***
Path:/kingskolossium/src/features/build/components/EquipmentFilter.tsx
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: Type filter pills colored by super_type_id. Multi-select toggle.
                         "All" button active when no filters selected. Alphabetically sorted.
                         Colors exclude blue shades (reserved for website brand).
***/

import { useBuildStore, EQUIPMENT_SUPER_TYPE_IDS } from '../stores/buildStore';

// ─── Pill colors by super_type_id ────────────────────────────────────────────
//  1  Amulet        → pink
//  2  Weapons        → coral
//  3  Ring           → amber
//  4  Belt           → green
//  5  Boots          → purple
//  7  Shield         → gray
// 10  Hat            → red
// 11  Cloak          → teal
// 12  Mount/Pet      → gold
// 13  Dofus/Trophy   → deep purple

const PILL_COLORS: Record<number, {
  idle:   { bg: string; border: string; text: string };
  active: { bg: string; border: string; text: string };
}> = {
  1:  { idle: { bg: 'rgba(212,83,126,0.12)',  border: 'transparent',    text: '#D4537E' },
        active: { bg: 'rgba(212,83,126,0.55)',  border: '#D4537E',       text: '#fff' } },
  2:  { idle: { bg: 'rgba(216,90,48,0.12)',   border: 'transparent',    text: '#D85A30' },
        active: { bg: 'rgba(216,90,48,0.55)',   border: '#D85A30',       text: '#fff' } },
  3:  { idle: { bg: 'rgba(186,117,23,0.12)',  border: 'transparent',    text: '#BA7517' },
        active: { bg: 'rgba(186,117,23,0.55)',  border: '#BA7517',       text: '#fff' } },
  4:  { idle: { bg: 'rgba(99,153,34,0.12)',   border: 'transparent',    text: '#639922' },
        active: { bg: 'rgba(99,153,34,0.55)',   border: '#639922',       text: '#fff' } },
  5:  { idle: { bg: 'rgba(127,119,221,0.12)', border: 'transparent',    text: '#7F77DD' },
        active: { bg: 'rgba(127,119,221,0.55)', border: '#7F77DD',       text: '#fff' } },
  7:  { idle: { bg: 'rgba(136,135,128,0.12)', border: 'transparent',    text: '#888780' },
        active: { bg: 'rgba(136,135,128,0.55)', border: '#888780',       text: '#fff' } },
  10: { idle: { bg: 'rgba(226,75,74,0.12)',   border: 'transparent',    text: '#E24B4A' },
        active: { bg: 'rgba(226,75,74,0.55)',   border: '#E24B4A',       text: '#fff' } },
  11: { idle: { bg: 'rgba(29,158,117,0.12)',  border: 'transparent',    text: '#1D9E75' },
        active: { bg: 'rgba(29,158,117,0.55)',  border: '#1D9E75',       text: '#fff' } },
  12: { idle: { bg: 'rgba(239,159,39,0.12)',  border: 'transparent',    text: '#EF9F27' },
        active: { bg: 'rgba(239,159,39,0.55)',  border: '#EF9F27',       text: '#fff' } },
  13: { idle: { bg: 'rgba(83,74,183,0.12)',   border: 'transparent',    text: '#534AB7' },
        active: { bg: 'rgba(83,74,183,0.55)',   border: '#534AB7',       text: '#fff' } },
};

const FALLBACK_PILL = {
  idle:   { bg: 'rgba(91,192,245,0.10)', border: 'transparent', text: '#5BC0F5' },
  active: { bg: 'rgba(91,192,245,0.50)', border: '#5BC0F5',     text: '#fff' },
};

export function EquipmentFilter() {
  const { equipmentTypes, activeTypeFilters, toggleTypeFilter, resetTypeFilters } = useBuildStore();

  // Equipment-only types, sorted alphabetically
  const pills = equipmentTypes
    .filter(t => EQUIPMENT_SUPER_TYPE_IDS.has(t.super_type_id))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (pills.length === 0) return null;

  const hasActiveFilters = activeTypeFilters.size > 0;

  return (
    <div className="liquid-glass rounded-xl px-3 py-2 flex flex-wrap gap-1.5">
      {/* "All" pill — highlighted when no filters selected */}
      <button
        onClick={resetTypeFilters}
        style={
          !hasActiveFilters
            ? { background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }
            : { background: 'rgba(255,255,255,0.05)', borderColor: 'transparent', color: 'rgba(255,255,255,0.35)' }
        }
        className="
          h-6 px-2.5 rounded-md text-[10px] font-mono font-bold
          transition-all duration-150 border
          flex items-center justify-center
        "
      >
        All
      </button>

      {/* Type pills */}
      {pills.map((t) => {
        const isActive = activeTypeFilters.has(t.type_id);
        const colorSet = PILL_COLORS[t.super_type_id] ?? FALLBACK_PILL;
        const colors = isActive ? colorSet.active : colorSet.idle;

        return (
          <button
            key={t.type_id}
            onClick={() => toggleTypeFilter(t.type_id)}
            title={`${t.name} (${t.item_count} items)`}
            style={{
              background: colors.bg,
              borderColor: colors.border,
              color: colors.text,
            }}
            className="
              h-6 px-2 rounded-md text-[10px] font-mono font-bold
              transition-all duration-150 border
              flex items-center justify-center
              hover:brightness-125
            "
          >
            {t.name}
          </button>
        );
      })}
    </div>
  );
}

export default EquipmentFilter;