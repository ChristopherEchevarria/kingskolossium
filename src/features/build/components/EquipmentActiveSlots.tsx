// src/features/build/components/EquipmentActiveSlots.tsx
import { useBuildStore } from '../stores/buildStore';
import { useAuthStore } from '../../auth/stores/authStore';
import { createBuild, updateBuild } from '../../../api/builds';
import type { BuildSlots } from '../../../api/builds';
import { useState } from 'react';
import { EQUIP_ROW, DOFUS_ROW, SLOT_LABEL, SLOT_ACCEPTS, SLOT_SUPER_TYPE, type SlotId } from '../slots';
import { SUPER_TYPE_CARD_COLORS, DEFAULT_CARD_COLOR } from './card/cardColors';
import { API_BASE_URL } from '../../../api/client';
import type { EquipmentItem } from '../../../api/equipment';
import { BorderBeam } from 'border-beam';
import { usePopupStore }   from '../../common/popups/popupStore';
import { useHeaderStore }   from '../../header/stores/headerStore';
import { parseLookId } from '../../common/popups/BreedSelectorPopup';


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
  const { breedId, gender, breeds } = useBuildStore();
  const { openPopup }               = usePopupStore();
  const { language }                = useHeaderStore();


  const entry    = breeds.find(b => b.breed_id === breedId) ?? null;
  const look     = entry ? (gender === 'male' ? entry.male_look : entry.female_look) : null;
  const lookId   = parseLookId(look);
  const headSrc  = lookId
    ? `${API_BASE_URL}/api/assets/classes/Head_${lookId}-64.png?size=2x`
    : null;

  return (
    <div
      onClick={() => openPopup({ id: 'breed-selector', payload: {} })}
      title={entry ? `Class selected — click to change` : 'Click to select a class'}
      className="flex flex-col items-center justify-center rounded-lg border
                 cursor-pointer select-none transition-all duration-150 hover:brightness-125"
      style={{
        background:  entry ? 'rgba(91,124,247,0.10)' : 'rgba(255,255,255,0.02)',
        borderColor: entry ? 'rgba(91,124,247,0.35)' : 'rgba(255,255,255,0.06)',
        minWidth: 52,
        width:    52,
        alignSelf: 'stretch',
      }}
    >
      {headSrc ? (
        <img
          src={headSrc}
          alt={`breed-${breedId}`}
          className="w-10 h-10 object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }}
        />
      ) : (
        // Placeholder silhouette (unchanged from original)
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-7 h-7 mb-1"
          style={{ color: 'rgba(255,255,255,0.10)' }}
        >
          <circle cx="12" cy="8" r="4" fill="currentColor" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="currentColor" />
        </svg>
      )}
      <span
        className="font-mono text-[7px] text-center leading-tight mt-0.5"
        style={{ color: 'rgba(255,255,255,0.15)' }}
      >
      {entry
      ? (entry[`name_${language}` as 'name_en' | 'name_fr' | 'name_es'] ?? entry.name_en)
      : 'Class'}
      </span>
    </div>
  );
}

// ── EquipmentActiveSlots ──────────────────────────────────────────────────────

export function EquipmentActiveSlots() {
  const {
    resetBuild, equipped, breedId,
    currentBuildId, currentBuildName, currentBuildComment, currentBuildVisibility,
    setCurrentBuildId, setCurrentBuildName, setCurrentBuildComment, setCurrentBuildVis,
    upsertSavedBuild,
  } = useBuildStore();
  const { user } = useAuthStore();

  const canSave = user?.badge_status === 'loyal' || user?.badge_status === 'king';

  const [showForm, setShowForm]     = useState(false);
  const [saving,   setSaving]       = useState(false);
  const [toast,    setToast]        = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const slots = Object.fromEntries(
          Object.entries(equipped).map(([k, v]) => [
            k,
            v ? { item_id: v.item_id, icon_id: v.icon_id ?? 0 } : null,
          ])
      ) as BuildSlots;

      if (currentBuildId === null) {
        const created = await createBuild({
          name:       currentBuildName || 'Untitled Build',
          comment:    currentBuildComment || null,
          breed_id:   breedId,
          visibility: currentBuildVisibility,
          slots,
        });
        setCurrentBuildId(created.build_id);
        upsertSavedBuild(created);
        showToast('Build saved!');

      } else {
        const updated = await updateBuild(currentBuildId, {
          name:       currentBuildName || 'Untitled Build',
          comment:    currentBuildComment || null,
          breed_id:   breedId,
          visibility: currentBuildVisibility,
          slots,
        });
        upsertSavedBuild(updated);
        showToast('Build updated!');
      }
      setShowForm(false);
    } catch {
      showToast('Save failed — please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetBuild();
    setCurrentBuildId(null);
    setCurrentBuildName('');
    setCurrentBuildComment('');
    setCurrentBuildVis('private');
    setShowForm(false);
  };

  return (
    <div className="liquid-glass rounded-xl p-3 flex flex-col gap-2">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
          Equipment
        </span>
        <button
          onClick={handleReset}
          title="Clear all slots"
          className="font-mono text-[10px] text-white/25 hover:text-[#E24B4A] transition-colors"
        >
          ↺ Clear
        </button>
      </div>

      {/* Body: breed column left + 8-col slot grid right */}
      <div className="flex gap-2 items-stretch">
        <BreedCell />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="grid grid-cols-8 gap-1.5">
            {EQUIP_ROW.map(slotId => <SlotCell key={slotId} slotId={slotId} />)}
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {DOFUS_ROW.map(slotId => <SlotCell key={slotId} slotId={slotId} />)}
          </div>
        </div>
      </div>

      {/* Save button — Loyal/King only */}
      {canSave && (
        <div className="flex flex-col gap-2 pt-1 border-t border-white/[0.06]">
          <button
            onClick={() => setShowForm(f => !f)}
            className="font-mono text-[10px] text-white/40 hover:text-white/70
                       transition-colors uppercase tracking-widest text-left px-1"
          >
            {showForm ? '▲ Hide' : '▼ Save Build'}
          </button>

          {showForm && (
            <div className="flex flex-col gap-2 px-1">
              {/* Name */}
              <input
                type="text"
                maxLength={64}
                placeholder="Build name (required)"
                value={currentBuildName}
                onChange={e => setCurrentBuildName(e.target.value)}
                className="w-full rounded-md px-2 py-1 font-mono text-[11px]
                           bg-white/[0.05] border border-white/10 text-white/80
                           placeholder:text-white/20 focus:outline-none focus:border-white/25"
              />
              {/* Comment */}
              <textarea
                maxLength={256}
                placeholder="Comment (optional)"
                value={currentBuildComment}
                onChange={e => setCurrentBuildComment(e.target.value)}
                rows={2}
                className="w-full rounded-md px-2 py-1 font-mono text-[11px]
                           bg-white/[0.05] border border-white/10 text-white/80
                           placeholder:text-white/20 focus:outline-none focus:border-white/25
                           resize-none"
              />
              {/* Visibility toggle */}
              <div className="flex gap-2">
                {(['private', 'shareable'] as const).map(vis => (
                  <button
                    key={vis}
                    onClick={() => setCurrentBuildVis(vis)}
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-colors capitalize
                      ${currentBuildVisibility === vis
                        ? 'border-white/30 text-white/80 bg-white/10'
                        : 'border-white/10 text-white/30 hover:text-white/50'
                      }`}
                  >
                    {vis}
                  </button>
                ))}
              </div>
              {/* Submit */}
              <button
                onClick={handleSave}
                disabled={saving || !currentBuildName.trim()}
                className="font-mono text-[11px] px-3 py-1 rounded-md
                           bg-white/10 hover:bg-white/15 border border-white/15
                           text-white/70 hover:text-white/90 transition-all
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : currentBuildId ? 'Update Build' : 'Save Build'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="font-mono text-[10px] text-white/60 text-center px-1">
          {toast}
        </div>
      )}

    </div>
  );
}

export default EquipmentActiveSlots;