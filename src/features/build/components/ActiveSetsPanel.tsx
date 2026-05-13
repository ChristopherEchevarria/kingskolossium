/***
 * Path: /kingskolossium/src/features/build/components/ActiveSetsPanel.tsx
 * Created by: Christopher Echevarria
 * Date of creation: 13May2026
 * Purpose and Description: Displays active equipment sets below EquipmentActiveSlots.
 *   Each ActiveSetCard shows all set items (equipped = green border),
 *   supports expand/collapse for tier bonus effects with tier navigator,
 *   and a 5-second grace timer per card when equipped count drops below 2.
 ***/

import { useState, useEffect, useRef, useCallback } from 'react';
import { useBuildStore }       from '../stores/buildStore';
import { useHeaderStore }      from '../../header/stores/headerStore';
import { fetchSetItems }       from '../../../api/sets';
import { iconUrlFromTypeEn, CHARACTERISTIC_ICON_FALLBACK } from '../utils/effectUtils';
import { API_BASE_URL }        from '../../../api/client';
import type { ActiveSet, SetEffect } from '../../../api/sets';
import type { EquipmentItem }  from '../../../api/equipment';
import type { Language }       from '../../header/stores/headerStore';

// ── Constants ─────────────────────────────────────────────────────────────────

const POSITIVE_COLOR = '#4ade80';
const NEGATIVE_COLOR = '#f87171';
const GRACE_MS       = 5000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSetName(set: ActiveSet['set'], lang: Language): string {
  if (lang === 'fr') return set.name_fr;
  if (lang === 'es') return set.name_es;
  return set.name_en;
}

function effectValue(eff: SetEffect): number {
  return eff.min_max_irrelevant === -1 ? eff.min : eff.max;
}

function effectDisplay(eff: SetEffect, lang: Language): string {
  const t = eff.templated;
  if (lang === 'fr' && t.fr) return t.fr;
  if (lang === 'es' && t.es) return t.es;
  return t.en;
}

// ── useSetGraceTimer ──────────────────────────────────────────────────────────
// Each card owns an independent timer. When tier drops below 2 the timer starts.
// If tier recovers before GRACE_MS the timer is cancelled. After GRACE_MS
// onDismiss fires and the card removes itself from the rendered list.

function useSetGraceTimer(tier: number, onDismiss: () => void): number | null {
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const startRef    = useRef<number>(0);
  const rafRef      = useRef<number>(0);

  const clear = useCallback(() => {
    if (timerRef.current)  clearTimeout(timerRef.current);
    if (rafRef.current)    cancelAnimationFrame(rafRef.current);
    timerRef.current = null;
    setRemaining(null);
  }, []);

  useEffect(() => {
    if (tier >= 2) {
      clear();
      return;
    }
    // tier < 2 — start grace timer
    startRef.current = Date.now();
    setRemaining(GRACE_MS);

    timerRef.current = setTimeout(() => {
      clear();
      onDismiss();
    }, GRACE_MS);

    // Countdown tick via rAF for smooth display
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const left    = Math.max(0, GRACE_MS - elapsed);
      setRemaining(left);
      if (left > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return clear;
  // onDismiss and clear are stable refs — tier is the only real dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  return remaining;
}

// ── SetEffectRow ──────────────────────────────────────────────────────────────

function SetEffectRow({ effect, lang }: { effect: SetEffect; lang: Language }) {
  if (effect.is_meta) return null;

  const value      = effectValue(effect);
  const isNegative = value < 0;
  const display    = effectDisplay(effect, lang);
  const iconUrl    = iconUrlFromTypeEn(effect.type.en);

  return (
    <div className="grid grid-cols-[14px,1fr] gap-x-2 items-center font-mono text-[10px]">
      <img
        src={iconUrl ?? CHARACTERISTIC_ICON_FALLBACK}
        alt=""
        className="w-3.5 h-3.5 object-contain flex-shrink-0"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = CHARACTERISTIC_ICON_FALLBACK; }}
      />
      <span
        className="text-left truncate"
        style={{ color: isNegative ? NEGATIVE_COLOR : POSITIVE_COLOR }}
      >
        {display}
      </span>
    </div>
  );
}

// ── SetItemButton ─────────────────────────────────────────────────────────────

interface SetItemButtonProps {
  itemId:      number;
  fullItem:    EquipmentItem | null;   // null = still loading
  isEquipped:  boolean;
  onEquip:     (item: EquipmentItem) => void;
  onUnequip:   (item: EquipmentItem) => void;
}

function SetItemButton({ itemId, fullItem, isEquipped, onEquip, onUnequip }: SetItemButtonProps) {
  const iconSrc = fullItem?.icon_id
    ? `${API_BASE_URL}/assets/items/${fullItem.icon_id}-128.png`
    : null;

  const handleDoubleClick = () => {
    if (!fullItem) return;
    if (isEquipped) onUnequip(fullItem);
    else            onEquip(fullItem);
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      title={fullItem?.name ?? `Item ${itemId}`}
      className="relative flex items-center justify-center rounded-lg
                 cursor-pointer transition-all duration-150 hover:brightness-125"
      style={{
        width:      '36px',
        height:     '36px',
        flexShrink: 0,
        background: isEquipped ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
        border:     isEquipped
          ? '2px solid #4ade80'
          : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={fullItem?.name ?? ''}
          className="w-4/5 h-4/5 object-contain"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
        />
      ) : (
        // Placeholder while loading or no icon_id
        <div className="w-4/5 h-4/5 rounded opacity-20 bg-white/20" />
      )}
    </div>
  );
}

// ── ActiveSetCard ─────────────────────────────────────────────────────────────

interface ActiveSetCardProps {
  activeSet:  ActiveSet;
  tier:       number;
  lang:       Language;
  onDismiss:  (setId: number) => void;
}

function ActiveSetCard({ activeSet, tier, lang, onDismiss }: ActiveSetCardProps) {
  const { set }           = activeSet;
  const { equipItem, equipped, unequip } = useBuildStore();

  // ── Expand / collapse ──────────────────────────────────────────────────────
  const [expanded, setExpanded] = useState(false);

  // ── Tier navigator (preview only — does not affect totals) ─────────────────
  const maxTier  = set.item_ids.length;
  const [previewTier, setPreviewTier] = useState<number>(tier);

  // Keep previewTier in sync when actual tier changes
  useEffect(() => { setPreviewTier(tier); }, [tier]);

  const tierEffects = (set.effects[String(previewTier)] ?? []).filter(e => !e.is_meta);
  const isLiveTier  = previewTier === tier;

  // ── Grace timer ────────────────────────────────────────────────────────────
  const remaining = useSetGraceTimer(tier, () => onDismiss(set.set_id));

  // ── Fetch all set items on mount (once per set_id + lang) ──────────────────
  const [setItems, setSetItems] = useState<EquipmentItem[]>([]);

  useEffect(() => {
    fetchSetItems(set.set_id, lang)
      .then(setSetItems)
      .catch(err => console.error(`[ActiveSetCard] Failed to load items for set ${set.set_id}:`, err));
  }, [set.set_id, lang]);

  // ── Build lookup: item_id → full EquipmentItem ─────────────────────────────
  const itemById = setItems.reduce<Record<number, EquipmentItem>>((acc, item) => {
    acc[item.item_id] = item;
    return acc;
  }, {});

  // ── Equipped item_ids for this set (from buildStore.equipped) ──────────────
  const equippedIds = new Set<number>(
    Object.values(equipped)
      .filter((item): item is EquipmentItem => item !== null)
      .map(item => item.item_id)
  );

  // ── Unequip handler — finds the SlotId for the item and calls unequip ──────
  const handleUnequip = (item: EquipmentItem) => {
    const slotId = (Object.keys(equipped) as Array<keyof typeof equipped>).find(
      slot => equipped[slot]?.item_id === item.item_id
    );
    if (slotId) unequip(slotId);
  };

  const name = getSetName(set, lang);

  return (
    <div
      className="liquid-glass-transparent rounded-xl flex flex-col overflow-hidden"
      style={{
        border: tier < 2
          ? '1px solid rgba(226,75,74,0.40)'   // red tint during grace period
          : '1px solid rgba(91,192,245,0.15)',
        transition: 'border-color 0.3s',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="font-mono text-[10px] font-bold text-white/80 truncate">
          {name}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {/* Tier badge */}
          <span
            className="font-mono text-[9px] px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(91,192,245,0.12)',
              color:      '#5BC0F5',
            }}
          >
            {tier}/{maxTier}
          </span>
          {/* Expand / collapse toggle */}
          <button
            onClick={() => setExpanded(p => !p)}
            className="font-mono text-[12px] text-white/40 hover:text-white/80
                       transition-colors leading-none"
            aria-label={expanded ? 'Collapse set effects' : 'Expand set effects'}
          >
            {expanded ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* ── Item grid ───────────────────────────────────────────────────── */}
      <div
        style={{
          display:        'flex',
          flexWrap:       'wrap',
          gap:            '6px',
          padding:        '0 12px 8px 12px',
          justifyContent: 'center',
        }}
      >
        {set.item_ids.map(id => (
          <SetItemButton
            key={id}
            itemId={id}
            fullItem={itemById[id] ?? null}
            isEquipped={equippedIds.has(id)}
            onEquip={equipItem}
            onUnequip={handleUnequip}
          />
        ))}
      </div>

      {/* ── Expanded: tier navigator + effects ──────────────────────────── */}
      {expanded && (
        <div className="flex flex-col gap-2 px-3 pb-3 border-t border-white/10 pt-2">

          {/* Tier navigator */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setPreviewTier(p => Math.max(2, p - 1))}
              disabled={previewTier <= 2}
              className="font-mono text-[12px] text-white/40 hover:text-white/80
                         disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous tier"
            >
              ←
            </button>

            {/* Show all tier numbers — green = live tier, white = preview */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: maxTier - 1 }, (_, i) => i + 2).map(t => (
                <button
                  key={t}
                  onClick={() => setPreviewTier(t)}
                  className="font-mono text-[11px] w-5 h-5 rounded transition-colors
                             hover:text-white/80"
                  style={{
                    color:      t === tier ? POSITIVE_COLOR : 'rgba(255,255,255,0.50)',
                    fontWeight: t === previewTier ? 700 : 400,
                    textDecoration: t === previewTier ? 'underline' : 'none',
                  }}
                  aria-label={`View tier ${t} effects`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPreviewTier(p => Math.min(maxTier, p + 1))}
              disabled={previewTier >= maxTier}
              className="font-mono text-[12px] text-white/40 hover:text-white/80
                         disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              aria-label="Next tier"
            >
              →
            </button>
          </div>

          {/* Preview label when not on live tier */}
          {!isLiveTier && (
            <p className="font-mono text-[9px] text-white/30 text-center">
              previewing tier {previewTier} — equip {previewTier - tier} more to activate
            </p>
          )}

          {/* Effects list */}
          {tierEffects.length > 0 ? (
            <div className="flex flex-col gap-1">
              {tierEffects.map((eff, i) => (
                <SetEffectRow key={i} effect={eff} lang={lang} />
              ))}
            </div>
          ) : (
            <span className="font-mono text-[9px] text-white/25 text-center">
              No bonus at this tier
            </span>
          )}
        </div>
      )}

      {/* ── Grace timer bar ─────────────────────────────────────────────── */}
      {remaining !== null && (
        <div className="w-full h-0.5 bg-white/10">
          <div
            className="h-full transition-none"
            style={{
              width:      `${(remaining / GRACE_MS) * 100}%`,
              background: '#E24B4A',
            }}
          />
        </div>
      )}
    </div>
  );
}

// Tracks every set that is or was recently active.
// tier is updated live — drops to 1 when set leaves activeSets,
// which triggers useSetGraceTimer inside ActiveSetCard.
interface TrackedSet {
  activeSet: ActiveSet;
  tier:      number;
}

export function ActiveSetsPanel() {
  const activeSets   = useBuildStore(s => s.activeSets);
  const { language } = useHeaderStore();

  // Map of set_id → TrackedSet — persists sets through grace window
  const [tracked, setTracked] = useState<Map<number, TrackedSet>>(new Map());
  // Set of dismissed set_ids — removed after grace timer fires
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    const activeById = new Map(activeSets.map(s => [s.set.set_id, s]));

    setTracked(prev => {
      const next = new Map(prev);

      // Add or update sets that are currently active
      for (const activeSet of activeSets) {
        next.set(activeSet.set.set_id, { activeSet, tier: activeSet.tier });
      }

      // Sets that were tracked but are no longer active — set tier to 1
      // so useSetGraceTimer fires inside the card
      for (const [id, entry] of next) {
        if (!activeById.has(id)) {
          next.set(id, { ...entry, tier: 1 });
        }
      }

      return next;
    });

    // Un-dismiss sets that have reactivated (tier >= 2 again)
    setDismissed(prev => {
      const next = new Set(prev);
      let changed = false;
      for (const id of prev) {
        if (activeById.has(id)) { next.delete(id); changed = true; }
      }
      return changed ? next : prev;
    });
  }, [activeSets]);

  const handleDismiss = useCallback((setId: number) => {
    setDismissed(prev => new Set(prev).add(setId));
    // Also remove from tracked so it doesn't linger in memory
    setTracked(prev => {
      const next = new Map(prev);
      next.delete(setId);
      return next;
    });
  }, []);

  const visible = Array.from(tracked.values()).filter(
    t => !dismissed.has(t.activeSet.set.set_id)
  );

  if (visible.length === 0) return null;

  const useGrid = visible.length >= 2;

  return (
    <div className="liquid-glass rounded-xl p-3 flex flex-col gap-2">
      <span className="font-mono text-[10px] text-white/40 uppercase tracking-widest px-1">
        Active Sets
      </span>
      <div
        style={{
          display:             useGrid ? 'grid' : 'flex',
          flexDirection:       useGrid ? undefined : 'column',
          gridTemplateColumns: useGrid ? '1fr 1fr' : undefined,
          gap:                 '8px',
        }}
      >
        {visible.map(({ activeSet, tier }) => (
          <ActiveSetCard
            key={activeSet.set.set_id}
            activeSet={activeSet}
            tier={tier}
            lang={language}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </div>
  );
}

export default ActiveSetsPanel;