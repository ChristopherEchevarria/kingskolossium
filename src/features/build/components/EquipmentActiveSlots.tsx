// src/features/build/components/EquipmentActiveSlots.tsx
import { useBuildStore } from '../stores/buildStore';
import { EQUIP_ROW, DOFUS_ROW, SLOT_LABEL, SLOT_ACCEPTS, SLOT_SUPER_TYPE, type SlotId } from '../slots';
import { SUPER_TYPE_CARD_COLORS, DEFAULT_CARD_COLOR } from './card/cardColors';
import { API_BASE_URL } from '../../../api/client';
import type { EquipmentItem } from '../../../api/equipment';
import { BorderBeam } from 'border-beam';

// ── SlotCell ──────────────────────────────────────────────────────────────────

function SlotCell({ slotId }: { slotId: SlotId }) {
  const { equipped, unequip, equipToSlot, setActiveTypeFilters } = useBuildStore();
  const item = equipped[slotId];

  const isLegendary = (item?.effects ?? []).some(e => e.is_meta);
  const accentId    = item?.super_type_id ?? SLOT_ACCEPTS[slotId][0] ?? 0;
  const colors      = SUPER_TYPE_CARD_COLORS[accentId] ?? DEFAULT_CARD_COLOR;

  const handleClick = () => {
    if (item) {
      unequip(slotId);
    } else {
      const superType = SLOT_SUPER_TYPE[slotId];
      if (superType !== undefined) setActiveTypeFilters([superType]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json')) as {
        type: 'equipment'; item: EquipmentItem;
      };
      if (data.type !== 'equipment') return;
      const superTypeId = data.item.super_type_id ?? 0;
      if (!SLOT_ACCEPTS[slotId].includes(superTypeId)) return;
      equipToSlot(data.item, slotId);
    } catch { /* malformed drag data */ }
  };

  const cellContent = (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      title={item ? `${item.name} — click to unequip` : `${SLOT_LABEL[slotId]} — click to filter`}
      className="relative flex items-center justify-center rounded-lg
                 cursor-pointer transition-all duration-150 border
                 hover:brightness-125 w-full"
      style={{
        aspectRatio: '1 / 1',
        background:  item ? colors.bg     : 'rgba(255,255,255,0.03)',
        borderColor: item ? colors.border : 'rgba(255,255,255,0.08)',
      }}
    >
      {item ? (
        <img
          src={`${API_BASE_URL}/assets/items/${item.icon_id}-128.png`}
          alt={item.name}
          className="w-4/5 h-4/5 object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
        />
      ) : (
        <span
          className="font-mono text-[8px] text-center leading-tight px-0.5"
          style={{ color: 'rgba(255,255,255,0.18)' }}
        >
          {SLOT_LABEL[slotId]}
        </span>
      )}
    </div>
  );

  if (isLegendary) {
    return (
      <BorderBeam size="sm" colorVariant="colorful" duration={6} strength={1}>
        {cellContent}
      </BorderBeam>
    );
  }

  return cellContent;
}

// ── BreedCell ─────────────────────────────────────────────────────────────────

function BreedCell() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border
                 cursor-default select-none"
      style={{
        background:  'rgba(255,255,255,0.02)',
        borderColor: 'rgba(255,255,255,0.06)',
        // Width fixed so 8-col grid can use remaining space
        // Height matches 2 slot rows + gap between them
        minWidth: 52,
        width:    52,
        alignSelf: 'stretch',   // fills full height of the flex row
      }}
    >
      {/* Placeholder silhouette */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-7 h-7 mb-1"
        style={{ color: 'rgba(255,255,255,0.10)' }}
      >
        <circle cx="12" cy="8" r="4" fill="currentColor" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="currentColor" />
      </svg>
      <span
        className="font-mono text-[7px] text-center leading-tight"
        style={{ color: 'rgba(255,255,255,0.15)' }}
      >
        Breed
      </span>
    </div>
  );
}

// ── EquipmentActiveSlots ──────────────────────────────────────────────────────

export function EquipmentActiveSlots() {
  const { resetBuild } = useBuildStore();

  return (
    <div className="liquid-glass rounded-xl p-3 flex flex-col gap-2">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
          Equipment
        </span>
        <button
          onClick={resetBuild}
          title="Clear all slots"
          className="font-mono text-[10px] text-white/25 hover:text-[#E24B4A] transition-colors"
        >
          ↺ Clear
        </button>
      </div>

      {/* Body: breed column left + 8-col slot grid right */}
      <div className="flex gap-2 items-stretch">

        {/* Breed — tall single cell spanning both rows */}
        <BreedCell />

        {/* Equipment rows — 8 columns each */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {/* Row 1: helmet → weapon */}
          <div className="grid grid-cols-8 gap-1.5">
            {EQUIP_ROW.map(slotId => (
              <SlotCell key={slotId} slotId={slotId} />
            ))}
          </div>
          {/* Row 2: shield → dofus6 */}
          <div className="grid grid-cols-8 gap-1.5">
            {DOFUS_ROW.map(slotId => (
              <SlotCell key={slotId} slotId={slotId} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default EquipmentActiveSlots;