// src/features/common/popups/types.ts

import type { SlotId } from '../../build/slots';
import type { EquipmentItem } from '../../../api/equipment';

// ── Registry of every popup in the app ───────────────────────────────────────
// Add a new entry here when you add a new popup component.

export type PopupId =
  | 'swap'
  // | 'announcement'   ← future: site-wide announcement banner
  // | 'payment'        ← future: Kamas / subscription purchase flow
  // | 'confirm'        ← future: generic "are you sure?" dialog
  // | 'share-build'    ← future: copy link / QR code for shareable build
  ;

// ── Per-popup payload types ───────────────────────────────────────────────────
// Each popup declares exactly what data it needs to render.

export interface SwapPayload {
  candidateSlots: SlotId[];
  item:           EquipmentItem;
  triggerRect:    { top: number; left: number; width: number; height: number } | null;
}

// export interface AnnouncementPayload { title: string; body: string; cta?: string; }
// export interface PaymentPayload      { productId: string; priceKamas: number; }
// export interface ConfirmPayload      { message: string; onConfirm: () => void; }
// export interface ShareBuildPayload   { buildId: string; buildName: string; }

// ── Discriminated union — what popupStore holds ───────────────────────────────
export type PopupConfig =
  | { id: 'swap';         payload: SwapPayload }
  // | { id: 'announcement'; payload: AnnouncementPayload }
  // | { id: 'payment';      payload: PaymentPayload }
  // | { id: 'confirm';      payload: ConfirmPayload }
  // | { id: 'share-build';  payload: ShareBuildPayload }
  ;