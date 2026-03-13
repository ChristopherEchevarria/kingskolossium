/***
Path:/kingskolossium/src/features/arena/stores/arenaStore.ts
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: Zustand store (entities, maps, LOS state)
***/
import { create } from 'zustand';

// Types
export type MapType = 'kolossium' | 'infinite dream' | 'dungeon';
export type Team = 'ally' | 'enemy';
export type EntityType = 'breed' | 'monster';

//Map
export interface MapInfo {
  combat_map_id:      number;
  map_key:            string;
  cell_count:         number;
  preview_image_path: string | null;
  // Fields populated by parseMapKey()
  displayName: string;
  mapType:     string;
  numericId:   number;
  variant:     number | null;
}

export interface MapDetail extends MapInfo {
  available_cells:   number[] | null;
  ally_spawn_cells:  number[] | null;
  enemy_spawn_cells: number[] | null;
  obstacle_cells:    number[] | null;
  hole_cells:        number[] | null;
}

//Entity interface
export interface EntityStats {
  hp: number;
  hpMax: number;
  ap: number;
  apMax: number;
  mp: number;
  mpMax: number;
  earthRes: number;
  fireRes: number;
  waterRes: number;
  airRes: number;
  neutralRes: number;
}

export interface EntitySpell {
  id: number;
  name: string;
  iconId: number;
  apCost: number;
  minRange: number;
  maxRange: number;
  losRequired: boolean;
  castInLine: boolean;
  damage?: number;
  damageType?: string;
}

export interface GridEntity {
  id: string;
  type: EntityType;
  entityId: number;  // Monster ID or Breed ID
  name: string;
  team: Team;
  cellId: number;
  imageUrl: string;
  stats: EntityStats;
  spells: EntitySpell[];
}

//Utilities
export function parseMapKey(mapKey: string):{
    mapType: string;
    numericId: number;
    displayName: string;
    variant: number | null;
    }{
    const parts = mapKey.split('_');
    const mapType = parts[0]
        .replace(/\b\w/g, c => c.toUpperCase());
    const numericId = parseInt(parts[1]) || 0;
    const rest = parts.slice(2);

    const lastIsNum = rest.length > 1 && !isNaN(parseInt(rest[rest.length-1]));
    const variant = lastIsNum ? parseInt(rest[rest.length - 1]) : null;
    const nameWords = lastIsNum ? rest.slice(0, -1) : rest;
    const displayName = nameWords
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    return { mapType, numericId, displayName, variant }
    }
export function parsePreviewImg(preview_image_path: string):number | null {
    if (preview_image_path != null ){
        const parts = preview_image_path.split('_');
        if (parts[3] ){
            const n = parseInt(parts[3]);
            return isNaN(n) ? null : n;
            }
        }
    return  null;
    }

export function buildCellTypesGrid(
  availableCells:  number[],
  obstacleCells:   number[],
  holeCells:       number[],
  allySpawnCells:  number[],
  enemySpawnCells: number[],
): number[][] {
  // All 560 cells start as UNAVAILABLE (0)
  const grid: number[][] = Array.from({ length: 40 }, () => new Array(14).fill(0));

  // Pass 1: all available cells → WALKABLE (1)
  for (const id of availableCells) {
    grid[Math.floor(id / 14)][id % 14] = 1;
  }

  // Pass 2: override with specific types
  for (const id of obstacleCells)  { grid[Math.floor(id / 14)][id % 14] = 2; }
  for (const id of holeCells)      { grid[Math.floor(id / 14)][id % 14] = 3; }
  for (const id of allySpawnCells) { grid[Math.floor(id / 14)][id % 14] = 4; }
  for (const id of enemySpawnCells){ grid[Math.floor(id / 14)][id % 14] = 5; }

  return grid;
}

interface ArenaState {

    // ── Map carousel ──────────────────────────────────────────────────────────
  maps:             MapInfo[];
  selectedMapIndex: number;
  selectedMap:      MapDetail | null;

  // ── Grid data ─────────────────────────────────────────────────────────────
  // Derived from selectedMap by loadMapDetail — never set directly from outside
  cellTypes: number[][] | null;

  // ── Entities ──────────────────────────────────────────────────────────────
  entities: Map<string, GridEntity>;

  // ── Grid UI ───────────────────────────────────────────────────────────────
  selectedCellId:   number | null;
  selectedEntityId: string | null;

  // ── LOS ───────────────────────────────────────────────────────────────────
  visibleCells: Set<number>;

  // Actions───────────────────────────────────────────────────────────────────
    // Map carousel
  setMaps:             (maps: MapInfo[]) => void;
  setSelectedMapIndex: (index: number) => void;
  loadMapDetail:       (detail: MapDetail) => void;

    // Entities
  addEntity:    (entity: GridEntity) => void;
  removeEntity: (entityId: string) => void;

    // Grid UI
  selectCell:   (cellId: number | null) => void;
  selectEntity: (entityId: string | null) => void;

    // LOS
  setVisibleCells: (cells: Set<number>) => void;

     // Reset — clears entities + UI, preserves loaded map
  resetEntities: () => void;
}


export const useArenaStore = create<ArenaState>((set) => ({

  // ── Initial state ─────────────────────────────────────────────────────────
  maps:             [],
  selectedMapIndex: 0,
  selectedMap:      null,
  cellTypes:        null,
  entities:         new Map(),
  selectedCellId:   null,
  selectedEntityId: null,
  visibleCells:     new Set(),

  // ── Map carousel ──────────────────────────────────────────────────────────

  setMaps: (maps) => set({ maps }),

  setSelectedMapIndex: (index) => set({ selectedMapIndex: index }),

  /**
   * Accepts raw API detail, builds cellTypes internally, resets the grid.
   * Components call this and nothing else — no manual setCellTypes needed.
   * Mirrors mapsStore.loadMapDetail exactly.
   */
  loadMapDetail: (detail) => {
    const cellTypes = buildCellTypesGrid(
      detail.available_cells   ?? [],
      detail.obstacle_cells    ?? [],
      detail.hole_cells        ?? [],
      detail.ally_spawn_cells  ?? [],
      detail.enemy_spawn_cells ?? [],
    );

    set({
      selectedMap:      detail,
      cellTypes,
      // Clear grid so entities from the previous map don't persist
      entities:         new Map(),
      selectedCellId:   null,
      selectedEntityId: null,
      visibleCells:     new Set(),
    });
  },

  // ── Entities ──────────────────────────────────────────────────────────────

  addEntity: (entity) => set((state) => {
    const next = new Map(state.entities);
    next.set(entity.id, entity);
    return { entities: next };
  }),

  removeEntity: (entityId) => set((state) => {
    const next = new Map(state.entities);
    next.delete(entityId);
    return { entities: next };
  }),

  // ── Grid UI ───────────────────────────────────────────────────────────────

  selectCell:   (cellId)   => set({ selectedCellId: cellId }),
  selectEntity: (entityId) => set({ selectedEntityId: entityId }),

  // ── LOS ───────────────────────────────────────────────────────────────────

  setVisibleCells: (cells) => set({ visibleCells: cells }),

  // ── Reset ─────────────────────────────────────────────────────────────────

  /**
   * Clears entities and UI state.
   * Preserves selectedMap, selectedMapIndex, and cellTypes so the
   * carousel and grid layout stay intact between resets.
   */
  resetEntities: () => set({
    entities:         new Map(),
    selectedCellId:   null,
    selectedEntityId: null,
    visibleCells:     new Set(),
  }),

}));


export default useArenaStore;