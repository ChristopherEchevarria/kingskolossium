// src/features/common/popups/popupStore.ts
import { create } from 'zustand';
import type { PopupConfig, PopupId } from './types';

interface PopupState {
  // Stack so future popups can layer (confirm on top of payment, etc.)
  stack: PopupConfig[];

  // ── Actions ──────────────────────────────────────────────────────────────
  openPopup:  (config: PopupConfig) => void;
  closePopup: (id?: PopupId) => void;   // no arg = close topmost
  closeAll:   () => void;
}

export const usePopupStore = create<PopupState>((set, get) => ({
  stack: [],

  openPopup: (config) => set((state) => {
    // Replace if same id already open — avoids duplicate swap popups
    const filtered = state.stack.filter(p => p.id !== config.id);
    return { stack: [...filtered, config] };
  }),

  closePopup: (id) => set((state) => {
    if (id === undefined) {
      // Close topmost
      return { stack: state.stack.slice(0, -1) };
    }
    return { stack: state.stack.filter(p => p.id !== id) };
  }),

  closeAll: () => set({ stack: [] }),
}));