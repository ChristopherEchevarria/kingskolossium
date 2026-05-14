/***
 * Path: /kingskolossium/src/common/popups/SetInfoPopup.tsx
 * Created by: Christopher Echevarria
 * Date of creation: 13May2026
 * Purpose and Description: Portal popup showing full set info — all items with
 *   green border on equipped, tier navigator, always-expanded effects list.
 *   No grace timer. Closes on ESC, backdrop click, or X button.
 ***/
import { usePopupStore }       from './popupStore';
import { useBuildStore }       from '../../build/stores/buildStore';
import { useHeaderStore }      from '../../header/stores/headerStore';
import { fetchSetItems }       from '../../../api/sets';
import { iconUrlFromTypeEn, CHARACTERISTIC_ICON_FALLBACK } from '../../build/utils/effectUtils';
import { API_BASE_URL }        from '../../../api/client';
import type { SetInfoPayload } from './types';
import type { SetEffect }      from '../../../api/sets';
import type { EquipmentItem }  from '../../../api/equipment';
import type { Language }       from '../../header/stores/headerStore';
import { useState, useEffect } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────

const POSITIVE_COLOR = '#4ade80';
const NEGATIVE_COLOR = '#f87171';
const POPUP_W        = 360;

// ── Helpers ───────────────────────────────────────────────────────────────────

function effectValue(eff: SetEffect): number {
  return eff.min_max_irrelevant === -1 ? eff.min : eff.max;
}

function effectDisplay(eff: SetEffect, lang: Language): string {
  const t = eff.templated;
  if (lang === 'fr' && t.fr) return t.fr;
  if (lang === 'es' && t.es) return t.es;
  return t.en;
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
      <span style={{ color: isNegative ? NEGATIVE_COLOR : POSITIVE_COLOR }}>
        {display}
      </span>
    </div>
  );
}

// ── SetItemButton ─────────────────────────────────────────────────────────────

function SetItemButton({
  fullItem,
  isEquipped,
  onEquip,
  onUnequip,
}: {
  fullItem:   EquipmentItem | null;
  isEquipped: boolean;
  onEquip:    (item: EquipmentItem) => void;
  onUnequip:  (item: EquipmentItem) => void;
}) {
  const iconSrc = fullItem?.icon_id
    ? `${API_BASE_URL}/assets/items/${fullItem.icon_id}-128.png`
    : null;

  return (
    <div
      onDoubleClick={() => {
        if (!fullItem) return;
        if (isEquipped) onUnequip(fullItem);
        else            onEquip(fullItem);
      }}
      title={fullItem?.name ?? '…'}
      className="flex items-center justify-center rounded-lg cursor-pointer
                 transition-all duration-150 hover:brightness-125"
      style={{
        width:      '44px',
        height:     '44px',
        flexShrink: 0,
        background: isEquipped ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
        border:     isEquipped
          ? '2px solid #4ade80'
          : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {iconSrc
        ? <img src={iconSrc} alt={fullItem?.name ?? ''} className="w-4/5 h-4/5 object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
        : <div className="w-4/5 h-4/5 rounded opacity-20 bg-white/20" />
      }
    </div>
  );
}

// ── SetInfoPopup ──────────────────────────────────────────────────────────────

export function SetInfoPopup({ payload }: { payload: SetInfoPayload }) {
  const { closePopup }                       = usePopupStore();
  const { setsIndex, equipped, equipItem, unequip } = useBuildStore();
  const { language }                         = useHeaderStore();

  const close = () => closePopup('set-info');

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Look up set from setsIndex
  const set = setsIndex.find(s => s.set_id === payload.setId);

  // Fetch all set items
  const [setItems, setSetItems] = useState<EquipmentItem[]>([]);
  useEffect(() => {
    if (!set) return;
    fetchSetItems(set.set_id, language)
      .then(setSetItems)
      .catch(err => console.error('[SetInfoPopup] fetchSetItems:', err));
  }, [set?.set_id, language]);

  // Tier state — start at current live tier, navigable
  const equippedIds = new Set<number>(
    Object.values(equipped)
      .filter((item): item is EquipmentItem => item !== null)
      .map(item => item.item_id)
  );

  const liveTier  = set
    ? set.item_ids.filter(id => equippedIds.has(id)).length
    : 0;
  const maxTier   = set?.item_ids.length ?? 0;

  const [previewTier, setPreviewTier] = useState<number>(Math.max(2, liveTier));

  // Keep previewTier on live tier when live tier changes
  useEffect(() => {
    if (liveTier >= 2) setPreviewTier(liveTier);
  }, [liveTier]);

  const tierEffects = set
    ? (set.effects[String(previewTier)] ?? []).filter(e => !e.is_meta)
    : [];
  const isLiveTier  = previewTier === liveTier;

  const itemById = setItems.reduce<Record<number, EquipmentItem>>((acc, item) => {
    acc[item.item_id] = item;
    return acc;
  }, {});

  const handleUnequip = (item: EquipmentItem) => {
    const slotId = (Object.keys(equipped) as Array<keyof typeof equipped>).find(
      slot => equipped[slot]?.item_id === item.item_id
    );
    if (slotId) unequip(slotId);
  };

  const setName = !set ? '…'
    : language === 'fr' ? set.name_fr
    : language === 'es' ? set.name_es
    : set.name_en;

  if (!set) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={close} />

      {/* Panel */}
      <div
        className="liquid-glass-strong rounded-xl flex flex-col gap-3 shadow-2xl"
        style={{
          position:  'fixed',
          top:       '50%',
          left:      '50%',
          transform: 'translate(-50%, -50%)',
          width:      POPUP_W,
          maxHeight: '80vh',
          overflowY: 'auto',
          zIndex:    9999,
          padding:   '16px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold text-white/90 truncate">
            {setName}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(91,192,245,0.12)', color: '#5BC0F5' }}
            >
              {liveTier}/{maxTier}
            </span>
            <button
              onClick={close}
              className="font-mono text-[14px] text-white/40 hover:text-white/80
                         transition-colors leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Item grid ───────────────────────────────────────────────── */}
        <div
          style={{
            display:        'flex',
            flexWrap:       'wrap',
            gap:            '8px',
            justifyContent: 'center',
          }}
        >
          {set.item_ids.map(id => (
            <SetItemButton
              key={id}
              fullItem={itemById[id] ?? null}
              isEquipped={equippedIds.has(id)}
              onEquip={equipItem}
              onUnequip={handleUnequip}
            />
          ))}
        </div>

        {/* ── Tier navigator ───────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPreviewTier(p => Math.max(2, p - 1))}
            disabled={previewTier <= 2}
            className="font-mono text-[13px] text-white/40 hover:text-white/80
                       disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >←</button>

          <div className="flex items-center gap-2">
            {Array.from({ length: maxTier - 1 }, (_, i) => i + 2).map(t => (
              <button
                key={t}
                onClick={() => setPreviewTier(t)}
                className="font-mono text-[11px] w-5 h-5 rounded transition-colors
                           hover:text-white/80"
                style={{
                  color:          t === liveTier ? POSITIVE_COLOR : 'rgba(255,255,255,0.50)',
                  fontWeight:     t === previewTier ? 700 : 400,
                  textDecoration: t === previewTier ? 'underline' : 'none',
                }}
              >{t}</button>
            ))}
          </div>

          <button
            onClick={() => setPreviewTier(p => Math.min(maxTier, p + 1))}
            disabled={previewTier >= maxTier}
            className="font-mono text-[13px] text-white/40 hover:text-white/80
                       disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >→</button>
        </div>

        {/* Preview label */}
        {!isLiveTier && liveTier >= 2 && (
          <p className="font-mono text-[9px] text-white/30 text-center -mt-1">
            previewing tier {previewTier} — equip {Math.abs(previewTier - liveTier)} more to activate
          </p>
        )}
        {!isLiveTier && liveTier < 2 && (
          <p className="font-mono text-[9px] text-white/30 text-center -mt-1">
            previewing tier {previewTier} — not currently active
          </p>
        )}

        {/* ── Effects list ─────────────────────────────────────────────── */}
        <div
          className="flex flex-col gap-1 border-t border-white/10 pt-3"
        >
          {tierEffects.length > 0
            ? tierEffects.map((eff, i) => (
                <SetEffectRow key={i} effect={eff} lang={language} />
              ))
            : <span className="font-mono text-[9px] text-white/25 text-center">
                No bonus at this tier
              </span>
          }
        </div>
      </div>
    </>
  );
}

export default SetInfoPopup;