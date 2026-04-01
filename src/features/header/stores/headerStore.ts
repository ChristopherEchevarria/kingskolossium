/***
Path:/kingskolossium/src/features/header/stores/headerStore.ts
Created by: Christopher Echevarria
Date of creation: 31Mar2026
Purpose and Description: Zustand store for language, menu open state, and badge status
***/

import { create } from 'zustand';

export type Language = 'en' | 'fr' | 'es';
export type BadgeStatus = 'visitor' | 'loyal' | 'king';

interface HeaderState {
  language:    Language;
  menuOpen:    boolean;
  badgeStatus: BadgeStatus;

  setLanguage:    (lang: Language) => void;
  setBadgeStatus: (status: BadgeStatus) => void;
  toggleMenu:     () => void;
  closeMenu:      () => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
  language:    'en',
  menuOpen:    false,
  badgeStatus: 'visitor',

  setLanguage:    (language)    => set({ language }),
  setBadgeStatus: (badgeStatus) => set({ badgeStatus }),
  toggleMenu:     ()            => set((s) => ({ menuOpen: !s.menuOpen })),
  closeMenu:      ()            => set({ menuOpen: false }),
}));