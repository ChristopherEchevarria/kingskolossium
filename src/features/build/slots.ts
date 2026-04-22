
export type SlotId =
  | 'breed'
  | 'helmet' | 'cape'
  | 'amulet' | 'ring1'  | 'ring2'
  | 'belt'   | 'boots'
  | 'shield' | 'weapon'
  | 'mount'
  | 'dofus1' | 'dofus2' | 'dofus3' | 'dofus4' | 'dofus5' | 'dofus6';

 // super_type_ids from mapped_items — same constants as EQUIPMENT_SUPER_TYPE_IDS
const ST_AMULET  = 1;
const ST_WEAPON  = 2;
const ST_RING    = 3;
const ST_BELT    = 4;
const ST_BOOTS   = 5;
const ST_SHIELD  = 7;
const ST_HELMET  = 10;
const ST_CAPE    = 11;
const ST_DOFUS   = 13;   // Dofus / Trophy / Prysmaradite share this family
const ST_MOUNT   = 12;

export const SLOT_ACCEPTS: Record<SlotId, number[]> = {
  breed:  [],                // breed pseudo-slot, no super_type_id yet
  helmet: [ST_HELMET],
  cape:   [ST_CAPE],
  amulet: [ST_AMULET],
  ring1:  [ST_RING],
  ring2:  [ST_RING],
  belt:   [ST_BELT],
  boots:  [ST_BOOTS],
  shield: [ST_SHIELD],
  weapon: [ST_WEAPON],
  dofus1: [ST_DOFUS],
  dofus2: [ST_DOFUS],
  dofus3: [ST_DOFUS],
  dofus4: [ST_DOFUS],
  dofus5: [ST_DOFUS],
  dofus6: [ST_DOFUS],
  mount:  [ST_MOUNT]
};
// Row 1: 8 equipment slots (no breed — breed is the tall left column)
export const EQUIP_ROW: SlotId[] = [
  'helmet', 'cape', 'amulet', 'ring1', 'ring2', 'belt', 'boots', 'weapon'
];

// Row 2: shield + mount + 6 dofus slots
export const DOFUS_ROW: SlotId[] = [
  'shield', 'mount', 'dofus1', 'dofus2', 'dofus3', 'dofus4', 'dofus5', 'dofus6'
];

// Keep for anything that still iterates all slots (EMPTY_EQUIPPED in buildStore)
export const SLOT_ROWS: SlotId[][] = [EQUIP_ROW, DOFUS_ROW];

// Human-readable label per slot (for tooltips / placeholders)
export const SLOT_LABEL: Record<SlotId, string> = {
  breed:  'Breed',
  helmet: 'Helmet',
  cape:   'Cape',
  amulet: 'Amulet',
  ring1:  'Ring',
  ring2:  'Ring',
  belt:   'Belt',
  boots:  'Boots',
  shield: 'Shield',
  weapon: 'Weapon',
  dofus1: 'Dofus',
  dofus2: 'Dofus',
  dofus3: 'Dofus',
  dofus4: 'Dofus',
  dofus5: 'Dofus',
  dofus6: 'Dofus',
  mount: 'Mount'
};

// Primary super_type_id for each slot — used for empty-slot filter shortcut
export const SLOT_SUPER_TYPE: Partial<Record<SlotId, number>> = {
  helmet: 10,
  cape:   11,
  amulet:  1,
  ring1:   3,
  ring2:   3,
  belt:    4,
  boots:   5,
  shield:  7,
  weapon:  2,
  dofus1: 13,
  dofus2: 13,
  dofus3: 13,
  dofus4: 13,
  dofus5: 13,
  dofus6: 13,
  mount: 12,
  // breed has no super_type_id filter
};