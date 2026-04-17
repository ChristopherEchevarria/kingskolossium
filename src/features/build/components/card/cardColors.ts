/***
Path:/kingskolossium/src/features/build/components/card/cardColors.ts
***/

export interface CardColors {
  border: string;
  bg:     string;
  accent: string;
  badge:  string;
}

export const SUPER_TYPE_CARD_COLORS: Record<number, CardColors> = {
  1:  { border: 'rgba(186,117,23,0.30)',  bg: 'rgba(186,117,23,0.06)',  accent: '#BA7517', badge: 'rgba(186,117,23,0.25)' },   // Amulet — pink
  2:  { border: 'rgba(99,153,34,0.30)',   bg: 'rgba(99,153,34,0.06)',   accent: '#639922', badge: 'rgba(99,153,34,0.25)' },    // Weapons — coral
  3:  { border: 'rgba(186,117,23,0.30)',  bg: 'rgba(186,117,23,0.06)',  accent: '#BA7517', badge: 'rgba(186,117,23,0.25)' },   // Ring — amber
  4:  { border: 'rgba(127,119,221,0.30)', bg: 'rgba(127,119,221,0.06)', accent: '#7F77DD', badge: 'rgba(127,119,221,0.25)' },  // Belt — green
  5:  { border: 'rgba(127,119,221,0.30)', bg: 'rgba(127,119,221,0.06)', accent: '#7F77DD', badge: 'rgba(127,119,221,0.25)' },  // Boots — purple
  7:  { border: 'rgba(136,135,128,0.30)', bg: 'rgba(136,135,128,0.06)', accent: '#888780', badge: 'rgba(136,135,128,0.25)' },  // Shield — gray
  10: { border: 'rgba(226,75,74,0.30)',   bg: 'rgba(226,75,74,0.06)',   accent: '#E24B4A', badge: 'rgba(226,75,74,0.25)' },    // Hat — red
  11: { border: 'rgba(226,75,74,0.30)',   bg: 'rgba(226,75,74,0.06)',   accent: '#E24B4A', badge: 'rgba(226,75,74,0.25)' },  // Cloak — teal
  12: { border: 'rgba(239,159,39,0.30)',  bg: 'rgba(239,159,39,0.06)',  accent: '#EF9F27', badge: 'rgba(239,159,39,0.25)' },   // Mount/Pet — gold
  13: { border: 'rgba(83,74,183,0.30)',   bg: 'rgba(83,74,183,0.06)',   accent: '#534AB7', badge: 'rgba(83,74,183,0.25)' },    // Dofus/Trophy — deep purple

};

export const DEFAULT_CARD_COLOR: CardColors = {
  border: 'rgba(91,192,245,0.15)',
  bg:     'rgba(0,95,142,0.08)',
  accent: '#5BC0F5',
  badge:  'rgba(0,95,142,0.25)',
};

export type CardMode = 'max' | 'range' | 'recipe';