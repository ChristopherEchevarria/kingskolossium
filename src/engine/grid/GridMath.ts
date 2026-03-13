/***
Path:/kingskolossium/src/engine/grid/GridMath.ts
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: gridToScreen(), cellIdToRowCol(), getDiamondPoints()
***/

import {
  GRID_COLS,
  GRID_ROWS,
  TOTAL_CELLS,
  CELL_WIDTH,
  CELL_HEIGHT,
  GRID_PADDING,
  type ImmediateCellNeighbors,
} from '../types/Grid';

// ─────────────────────────────────────────────────────────────────────────────
// Re-exported constants (components import from here, not types/Grid directly)
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_GRID_CONSTANTS = {
  CELL_WIDTH,
  CELL_HEIGHT,
  GRID_PADDING,
  GRID_COLS,
  GRID_ROWS,
  TOTAL_CELLS,
} as const;

// Derived pixel dimensions for SVG viewBox
// Rightmost center: odd row, col 13 → x = PAD + 13*W + W/2
const MAX_CENTER_X = GRID_PADDING + (GRID_COLS - 1) * CELL_WIDTH + CELL_WIDTH / 2;
// Bottom center: row 39 → y = PAD + 39 * H/2
const MAX_CENTER_Y = GRID_PADDING + (GRID_ROWS - 1) * (CELL_HEIGHT / 2);

export const GRID_PIXEL_WIDTH  = MAX_CENTER_X + CELL_WIDTH  / 2 + GRID_PADDING; // ~610
export const GRID_PIXEL_HEIGHT = MAX_CENTER_Y + CELL_HEIGHT / 2 + GRID_PADDING; // ~280

// ─────────────────────────────────────────────────────────────────────────────
// Cell ID  ↔  Row / Col
// ─────────────────────────────────────────────────────────────────────────────

// FIX 1: returns a tuple [row, col] — all callers use array destructuring:
//   const [row, col] = cellIdToRowCol(cellId);
export function cellIdToRowCol(cellId: number): [number, number] {
  return [Math.floor(cellId / GRID_COLS), cellId % GRID_COLS];
}

export function rowColToCellId(row: number, col: number): number {
  return row * GRID_COLS + col;
}

export function isValidCell(cellId: number): boolean {
  return Number.isInteger(cellId) && cellId >= 0 && cellId < TOTAL_CELLS;
}

// ─────────────────────────────────────────────────────────────────────────────
// Diamond-space coordinates (relX / relY)
//
// The staggered grid is parameterized so that every edge-sharing hop is
// exactly (±0.5, ±0.5) in (relX, relY).
//   Even rows:  relX = col,       relY = row * 0.5
//   Odd rows:   relX = col + 0.5, relY = row * 0.5
// ─────────────────────────────────────────────────────────────────────────────

export function getRelX(row: number, col: number): number {
  return row % 2 === 0 ? col : col + 0.5;
}

export function getRelY(row: number): number {
  return row * 0.5;
}

// ─────────────────────────────────────────────────────────────────────────────
// Distance — minimum edge-sharing hop count (Chebyshev on doubled coords)
//
//   u = even_row ? 2*col : 2*col+1   (maps relX to integers)
//   v = row
//   distance = max(|Δu|, |Δv|)
//
// Same-row cells share corners, not edges → e.g. cell 0→1 costs 2 MP.
// Edge-sharing neighbors → e.g. cell 0→14 costs 1 MP.
// ─────────────────────────────────────────────────────────────────────────────

export function getDofusDistance(cellA: number, cellB: number): number {
  const [aRow, aCol] = cellIdToRowCol(cellA);
  const [bRow, bCol] = cellIdToRowCol(cellB);

  const ua = aRow % 2 === 0 ? 2 * aCol : 2 * aCol + 1;
  const va = aRow;
  const ub = bRow % 2 === 0 ? 2 * bCol : 2 * bCol + 1;
  const vb = bRow;

  return Math.max(Math.abs(ua - ub), Math.abs(va - vb));
}

export function getHeuristic(cellA: number, cellB: number): number {
  return getDofusDistance(cellA, cellB);
}

// ─────────────────────────────────────────────────────────────────────────────
// Adjacency — the 4 edge-sharing neighbors in staggered layout
//
// Each cell has exactly 4 neighbors (upLeft, upRight, downLeft, downRight).
// The offset depends on whether the current row is even or odd.
//
//   Even row neighbors:         Odd row neighbors:
//     upLeft   = cellId - (COLS+1)   cellId - COLS
//     upRight  = cellId - COLS       cellId - (COLS-1)
//     downLeft = cellId + (COLS-1)   cellId + COLS
//     downRight= cellId + COLS       cellId + (COLS+1)
// ─────────────────────────────────────────────────────────────────────────────

export function getNeighbors(cellId: number): ImmediateCellNeighbors {
  const row = Math.floor(cellId / GRID_COLS);
  const col = cellId % GRID_COLS;
  const even = row % 2 === 0;

  const canUp    = row > 0;
  const canDown  = row < GRID_ROWS - 1;
  const canLeft  = even ? col > 0          : true;             // odd rows always have a left neighbor
  const canRight = even ? true             : col < GRID_COLS - 1;

  return {
    upLeft:    canUp   && canLeft  ? cellId - (even ? GRID_COLS + 1 : GRID_COLS)     : null,
    upRight:   canUp   && canRight ? cellId - (even ? GRID_COLS     : GRID_COLS - 1) : null,
    downLeft:  canDown && canLeft  ? cellId + (even ? GRID_COLS - 1 : GRID_COLS)     : null,
    downRight: canDown && canRight ? cellId + (even ? GRID_COLS     : GRID_COLS + 1) : null,
  };
}

export function getAdjacentCells(cellId: number): number[] {
  const n = getNeighbors(cellId);
  return [n.upLeft, n.upRight, n.downLeft, n.downRight]
    .filter((id): id is number => id !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen projection — flat staggered layout
//
//   Same row    = same y
//   col steps   → x  by +CELL_WIDTH
//   Odd rows    → x  shifted right by CELL_WIDTH/2
//   Each row    → y  drops  by CELL_HEIGHT/2
// ─────────────────────────────────────────────────────────────────────────────

export function gridToScreen(row: number, col: number): { x: number; y: number } {
  const isOdd = row % 2 === 1;
  return {
    x: GRID_PADDING + col * CELL_WIDTH + (isOdd ? CELL_WIDTH / 2 : 0),
    y: GRID_PADDING + row * (CELL_HEIGHT / 2),
  };
}

export function screenToGrid(
  screenX: number,
  screenY: number,
  cellWidth:  number,
  cellHeight: number,
  offsetX = 0,
  offsetY = 0,
): { row: number; col: number; cellId: number } | null {
  const sx = screenX - offsetX;
  const sy = screenY - offsetY;
  const halfH = cellHeight / 2;

  const relX = (sx / cellWidth  + sy / halfH) / 2;
  const relY = (sy / halfH - sx / cellWidth)  / 2;

  const row    = Math.round(relY * 2);
  const isEven = row % 2 === 0;
  const col    = Math.round(isEven ? relX : relX - 0.5);

  if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return null;
  return { row, col, cellId: rowColToCellId(row, col) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Line / diagonal checks — "cast in line / diagonal" spell requirements
//
// "In line" = along one of the 4 diagonal-neighbor-chain axes (relX±relY const).
// "In diagonal" = same relX column or same relY row (perpendicular axes).
//
// FIX (isInLine / isInDiagonal): previously used a.row / a.col (object access)
// on a tuple return value — always produced undefined.  Now uses [row, col]
// destructuring to match cellIdToRowCol's actual return type.
// ─────────────────────────────────────────────────────────────────────────────

export function isInLine(cellA: number, cellB: number): boolean {
  const [aRow, aCol] = cellIdToRowCol(cellA); // FIX: was a.row / a.col
  const [bRow, bCol] = cellIdToRowCol(cellB);

  const relXa = getRelX(aRow, aCol);
  const relYa = getRelY(aRow);
  const relXb = getRelX(bRow, bCol);
  const relYb = getRelY(bRow);

  const sumA = relXa + relYa;
  const sumB = relXb + relYb;
  const diffA = relXa - relYa;
  const diffB = relXb - relYb;

  return Math.abs(sumA - sumB) < 0.01 || Math.abs(diffA - diffB) < 0.01;
}

export function isInDiagonal(cellA: number, cellB: number): boolean {
  const [aRow, aCol] = cellIdToRowCol(cellA); // FIX: was a.row / a.col
  const [bRow, bCol] = cellIdToRowCol(cellB);
  const relXa = getRelX(aRow, aCol);
  const relYa = getRelY(aRow);
  const relXb = getRelX(bRow, bCol);
  const relYb = getRelY(bRow);

  return Math.abs(relXa - relXb) < 0.01 || Math.abs(relYa - relYb) < 0.01;
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG rendering helper
// ─────────────────────────────────────────────────────────────────────────────

export function getDiamondPoints(cx: number, cy: number): string {
  const hw = CELL_WIDTH  / 2;
  const hh = CELL_HEIGHT / 2;
  return `${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}`;
}