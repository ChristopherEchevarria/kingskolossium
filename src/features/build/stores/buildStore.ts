/***
Path:/kingskolossium/src/features/build/stores/buildStore.ts
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: Zustand store for equipment browser, filters, search
***/

import { create } from 'zustand';
import type { EquipmentItem, EquipmentType, CharacteristicName } from '../../../api/equipment';

interface BuildState {
  // ── Equipment browser ────────────────────────────────────────────────────
  equipmentItems:    EquipmentItem[];
  equipmentTypes:    EquipmentType[];
  totalItems:        number;
  characteristicNames: Map<number, string>;
  isLoading:         boolean;

  // ── Search & filter ──────────────────────────────────────────────────────
  searchQuery:       string;
  activeTypeFilters: Set<number>;   // multi-select type_ids, empty = "All"
  currentPage:       number;
  pageSize:          number;

  // ── Actions ──────────────────────────────────────────────────────────────
  setEquipmentItems:   (items: EquipmentItem[], total: number) => void;
  setEquipmentTypes:   (types: EquipmentType[]) => void;
  setCharacteristicNames:(names: CharacteristicName[]) => void;
  setLoading:          (loading: boolean) => void;
  setSearchQuery:      (query: string) => void;
  toggleTypeFilter:    (typeId: number) => void;
  setCurrentPage:      (page: number) => void;
  resetTypeFilters:    () => void;   // resets pills only, NOT search bar
}

// Equipment-only super_type_ids (excludes resources, consumables, quest items, etc.)
export const EQUIPMENT_SUPER_TYPE_IDS = new Set([1, 2, 3, 4, 5, 7, 10, 11, 12, 13]);

export const useBuildStore = create<BuildState>((set) => ({
  equipmentItems:    [],
  equipmentTypes:    [],
  characteristicNames: new Map<number, string>(),
  totalItems:        0,
  isLoading:         false,

  searchQuery:       '',
  activeTypeFilters: new Set<number>(),
  currentPage:       0,
  pageSize:          40,

  setEquipmentItems: (items, total) => set({ equipmentItems: items, totalItems: total }),
  setEquipmentTypes: (types) => set({ equipmentTypes: types }),
  setCharacteristicNames: (names) => set({
    characteristicNames: new Map(
      names.map(n => [n.characteristic_id, { name: n.name, keyword: n.keyword }])
    ),
  }),
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
}));

export default useBuildStore;