/***
Path:/kingskolossium/src/engine/types/Grid.ts
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description:
***/

export const GRID_COLS = 14;
export const GRID_ROWS = 40;
export const TOTAL_CELLS = 560;
export const CELL_WIDTH_1080P = 220;  // pixels at 1920×1080
export const CELL_HEIGHT_1080P = 110;
export const CELL_WIDTH = 40;
export const CELL_HEIGHT = 20;
export const GRID_PADDING = 30;
// ── 3D extrusion depth (pixels in SVG space) ─────────────────────────────────
// Increase this number to make tiles look taller.
export const CELL_DEPTH = 10;

export enum CellType {
  UNAVAILABLE = 0, //
  WALKABLE = 1,
  OBSTACLE = 2,
  HOLE = 3,
  SPAWN_ALLY = 4,
  SPAWN_ENEMY = 5,
}

export interface ImmediateCellNeighbors {
  upLeft:    number | null;   // Even row: id-15, Odd: id-14
  upRight:   number | null;   // Even row: id-14, Odd: id-13
  downLeft:  number | null;   // Even row: id+13, Odd: id+14
  downRight: number | null;   // Even row: id+14, Odd: id+15
}

export interface DiagonalCellNeighbors {
  top:    number | null;   // id - 28
  bottom:   number | null;   // id + 28
  left:  number | null;   // id - 1
  right: number | null;   // Id + 1
}

export interface GridCell {
  cellId:    number;          // 0–559
  row:       number;          // 0–39  (cellId / 14 floored)
  col:       number;          // 0–13  (cellId % 14)
  isEvenRow: boolean;         // (row % 2) === 0
  immediateNeighbors: ImmediateCellNeighbors;   // Pre-computed diagonal neighbors from DB
  relX:      number;          // Even: col, Odd: col + 0.5
  relY:      number;          // row * 0.5
}

export interface GridTemplate {
  cells:      GridCell[];     // length 560, indexed by cellId
  cols:       number;         // always 14
  rows:       number;         // always 40
  totalCells: number;         // always 560
}

export interface CalibrationData {
  originX:    number;
  originY:    number;
  cellWidth:  number;
  cellHeight: number;
  scale?:     number;
  rotation?:  number;
}

export enum CalibrationStatus {
  INCOMPLETE    = 'pending',
  CALIBRATED = 'calibrated',
  FAILED     = 'failed',
  MANUAL     = 'manual',
}

export enum CalibrationMethod {
  PREVIEW   = 'preview',
  IN_COMBAT = 'in_combat',
  MANUAL    = 'manual',
}

export interface CombatMapInfo {
  combat_map_id:            number;
  map_id:                  number;        // BIGINT in DB → number
  map_key:                 string;

  cellsBitmap:            Uint8Array;    // 70 bytes, 1 bit per cell
  cell_count:              number;

  allySpawnCells:         number[] | null;
  enemySpawnCells:        number[] | null;
  obstacleCells:          number[] | null;
  holeCells:              number[] | null;

  calibrationData:        CalibrationData | null;
  calibrationStatus:      CalibrationStatus;
  calibrationConfidence:  number;        // 0.00–100.00
  calibrationMethod:      CalibrationMethod;

  preview_image_path:       string;
}

export interface CombatMapListResponse {
  items: CombatMapInfo[];
  total: number;
  skip:  number;
  limit: number;
}

export interface CombatMapDetail extends CombatMapInfo {
  available_cells:   number[] | null;  // decoded bitmap from server
  ally_spawn_cells:  number[] | null;
  enemy_spawn_cells: number[] | null;
  obstacle_cells:    number[] | null;
  hole_cells:        number[] | null;
  created_at:        string | null;
  updated_at:        string | null;
}



// Runtime State (arena simulation only, not from API)
export interface EntityRef {
  id:   string;
  team: 'ally' | 'enemy';
}

export interface RuntimeCell {
  cellId:        number;
  type:          CellType;
  entity:        EntityRef | null;
  groundEffects: string[];
}

/** Alias kept for backward-compat — prefer RuntimeCell in new code. */
export type Cell = RuntimeCell;

export interface ArenaGridState {
  template:  GridTemplate;           // From /api/grid — static, load once
  combatMap: CombatMapDetail | null; // From /api/combat-maps/:key
  cells:     RuntimeCell[];          // 560 cells with runtime state
}


// Geometry helpers

export interface Point {
  x: number;
  y: number;
}

export type ScreenPosition = Point;

export interface GridPosition {
  row: number;   // 0–39
  col: number;   // 0–13
}

export type CellId = number;   // 0–559
