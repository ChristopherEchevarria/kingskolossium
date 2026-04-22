/***
Path:/kingskolossium/src/features/build/stores/buildStore.ts
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: Zustand store for equipment browser, filters, search
***/

import { create } from 'zustand';
import type { EquipmentItem, EquipmentType  } from '../../../api/equipment';
import type { SlotId } from '../slots';
import { SLOT_ACCEPTS, SLOT_ROWS } from '../slots';
import { usePopupStore } from '../../common/popups/popupStore';


interface BuildState {
  // ── Equipment browser ────────────────────────────────────────────────────
  equipmentItems:    EquipmentItem[];
  equipmentTypes:    EquipmentType[];
  totalItems:        number;
  isLoading:         boolean;

  // ── Search & filter ──────────────────────────────────────────────────────
  searchQuery:       string;
  activeTypeFilters: Set<number>;   // multi-select type_ids, empty = "All"
  currentPage:       number;
  pageSize:          number;

  // ── Equipped slots ───────────────────────────────────────────────────────
  equipped:          Record<SlotId, EquipmentItem | null>;
  breedId:           number | null;

  // ── Actions — browser ──────────────────────────────────────────────────────────────
  setEquipmentItems:   (items: EquipmentItem[], total: number) => void;
  setEquipmentTypes:   (types: EquipmentType[]) => void;
  setLoading:          (loading: boolean) => void;
  setSearchQuery:      (query: string) => void;
  toggleTypeFilter:    (typeId: number) => void;
  setCurrentPage:      (page: number) => void;
  resetTypeFilters:    () => void;   // resets pills only, NOT search bar
  setActiveTypeFilters: (superTypeIds: number[]) => void;


  // ── Actions — equipped slots ─────────────────────────────────────────────
  equipItem:    (item: EquipmentItem) => void;
  equipToSlot:  (item: EquipmentItem, slot: SlotId) => void;
  unequip:      (slot: SlotId) => void;
  resetBuild:   () => void;

}

// Equipment-only super_type_ids (excludes resources, consumables, quest items, etc.)
export const EQUIPMENT_SUPER_TYPE_IDS = new Set([1, 2, 3, 4, 5, 7, 10, 11, 12, 13]);

// All slots start empty
const EMPTY_EQUIPPED = Object.fromEntries(
  SLOT_ROWS.flat().map(id => [id, null])
) as Record<SlotId, EquipmentItem | null>;

export const useBuildStore = create<BuildState>((set, get) => ({
// ── Browser initial state ─────────────────────────────────────────────────
  equipmentItems:    [],
  equipmentTypes:    [],
  totalItems:        0,
  isLoading:         false,
  searchQuery:       '',
  activeTypeFilters: new Set<number>(),
  currentPage:       0,
  pageSize:          40,

// ── Equipped initial state ────────────────────────────────────────────────
  equipped:     { ...EMPTY_EQUIPPED },
  breedId:      null,

  setEquipmentItems: (items, total) => set({ equipmentItems: items, totalItems: total }),
  setEquipmentTypes: (types) => set({ equipmentTypes: types }),
  setLoading:        (isLoading) => set({ isLoading }),
  setSearchQuery:    (searchQuery) => set({ searchQuery, currentPage: 0 }),

  toggleTypeFilter: (typeId) => set((state) => {
    const next = new Set(state.activeTypeFilters);
    if (next.has(typeId)) {
      next.delete(typeId);
    } else {
      next.add(typeId);
    }
    return { activeTypeFilters: next, currentPage: 0 };
  }),

  setCurrentPage:    (currentPage) => set({ currentPage }),
  resetTypeFilters:  () => set({ activeTypeFilters: new Set<number>(), currentPage: 0 }),

  equipItem: (item) => {
      const superTypeId = item.super_type_id ?? 0;
      const { equipped } = get();

      const alreadySlot = (Object.keys(equipped) as SlotId[]).find(
        slot => equipped[slot]?.item_id === item.item_id
      );
      if (alreadySlot) {
        set({ equipped: { ...equipped, [alreadySlot]: null } });
        return;
      }

        // ── Rule: Prysmaradite → dofus1 only ────────────────────────────────────
      const isPrysma = item.type_name?.toLowerCase().includes('prysma');
      const candidates: SlotId[] = isPrysma
        ? ['dofus1']
        : (Object.keys(SLOT_ACCEPTS) as SlotId[]).filter(
        slot => SLOT_ACCEPTS[slot].includes(superTypeId)
      );

       if (candidates.length === 0) return
          //Find all slots that accept this super_type_id
          // Single candidate slot (helmet ,cape, etx) - always overwrite.
       if(candidates.length === 1 ){
          set({equipped: { ...equipped, [candidates[0]]: item}});
          return;
       }

          //Multi-candidate (rings, dofus) fill first empty
       const firstEmpty = candidates.find(slot => equipped[slot] === null);
       if (firstEmpty) {
          set({ equipped: { ...equipped, [firstEmpty]: item } });
          return;
       }

          // All candidate slots are full — open swap popup
       usePopupStore.getState().openPopup({
          id: 'swap',
          payload: { item, candidateSlots: candidates, triggerRect: null },
        });
      },

  equipToSlot: (item, slot) => {
    set((state) => ({ equipped: { ...state.equipped, [slot]: item } }));
  },

  unequip: (slot) => {
    set((state) => ({ equipped: { ...state.equipped, [slot]: null } }));
  },

  resolveSwap: (slot) => {
    const { pendingSwap, equipped } = get();
    if (!pendingSwap) return;
    set({
      equipped:    { ...equipped, [slot]: pendingSwap.item },
      pendingSwap: null,
    });
  },

  cancelSwap: () => set({ pendingSwap: null }),

  resetBuild: () => set({ equipped: { ...EMPTY_EQUIPPED }, breedId: null, pendingSwap: null }),

  setActiveTypeFilters: (superTypeIds) => set((state) => {
      const matching = state.equipmentTypes
        .filter(t => superTypeIds.includes(t.super_type_id))
        .map(t => t.type_id);
      return {
          activeTypeFilters: new Set(matching),
          currentPage: 0,
          };
      }
    ),

  resolveSwap: (slot) => {
      const { equipped } = get();
      const popup = usePopupStore.getState().stack.find(p => p.id === 'swap');
      if (!popup) return;
      const item = (popup.payload as import('../../common/popups/types').SwapPayload).item;
      set({ equipped: { ...equipped, [slot]: item } });
      usePopupStore.getState().closePopup('swap');
    },

}));

export default useBuildStore;