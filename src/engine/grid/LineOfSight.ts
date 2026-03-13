/***
Path:/kingskolossium/src/engine/grid/LineOfSight.ts
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: hasLOS(), getVisibleCells(), buildObstacleSet()
***/

import { CellType, GRID_COLS, GRID_ROWS, type RuntimeCell } from '../types/Grid';
import {
  cellIdToRowCol,
  rowColToCellId,
  getRelX,
  getRelY,
  getDofusDistance,
  isInLine,
  isInDiagonal,
  isValidCell,
} from './GridMath';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Offset applied to each of the two border rays. */
const EPSILON = 0.02;

// ─────────────────────────────────────────────────────────────────────────────
// Public interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface LOSOptions {
  maxRange?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Obstacle set builder
//
// Converts the 40×14 number[][] from arenaStore (or mapsStore) into a flat
// Set<number> of all cell IDs that block LOS.
// Accepts an optional entity set so callers can merge map obstacles +
// entity positions in one call.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a Set of cell IDs that block LOS from a cellTypes grid.
 * OBSTACLE (2) and UNAVAILABLE (0) cells are included.
 * HOLE (3), WALKABLE (1), SPAWN_ALLY (4), SPAWN_ENEMY (5) are NOT included.
 *
 * @param cellTypes  40×14 number[][] from arenaStore.cellTypes
 * @param entityCellIds  Optional additional cell IDs (entity positions) to include
 */
export function buildObstacleSet(
  cellTypes: number[][],
  entityCellIds?: Iterable<number>,
): Set<number> {
  const obstacles = new Set<number>();

  for (let row = 0; row < cellTypes.length; row++) {
    for (let col = 0; col < (cellTypes[row]?.length ?? 0); col++) {
      const t = cellTypes[row][col];
      if (t === CellType.OBSTACLE) {
        obstacles.add(rowColToCellId(row, col));
      }
    }
  }

  if (entityCellIds) {
    for (const id of entityCellIds) obstacles.add(id);
  }

  return obstacles;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core ray marching
// ─────────────────────────────────────────────────────────────────────────────

/**
 * March a single ray from `fromCellId` to `toCellId` in diamond space,
 * with the ray's X origin shifted by `epsilon`.
 *
 * Returns TRUE if the ray reaches the target without hitting an obstacle.
 * Intermediate cells only are checked — start and end are never blocked.
 *
 * The number of samples is 2× the Dofus distance to guarantee every
 * possible intermediate cell is visited at least once.
 */
function marchRay(
  fromCellId: number,
  toCellId:   number,
  obstacles:  Set<number>,
  epsilon:    number,
): boolean {
  const [fromRow, fromCol] = cellIdToRowCol(fromCellId);
  const [toRow,   toCol  ] = cellIdToRowCol(toCellId);

  // Apply epsilon offset to the X component of both endpoints
  const ax = getRelX(fromRow, fromCol) + epsilon;
  const ay = getRelY(fromRow);
  const bx = getRelX(toRow,   toCol  ) + epsilon;
  const by = getRelY(toRow);

  const dist  = getDofusDistance(fromCellId, toCellId);
  const steps = dist * 2;
  if (steps === 0) return true; // same cell → always visible

  let lastCellId = fromCellId;

  for (let i = 1; i < steps; i++) {
    const t  = i / steps;
    const rx = ax + (bx - ax) * t;
    const ry = ay + (by - ay) * t;

    // Convert back from relX/relY to row/col
    const row    = Math.round(ry * 2);
    const isEven = row % 2 === 0;
    const col    = Math.round(isEven ? rx : rx - 0.5);

    // Out-of-bounds → blocked
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
      return false;
    }

    const cellId = rowColToCellId(row, col);

    // Skip start, end, and duplicate snaps
    if (cellId !== lastCellId && cellId !== fromCellId && cellId !== toCellId) {
      if (obstacles.has(cellId)) return false;
      lastCellId = cellId;
    }
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public LOS API  (Set-based — used by IsometricGrid and DofusGrid)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if there is clear line of sight between two cells.
 *
 * Uses dual-ray: BOTH the +ε and −ε rays must be unobstructed for LOS to
 * be considered clear.  If either ray is clear, LOS is clear.
 *
 * EXCEPTION — column-aligned paths (same col, same row parity, the k±28 direction):
 * The ±epsilon rays bracket col and col−1 at parity-transition rows, not the
 * correct pair of cells. These paths use hasLOSColumnAligned() instead.
 *
 * @param fromCellId  Source cell
 * @param toCellId    Target cell
 * @param obstacles   Set of cell IDs that block LOS — build with buildObstacleSet()
 */
export function hasLineOfSight(
  fromCellId: number,
  toCellId:   number,
  obstacles:  Set<number>,
): boolean {
  if (fromCellId === toCellId) return true;

  const [fromRow, fromCol] = cellIdToRowCol(fromCellId);
  const [toRow,   toCol  ] = cellIdToRowCol(toCellId);

  // ── Column-aligned (k±28 axis): same col, same row parity ────────────────
  if (fromCol === toCol && (fromRow % 2) === (toRow % 2)) {
    return hasLOSColumnAligned(fromRow, fromCol, toRow, obstacles);
  }

  // ── All other paths: dual-ray ─────────────────────────────────────────────
  return (
    marchRay(fromCellId, toCellId, obstacles,  EPSILON) ||
    marchRay(fromCellId, toCellId, obstacles, -EPSILON)
  );
}

/**
 * Exact LOS for column-aligned paths (same col, same row parity — the k±28 axis).
 *
 * Only same-parity intermediate rows are checked. The ray travels through the
 * shared vertex point between diff-parity gap cells — those cells are NEVER
 * checked regardless of their type.
 *
 * Rule: blocked only when a cell at (intermediateRow, fromCol) with the same
 * parity as the source is an obstacle. Gap rows (diff-parity) are transparent.
 */
function hasLOSColumnAligned(
  fromRow:   number,
  fromCol:   number,
  toRow:     number,
  obstacles: Set<number>,
): boolean {
  const fromParity = fromRow % 2;
  const step = fromRow < toRow ? 1 : -1;

  for (let row = fromRow + step; row !== toRow; row += step) {
    if (row % 2 === fromParity) {
      // Same-parity: this cell is directly in the path — check it
      if (obstacles.has(rowColToCellId(row, fromCol))) return false;
    }
    // Diff-parity: ray passes through shared vertex between adjacent cells.
    // Those cells are NOT in the path and never block LOS.
  }

  return true;
}

/**
 * Get all cell IDs visible from a source cell.
 *
 * @param sourceCellId  Cell to compute visibility from
 * @param obstacles     Set of blocking cell IDs (from buildObstacleSet)
 * @param maxRange      Maximum Dofus distance to check (default 99 = whole map)
 */
export function getVisibleCells(
  sourceCellId: number,
  obstacles:    Set<number>,
  maxRange      = 99,
): Set<number> {
  const visible = new Set<number>();

  for (let cellId = 0; cellId < GRID_COLS * GRID_ROWS; cellId++) {
    if (!isValidCell(cellId)) continue;
    if (getDofusDistance(sourceCellId, cellId) > maxRange) continue;
    if (hasLineOfSight(sourceCellId, cellId, obstacles)) {
      visible.add(cellId);
    }
  }

  return visible;
}

/**
 * Get all cell IDs that are NOT visible from a source cell.
 * Complement of getVisibleCells — useful for "blocked" visualization.
 */
export function getBlockedCells(
  sourceCellId: number,
  obstacles:    Set<number>,
  maxRange      = 99,
): Set<number> {
  const blocked = new Set<number>();

  for (let cellId = 0; cellId < GRID_COLS * GRID_ROWS; cellId++) {
    if (!isValidCell(cellId)) continue;
    if (getDofusDistance(sourceCellId, cellId) > maxRange) continue;
    if (!hasLineOfSight(sourceCellId, cellId, obstacles)) {
      blocked.add(cellId);
    }
  }

  return blocked;
}

// ─────────────────────────────────────────────────────────────────────────────
// RuntimeCell helpers  (used by DofusGrid and canCastSpell)
//
// These accept the full RuntimeCell array that DofusGrid maintains.
// DofusGrid's methods call buildObstacleSetFromCells() then delegate to the
// Set-based API above so the ray logic lives in exactly one place.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a single RuntimeCell blocks LOS.
 * Exported so DofusGrid can test individual cells without a full obstacle build.
 */
export function cellBlocksLOS(cell: RuntimeCell, checkEntities = true): boolean {
  if (cell.type === CellType.OBSTACLE) return true;
  if (checkEntities && cell.entity) return true;
  return false; // HOLE, WALKABLE, SPAWN_* do not block
}

/**
 * Build an obstacle Set from a RuntimeCell[] array.
 * DofusGrid calls this before delegating to hasLineOfSight / getVisibleCells.
 *
 * @param cells         Full RuntimeCell[] (560 entries)
 * @param checkEntities Whether entity-occupied cells should block (default true)
 */
export function buildObstacleSetFromCells(
  cells:          RuntimeCell[],
  checkEntities = true,
): Set<number> {
  const obstacles = new Set<number>();
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] && cellBlocksLOS(cells[i], checkEntities)) {
      obstacles.add(i);
    }
  }
  return obstacles;
}

// ─────────────────────────────────────────────────────────────────────────────
// Spell cast validation  (uses RuntimeCell[] path — called by DofusGrid)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a spell can be cast from source to target.
 * Validates range, line/diagonal constraints, and LOS in one call.
 */
export function canCastSpell(
  sourceCellId: number,
  targetCellId: number,
  cells: RuntimeCell[],
  spellConfig: {
    minRange:       number;
    maxRange:       number;
    castInLine:     boolean;
    castInDiagonal: boolean;
    losRequired:    boolean;
  },
): { canCast: boolean; reason?: string } {
  const distance = getDofusDistance(sourceCellId, targetCellId);

  if (distance < spellConfig.minRange) return { canCast: false, reason: 'Target too close' };
  if (distance > spellConfig.maxRange) return { canCast: false, reason: 'Target too far' };

  if (spellConfig.castInLine || spellConfig.castInDiagonal) {
    const inLine = isInLine(sourceCellId, targetCellId);
    const inDiag = isInDiagonal(sourceCellId, targetCellId);

    if  (spellConfig.castInLine && !spellConfig.castInDiagonal && !inLine)
      return { canCast: false, reason: 'Must cast in line' };
    if  (spellConfig.castInDiagonal && !spellConfig.castInLine && !inDiag)
      return { canCast: false, reason: 'Must cast in diagonal' };
    if  (spellConfig.castInLine && spellConfig.castInDiagonal && !inLine && !inDiag)
      return { canCast: false, reason: 'Must cast in line or diagonal' };
  }

  if (spellConfig.losRequired) {
    const obstacles = buildObstacleSetFromCells(cells);
    if (!hasLineOfSight(sourceCellId, targetCellId, obstacles))
      return { canCast: false, reason: 'No line of sight' };
  }

  return { canCast: true };
}