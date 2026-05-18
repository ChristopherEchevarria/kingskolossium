/***
 * Path: kingskolossium/src/features/build/components/BuildCard.tsx
 * Created by: Christopher Echevarria
 * Date of creation: 14May2026
 * Purpose and Description: Displays a saved build as a card inside HamburgerBuildsPanel.
 *   Handles Edit (hydrates BuildPage slots), Share (clipboard copy), and Delete (with confirm).
 ***/

import { useState }              from 'react';
import { useBuildStore }         from '../stores/buildStore';
import { useAuthStore }          from '../../auth/stores/authStore';
import { deleteBuild }           from '../../../api/builds';
import { fetchEquipmentDetail }  from '../../../api/equipment';
import { API_BASE_URL }          from '../../../api/client';
import type { Build, SlotEntry }            from '../../../api/builds';
import { parseLookId }             from '../../common/popups/BreedSelectorPopup';
import type { SlotId }           from '../slots';
import { SLOT_ROWS }             from '../slots';

interface BuildCardProps {
  build:     Build;
  onEditing: () => void;   // called after slots are hydrated — closes menu, switches to Build mode
  onDeleted: () => void;   // called after DELETE succeeds — removes card from list
}

const ALL_SLOTS = SLOT_ROWS.flat() as SlotId[];

export function BuildCard({ build, onEditing, onDeleted }: BuildCardProps) {
  const { loadBuild, equipToSlot, setCurrentBuildId, breeds } = useBuildStore();
  const { user }                                       = useAuthStore();

  const [hydrating,  setHydrating]  = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [copied,     setCopied]     = useState(false);

  // ── Edit — hydrate all slots then hand off ────────────────────────────────
  const handleEdit = async () => {
    setHydrating(true);
    try {
      // 1. Clear grid + load metadata
      loadBuild(build);

      // 2. For each non-null slot, fetch the full EquipmentItem and equip it
      const entries = ALL_SLOTS
          .map(slotId => ({ slotId, entry: build.slots[slotId] }))
          .filter((e): e is { slotId: SlotId; entry: SlotEntry } => e.entry != null)
          .map(({ slotId, entry }) => ({ slotId, itemId: entry.item_id }));

      await Promise.all(
          entries.map(async ({ slotId, itemId }) => {
            const item = await fetchEquipmentDetail(itemId);
            equipToSlot(item, slotId);
          })
        );

      // 3. Confirm build is now "saved" (editing existing)
      setCurrentBuildId(build.build_id);
      onEditing();
    } catch {
      // Partial hydration is acceptable — user can re-equip missing items
      setCurrentBuildId(build.build_id);
      onEditing();
    } finally {
      setHydrating(false);
    }
  };

  // ── Share — copy URL to clipboard ────────────────────────────────────────
  const handleShare = async () => {
    const url = `https://kingskolossium.com/build/${build.build_id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBuild(build.build_id);
      onDeleted();
    } catch {
      setDeleting(false);
      setConfirmDel(false);
    }
  };

  const breedEntry  = breeds.find(b => b.breed_id === build.breed_id) ?? null;
  const breedLookId = parseLookId(breedEntry?.male_look ?? null);  // male as display default
  const breedSrc    = breedLookId
    ? `${API_BASE_URL}/api/assets/classes/Head_${breedLookId}-64.png?size=2x`
    : null;

  // ── Slot preview strip — first 8 non-null slots ───────────────────────────
  const previewSlots = ALL_SLOTS
    .map(slotId => ({ slotId, entry: build.slots[slotId] }))
    .filter((s): s is { slotId: SlotId; entry: SlotEntry } =>
      s.entry != null           // ← loose equality catches both null AND undefined
    )



  const formattedDate = new Date(build.updated_at).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="liquid-glass rounded-xl p-3 flex flex-col gap-2">

      {/* Top row — name + level badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[12px] text-white/80 leading-tight truncate">
          {build.name}
        </span>
        <span className="font-mono text-[9px] text-white/30 border border-white/10
                         rounded px-1.5 py-0.5 shrink-0">
          Lv {build.level}
        </span>
      </div>

      {/* Comment — 2-line clamp */}
      {build.comment && (
        <p className="font-mono text-[10px] text-white/40 leading-snug"
           style={{ display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {build.comment}
        </p>
      )}

      {/* Slot preview strip */}
      {(breedSrc || previewSlots.length > 0) && (
        <div className="flex gap-1 flex-wrap items-center">
          {breedSrc && (
            <img
              src={breedSrc}
              alt="breed"
              className="w-6 h-6 object-contain opacity-70"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          {previewSlots.map(({ slotId, entry }) => (
            <img
              key={slotId}
              src={`${API_BASE_URL}/assets/items/${entry.icon_id}-128.png`}
              alt={slotId}
              className="w-6 h-6 object-contain opacity-70"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ))}
        </div>
      )}

      {/* Meta row — visibility chip + date */}
      <div className="flex items-center gap-2">
        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border capitalize
          ${build.visibility === 'shareable'
            ? 'border-blue-400/30 text-blue-300/60'
            : 'border-white/10 text-white/25'
          }`}>
          {build.visibility}
        </span>
        <span className="font-mono text-[9px] text-white/20 ml-auto">
          {formattedDate}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-1.5 pt-0.5 border-t border-white/[0.06]">

        {/* Edit */}
        <button
          onClick={handleEdit}
          disabled={hydrating}
          className="font-mono text-[10px] px-2 py-0.5 rounded border border-white/10
                     text-white/40 hover:text-white/70 hover:border-white/20
                     transition-colors disabled:opacity-40"
        >
          {hydrating ? '…' : 'Edit'}
        </button>

        {/* Share — shareable builds only */}
        {build.visibility === 'shareable' && (
          <button
            onClick={handleShare}
            className="font-mono text-[10px] px-2 py-0.5 rounded border border-blue-400/20
                       text-blue-300/50 hover:text-blue-300/80 hover:border-blue-400/40
                       transition-colors"
          >
            {copied ? 'Copied!' : 'Share'}
          </button>
        )}

        {/* Delete */}
        <div className="ml-auto flex gap-1">
          {confirmDel ? (
            <>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="font-mono text-[10px] px-2 py-0.5 rounded border border-red-400/30
                           text-red-400/70 hover:text-red-400 transition-colors
                           disabled:opacity-40"
              >
                {deleting ? '…' : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmDel(false)}
                className="font-mono text-[10px] px-2 py-0.5 rounded border border-white/10
                           text-white/30 hover:text-white/50 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmDel(true)}
              className="font-mono text-[10px] px-2 py-0.5 rounded border border-white/10
                         text-white/25 hover:text-red-400/60 hover:border-red-400/20
                         transition-colors"
            >
              Delete
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default BuildCard;