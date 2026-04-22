// src/features/common/popups/SwapPopup.tsx
import { useEffect } from 'react';
import { usePopupStore } from './popupStore';
import { useBuildStore } from '../../build/stores/buildStore';
import { SLOT_LABEL } from '../../build/slots';
import { SUPER_TYPE_CARD_COLORS, DEFAULT_CARD_COLOR } from '../../build/components/card/cardColors';
import { API_BASE_URL } from '../../../api/client';
import type { SwapPayload } from './types';

const POPUP_W = 340;
const POPUP_H = 300;
const MARGIN  = 16;

function computePos(triggerRect: SwapPayload['triggerRect']): { top: string; left: string } {
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;

  // X: true center of usable viewport (clientWidth excludes scrollbar)
  const idealLeft = vw / 2 - POPUP_W / 2;
  const left = Math.max(MARGIN, Math.min(idealLeft, vw - POPUP_W - MARGIN));

  if (!triggerRect) {
    return {
      top:  `${Math.max(MARGIN, vh / 2 - POPUP_H / 2)}px`,
      left: `${left}px`,
    };
  }

  let top = triggerRect.top + triggerRect.height + 10;
  if (top + POPUP_H > vh - MARGIN) top = triggerRect.top - POPUP_H - 10;
  top = Math.max(MARGIN, Math.min(top, vh - POPUP_H - MARGIN));

  return { top: `${top}px`, left: `${left}px` };
}

interface SwapPopupProps {
  payload: SwapPayload;
}

export function SwapPopup({ payload }: SwapPopupProps) {
  const { closePopup } = usePopupStore();
  const { equipped, resolveSwap } = useBuildStore();

  const cancel = () => closePopup('swap');

  // Esc key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { top, left } = computePos(payload.triggerRect);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={cancel} />

      {/* Panel — sibling to backdrop, true fixed to viewport via portal */}
      <div
        className="liquid-glass-strong rounded-xl p-5 flex flex-col gap-4 shadow-2xl"
        style={{ position: 'fixed', top, left, width: POPUP_W, zIndex: 9999 }}
        onClick={e => e.stopPropagation()}
      >
        <p className="text-white/80 font-mono text-xs text-center font-bold tracking-wide">
          Select which slot to replace?
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          {payload.candidateSlots.map(slot => {
            const current = equipped[slot];
            const colors  = current?.super_type_id
              ? (SUPER_TYPE_CARD_COLORS[current.super_type_id] ?? DEFAULT_CARD_COLOR)
              : DEFAULT_CARD_COLOR;

            return (
              <button
                key={slot}
                onClick={() => { resolveSwap(slot); cancel(); }}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg border
                           transition-all duration-150 hover:brightness-125 hover:scale-105"
                style={{ background: colors.bg, borderColor: colors.border, minWidth: 80 }}
              >
                {current ? (
                  <img
                    src={`${API_BASE_URL}/assets/items/${current.icon_id}-128.png`}
                    alt={current.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded opacity-20 bg-white" />
                )}
                <span
                  className="font-mono text-[9px] text-white/60 text-center leading-tight"
                  style={{ maxWidth: 80, wordBreak: 'break-word' }}
                >
                  {current?.name ?? SLOT_LABEL[slot]}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={cancel}
          className="text-white/30 font-mono text-[10px] hover:text-white/60
                     transition-colors text-center"
        >
          Cancel (Esc)
        </button>
      </div>
    </>
  );
}

export default SwapPopup;