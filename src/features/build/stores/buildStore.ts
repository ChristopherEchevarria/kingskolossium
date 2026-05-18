/***
Path:/kingskolossium/src/features/build/stores/buildStore.ts
Created by: Christopher Echevarria
Date of creation: 09Apr2026
Purpose and Description: Zustand store for equipment browser, filters, search
***/

import { create } from 'zustand';
import type { EquipmentItem, EquipmentType  } from '../../../api/equipment';
import type { Characteristic } from '../../../api/characteristics';
import type { BreedInfo }      from '../../../api/breeds';
import type { MappedSet, ActiveSet } from '../../../api/sets';
import { selectActiveSets }           from '../utils/selectActiveSets';
import type { SlotId } from '../slots';
import { SLOT_ACCEPTS, SLOT_ROWS, SINGLE_SLOT_TYPE } from '../slots';
import {type PrimaryStatId, PRIMARY_STAT_IDS, EMPTY_PRIMARY, totalPoolCost, TOTAL_STAT_POINTS } from '../primaryStats';
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
  gender:            'male' | 'female';

  // ── Reference data — loaded once at startup ───────────────────────────────
  characteristics:   Record<number, Characteristic>;  // characteristic_id → Characteristic
  breeds:            BreedInfo[];
  setsIndex:         MappedSet[];                      // full set list, loaded once at session start
  activeSets:        ActiveSet[];                      // derived — recomputed on every equip change
  // ── Player character level ────────────────────────────────────────────────
  characterLevel:    number;    // drives AP base, point pool size


  // ── Primary stat allocation ───────────────────────────────────────────────
  // Points the player manually distributes from the 995-point pool
  basePoints:        Record<PrimaryStatId, number>;
  // Scrolls — always +1 per increment, max 100 per stat, no pool cost
  scrollPoints:      Record<PrimaryStatId, number>;

  // ── Actions — browser ──────────────────────────────────────────────────────────────
  setEquipmentItems:   (items: EquipmentItem[], total: number) => void;
  setEquipmentTypes:   (types: EquipmentType[]) => void;
  setLoading:          (loading: boolean) => void;
  setSearchQuery:      (query: string) => void;
  toggleTypeFilter:    (typeId: number) => void;
  setCurrentPage:      (page: number) => void;
  resetTypeFilters:    () => void;   // resets pills only, NOT search bar
  setActiveTypeFilters: (superTypeIds: number[]) => void;
  // ── Actions — reference data ──────────────────────────────────────────────
  setCharacteristics:  (chars: Characteristic[]) => void;
  setBreeds:           (breeds: BreedInfo[]) => void;
  setSetsIndex:        (sets: MappedSet[]) => void;




  // ── Actions — equipped slots ─────────────────────────────────────────────
  equipItem:    (item: EquipmentItem) => void;
  equipToSlot:  (item: EquipmentItem, slot: SlotId) => void;
  unequip:      (slot: SlotId) => void;
  resetBuild:   () => void;
  resolveSwap: (slot: SlotId) => void;
  setBreed:    (breedId: number, gender: 'male' | 'female') => void;
  setGender:   (gender: 'male' | 'female') => void;


  // ── Build persistence metadata ────────────────────────────────────────────
  currentBuildId:         string | null;   // null = unsaved
  currentBuildName:       string;
  currentBuildComment:    string;
  currentBuildVisibility: 'private' | 'shareable';

  savedBuilds:            import('../../../api/builds').Build[] | null;  // null = not yet fetched


  setCurrentBuildId:      (id: string | null) => void;
  setCurrentBuildName:    (name: string) => void;
  setCurrentBuildComment: (comment: string) => void;
  setCurrentBuildVis:     (vis: 'private' | 'shareable') => void;
  loadBuild:              (build: import('../../../api/builds').Build) => void;
  setSavedBuilds:         (builds: import('../../../api/builds').Build[]) => void;
  upsertSavedBuild:       (build: import('../../../api/builds').Build) => void;  // add or replace
  removeSavedBuild:       (buildId: string) => void;

    // ── Actions — primary stat allocation ────────────────────────────────────
  setBasePoints:     (stat: PrimaryStatId, value: number) => void;
  setScrollPoints:   (stat: PrimaryStatId, value: number) => void;
  resetPrimaryStats: () => void;   // resets base + scroll only, NOT equipment
  autoScrollAll:     () => void;   // sets all scroll stats to 100

}

// Equipment-only super_type_ids (excludes resources, consumables, quest items, etc.)
export const EQUIPMENT_SUPER_TYPE_IDS = new Set([1, 2, 3, 4, 5, 7, 10, 11, 12, 13]);

// All slots start empty
const EMPTY_EQUIPPED = Object.fromEntries(
  SLOT_ROWS.flat().map(id => [id, null])
) as Record<SlotId, EquipmentItem | null>;

// Recomputes activeSets whenever equipped changes.
// Called at the end of every action that mutates equipped.
function recomputeActiveSets(
  setsIndex: MappedSet[],
  equipped:  Record<SlotId, EquipmentItem | null>,
): ActiveSet[] {
  return selectActiveSets(setsIndex, equipped);
}

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
  gender:       'male',
  breeds:       [],
  characteristics:  {},
  setsIndex:    [],
  activeSets:   [],
  characterLevel:  200,
  basePoints:      { ...EMPTY_PRIMARY },
  scrollPoints:    { ...EMPTY_PRIMARY },

  // ── Build persistence metadata ────────────────────────────────────────────
  currentBuildId:         null,
  currentBuildName:       '',
  currentBuildComment:    '',
  currentBuildVisibility: 'private',
  savedBuilds:            null,


  setCharacteristics: (chars) => set({
    characteristics: Object.fromEntries(
      chars.map(c => [c.characteristic_id, c])
    ),
  }),
  setBreeds: (breeds) => set({ breeds }),
  setSetsIndex: (sets) => {
      const { equipped } = get();
      set({
        setsIndex: sets,
        activeSets: selectActiveSets(sets, equipped),
      });
    },
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
       const { equipped, setsIndex } = get();

       const nextEquipped = (next: Record<SlotId, EquipmentItem | null>) => {
          set({ equipped: next, activeSets: recomputeActiveSets(setsIndex, next) });
       };

       const alreadySlot = (Object.keys(equipped) as SlotId[]).find(
          slot => equipped[slot]?.item_id === item.item_id
       );
       if (alreadySlot) {
          nextEquipped({ ...equipped, [alreadySlot]: null });
          return;
       }

       const forcedSlot = item.type_id != null ? SINGLE_SLOT_TYPE[item.type_id] : undefined;
       if (forcedSlot) {
          nextEquipped({ ...equipped, [forcedSlot]: item });
          return;
       }

        const candidates: SlotId[] = (Object.keys(SLOT_ACCEPTS) as SlotId[]).filter(
          slot => SLOT_ACCEPTS[slot].includes(superTypeId)
        );

        if (candidates.length === 0) return;
        if (candidates.length === 1) {
          nextEquipped({ ...equipped, [candidates[0]]: item });
          return;
        }

        const firstEmpty = candidates.find(slot => equipped[slot] === null);
        if (firstEmpty) {
          nextEquipped({ ...equipped, [firstEmpty]: item });
          return;
        }

        usePopupStore.getState().openPopup({
          id: 'swap',
          payload: { item, candidateSlots: candidates, triggerRect: null },
        });
      },

  equipToSlot: (item, slot) => {
    const { setsIndex } = get();
    const nextEquipped = { ...get().equipped, [slot]: item };
    set({ equipped: nextEquipped, activeSets: recomputeActiveSets(setsIndex, nextEquipped) });
  },

  unequip: (slot) => {
    const { setsIndex } = get();
    const nextEquipped = { ...get().equipped, [slot]: null };
    set({ equipped: nextEquipped, activeSets: recomputeActiveSets(setsIndex, nextEquipped) });
  },

  resetBuild: () => set({
    equipped:     { ...EMPTY_EQUIPPED },
    activeSets:   [],
    breedId:      null,
    gender:       'male',
    basePoints:   { ...EMPTY_PRIMARY },
    scrollPoints: { ...EMPTY_PRIMARY },
  }),

  setBasePoints: (stat, value) => set((state) => {
    const next = { ...state.basePoints, [stat]: value };
    // Guard: total pool cost across all stats cannot exceed TOTAL_STAT_POINTS
    const totalCost = PRIMARY_STAT_IDS.reduce(
      (sum, s) => sum + totalPoolCost(s, next[s]), 0
    );
    if (totalCost > TOTAL_STAT_POINTS) return {};   // reject — no state change
    return { basePoints: next };
  }),

    setScrollPoints: (stat, value) => set((state) => ({
        scrollPoints: { ...state.scrollPoints, [stat]: Math.min(100, Math.max(0, value)) },
        })),

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

  resetPrimaryStats: () => set({ basePoints: { ...EMPTY_PRIMARY }, scrollPoints: { ...EMPTY_PRIMARY } }),

  autoScrollAll: () => set({
    scrollPoints: { vitality: 100, strength: 100, intelligence: 100, chance: 100, agility: 100, wisdom: 100 },
    }),

  resolveSwap: (slot: SlotId) => {
    const { equipped, setsIndex } = get();
    const stack = usePopupStore.getState().stack;
    const popup = stack.find(p => p.id === 'swap');
    if (!popup) return;
    const payload = popup.payload as import('../../common/popups/types').SwapPayload;
    const nextEquipped = { ...equipped, [slot]: payload.item };
    set({ equipped: nextEquipped, activeSets: recomputeActiveSets(setsIndex, nextEquipped) });
    usePopupStore.getState().closePopup('swap');
  },

  setBreed:  (breedId, gender) => set({ breedId, gender }),
  setGender: (gender)          => set({ gender }),

  setCurrentBuildId:      (id) =>   set({ currentBuildId: id }),
  setCurrentBuildName:    (name) => set({ currentBuildName: name }),
  setCurrentBuildComment: (comment) => set({ currentBuildComment: comment }),
  setCurrentBuildVis:     (vis) =>  set({ currentBuildVisibility: vis }),

  setSavedBuilds:   (builds) => set({ savedBuilds: builds }),
  upsertSavedBuild: (build) => set((state) => {
    const list = state.savedBuilds ?? [];
    const idx  = list.findIndex(b => b.build_id === build.build_id);
    return {
      savedBuilds: idx >= 0
        ? list.map(b => b.build_id === build.build_id ? build : b)
        : [build, ...list],   // new builds go to the top
    };
  }),
  removeSavedBuild: (buildId) => set((state) => ({
    savedBuilds: (state.savedBuilds ?? []).filter(b => b.build_id !== buildId),
  })),

  loadBuild: (build) => {
    const { setsIndex } = get();
    const slots = build.slots;

    const nextEquipped = Object.fromEntries(
      (Object.keys(EMPTY_EQUIPPED) as SlotId[]).map(slotId => [slotId, null])
    ) as Record<SlotId, EquipmentItem | null>;

    set({
      equipped:               nextEquipped,
      activeSets:             recomputeActiveSets(setsIndex, nextEquipped),
      breedId:                build.breed_id,
      currentBuildId:         build.build_id,
      currentBuildName:       build.name,
      currentBuildComment:    build.comment ?? '',
      currentBuildVisibility: build.visibility,
    });
  },
}));


export default useBuildStore;