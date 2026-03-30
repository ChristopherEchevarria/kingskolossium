/***
Path:/kingskolossium/src/features/arena/components/IsometricGrid.tsx
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: SVG grid, entity sprites, LOS overlay
***/

import { useCallback, useMemo, useRef, useEffect } from 'react';
import { useArenaStore, GridEntity } from '../stores/arenaStore';
import {
  GRID_COLS,
  GRID_ROWS,
  TOTAL_CELLS,
  CELL_DEPTH,
  CELL_WIDTH,
  CELL_HEIGHT,
  CellType,
} from '../../../engine/types/Grid';
import {
  cellIdToRowCol,
  gridToScreen,
  getDiamondPoints,
  GRID_PIXEL_WIDTH,
  GRID_PIXEL_HEIGHT,
} from '../../../engine/grid/GridMath';
import {
  buildObstacleSet,
  getVisibleCells,
} from '../../../engine/grid/LineOfSight';
import { API_BASE_URL } from '../../../api/client';
import { createMockEntity } from "../../../assets/mock_entity/mockEntity";

// ─────────────────────────────────────────────────────────────────────────────
// GridCell
// ─────────────────────────────────────────────────────────────────────────────


// Darken a hex color for the side faces (simulates top-down lighting)
function darkenHex(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 0xff) * factor);
  const g = Math.round(((n >>  8) & 0xff) * factor);
  const b = Math.round(( n        & 0xff) * factor);
  return `rgb(${r},${g},${b})`;
}

function GridCell({
  cellId,
  x,
  y,
  cellType,
  isSelected,
  isVisible,
  isBlocked,
  onClick,
  onContextMenu,
  onDrop,
}: {
  cellId:     number;
  x:          number;
  y:          number;
  cellType:   CellType;
  isSelected: boolean;
  isVisible:  boolean;   // LOS source can see this cell
  isBlocked:  boolean;   // LOS source cannot see this cell
  onClick:    () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDrop:     (e: React.DragEvent) => void;
}) {
  const hw = CELL_WIDTH  / 2;   // 20  — NOT GRID_PIXEL_WIDTH
  const hh = CELL_HEIGHT / 2;   // 10
  const D  = CELL_DEPTH;

  // ── Diamond corner points ─────────────────────────────────────────────────
  const top    = { x,       y: y - hh };
  const right  = { x: x+hw, y        };
  const bottom = { x,       y: y + hh };
  const left   = { x: x-hw, y        };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // ── UNAVAILABLE — fully invisible, no extrusion ───────────────────────────
  if (cellType === CellType.UNAVAILABLE) {
    return (
      <polygon
        points={`${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`}
        fill="none"
        stroke="none"
        opacity={0}
        style={{ pointerEvents: 'none' }}
      />
    );
  }

  // ── HOLE — fully invisible, no extrusion ─────────────────────────────────
  if (cellType === CellType.HOLE) {
    return (
      <polygon
        points={`${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`}
        fill="none"
        stroke="none"
        opacity={0}
        style={{ pointerEvents: 'none' }}
      />
    );
  }

  // ── OBSTACLE — top face shifted UP by D, side height = hh + D (110px) ────
  if (cellType === CellType.OBSTACLE) {
    // Shift the entire top face up by D pixels
    const obsTop    = { x,       y: y - hh - D };
    const obsRight  = { x: x+hw, y:         -D };   // wrong — recalculate below
    const obsBottom = { x,       y: y + hh - D };
    const obsLeft   = { x: x-hw, y:         -D };

    // Correct: shift all 4 corners of the top diamond up by D
    const oTop    = { x,       y: top.y    - D };
    const oRight  = { x: x+hw, y: right.y  - D };
    const oBottom = { x,       y: bottom.y - D };
    const oLeft   = { x: x-hw, y: left.y   - D };

    // Side faces: from shifted diamond corners down to y + hh (base bottom)
    // Left face: oLeft → oBottom → bottom → (left.x, left.y+0) [original left height]
    // Total vertical span of sides: from oLeft.y to bottom.y = hh + D = 110px
    const leftFace = [
      `${oLeft.x},${oLeft.y}`,
      `${oBottom.x},${oBottom.y}`,
      `${bottom.x},${bottom.y}`,
      `${left.x},${left.y}`,
    ].join(' ');

    const rightFace = [
      `${oBottom.x},${oBottom.y}`,
      `${oRight.x},${oRight.y}`,
      `${right.x},${right.y}`,
      `${bottom.x},${bottom.y}`,
    ].join(' ');

    const topFace = `${oTop.x},${oTop.y} ${oRight.x},${oRight.y} ${oBottom.x},${oBottom.y} ${oLeft.x},${oLeft.y}`;

    const baseColor  = isVisible ? '#005F8E' : '#005F8E';
    const leftColor  = darkenHex(baseColor, 0.45);
    const rightColor = darkenHex(baseColor, 0.65);
    const strokeColor = isSelected ? '#5BC0F5' : '#5BC0F5';

    return (
      <g
        opacity={isBlocked ? 1 : 1}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onDragOver={handleDragOver}
        onDrop={onDrop}
        className="grid-cell"
      >
        <polygon points={leftFace}  fill={leftColor}  stroke={strokeColor} strokeWidth={0.5}/>
        <polygon points={rightFace} fill={rightColor} stroke={strokeColor} strokeWidth={0.5}/>
        <polygon points={topFace}   fill={baseColor}  stroke={isSelected ? '#5BC0F5' : '#5BC0F5'} strokeWidth={isSelected ? 1.5 : 1}/>
      </g>
    );
  }

  // ── GROUP 1: WALKABLE, SPAWN_ALLY, SPAWN_ENEMY — standard 3D tile ─────────
  let baseColor: string;
  const [row] = cellIdToRowCol(cellId);
  switch (cellType) {
    case CellType.WALKABLE:
      baseColor = row % 2 === 0 ? '#212b31' : '#36454f'; break;
    case CellType.SPAWN_ALLY:
      baseColor = '#1d4ed8'; break;
    case CellType.SPAWN_ENEMY:
      baseColor = '#c2410c'; break;
    default:
      baseColor = '#212b31';
  }

  if (isVisible) baseColor = '#005F8E';

  const leftColor  = darkenHex(baseColor, 0.45);
  const rightColor = darkenHex(baseColor, 0.65);
  const strokeColor = isSelected ? '#5BC0F5' : '#444';
  const strokeWidth = isSelected ? 1.5 : 0.5;

  // Left face:  left → bottom → bottom+D → left+D
  const leftFace = [
    `${left.x},${left.y}`,
    `${bottom.x},${bottom.y}`,
    `${bottom.x},${bottom.y + D}`,
    `${left.x},${left.y + D}`,
  ].join(' ');

  // Right face: bottom → right → right+D → bottom+D
  const rightFace = [
    `${bottom.x},${bottom.y}`,
    `${right.x},${right.y}`,
    `${right.x},${right.y + D}`,
    `${bottom.x},${bottom.y + D}`,
  ].join(' ');

  const topFace = `${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`;

  return (
    <g
      opacity={isBlocked ? 1 : 1}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDragOver={handleDragOver}
      onDrop={onDrop}
      className="grid-cell"
    >
      <polygon points={leftFace}  fill={leftColor}  stroke={strokeColor} strokeWidth={strokeWidth * 0.5}/>
      <polygon points={rightFace} fill={rightColor} stroke={strokeColor} strokeWidth={strokeWidth * 0.5}/>
      <polygon points={topFace}   fill={baseColor}  stroke={strokeColor} strokeWidth={strokeWidth}/>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GridEntitySprite
// ─────────────────────────────────────────────────────────────────────────────
const SPRITE_W = 55;   // ~85% of CELL_WIDTH (40)
const SPRITE_H = 55;

function GridEntitySprite({
  entity,
  x,
  y,
}: {
  entity: GridEntity;
  x:      number;
  y:      number;
}) {

  const href = entity.localImage
    ? entity.localImage
    : API_BASE_URL + entity.imageUrl;
  return (
    <g className="pointer-events-none">
      <image
        href={href}
        x={x - SPRITE_W / 2}
        y={y - SPRITE_H / 2}
        width={SPRITE_W}
        height={SPRITE_H}
      />
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IsometricGrid
// ─────────────────────────────────────────────────────────────────────────────

const NON_INTERACTIVE = new Set([CellType.UNAVAILABLE, CellType.HOLE, CellType.OBSTACLE]);

export function IsometricGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    entities,
    selectedCellId,
    cellTypes,
    visibleCells,
    selectCell,
    addEntity,
    removeEntity,
    setVisibleCells,
    resetEntities,
  } = useArenaStore();

  // ── Obstacle set ───────────────────────────────────────────────────────────
  // Only OBSTACLE cells block LOS rays (per spec).
  // Entity positions are added so units block each other's sight lines.
  const obstacles = useMemo(() => {
    if (!cellTypes) return new Set<number>();
    const entityCells = new Set(
      Array.from(entities.values()).map(e => e.cellId)
    );
    return buildObstacleSet(cellTypes, entityCells);
  }, [cellTypes, entities]);

  // ── LOS computation ────────────────────────────────────────────────────────
  // Runs whenever the selected source cell or obstacle layout changes.
  useEffect(() => {
    if (selectedCellId !== null) {
      setVisibleCells(getVisibleCells(selectedCellId, obstacles));
    } else {
      setVisibleCells(new Set());
    }
  }, [selectedCellId, obstacles, setVisibleCells]);

  // ── Interaction handlers ───────────────────────────────────────────────────
  const handleCellLeftClick = useCallback((cellId: number) => {
    const [row, col] = cellIdToRowCol(cellId);
    const cellType = cellTypes
    ? (cellTypes[row]?.[col] ?? CellType.UNAVAILABLE) as CellType
    : CellType.WALKABLE;

  // Allow click on interactive cells AND entity-occupied cells
    const hasEntity = Array.from(entities.values()).some(
    (e) => e.cellId === cellId
    );
    if (!hasEntity && NON_INTERACTIVE.has(cellType)) return;

  // Toggle: click same cell deselects, click new cell selects
  selectCell(selectedCellId === cellId ? null : cellId);
  }, [cellTypes, entities, selectedCellId, selectCell]
  );

  const handleCellRightClick = useCallback( (cellId: number, e: React.MouseEvent) => {
      e.preventDefault();
      const [row, col] = cellIdToRowCol(cellId);
      const cellType = cellTypes
      ? (cellTypes[row]?.[col] ?? CellType.UNAVAILABLE) as CellType
      : CellType.WALKABLE;
      if (NON_INTERACTIVE.has(cellType)) return;
      const occupant = Array.from(entities.values()).find( (e) => e.cellId === cellId);
      if (occupant) {
          removeEntity(occupant.id);
          return;
          }
      addEntity(createMockEntity(cellId));
      },[cellTypes, entities, addEntity, removeEntity]
  );


  const handleDrop = useCallback((cellId: number, e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'monster') {
        const monster = data.monster;
        const newEntity: GridEntity = {
          id:       `entity_${Date.now()}_${cellId}`,
          type:     'monster',
          entityId: monster.monster_id,
          name:     monster.name_en,
          team:     'enemy',
          cellId,
          imageUrl: monster.image_url,
          stats: {
            hp: 1000, hpMax: 1000,
            ap: 6,    apMax: 6,
            mp: 3,    mpMax: 3,
            earthRes: 0, fireRes: 0, waterRes: 0, airRes: 0, neutralRes: 0,
          },
          spells: [],
        };
        addEntity(newEntity);
      }
    } catch {
      // malformed drag data — ignore
    }
  }, [addEntity]);

  const handleReset = useCallback(() => {
    resetEntities();
    selectCell(null);
  }, [resetEntities, selectCell]);

  // ── Cell elements (memoised) ───────────────────────────────────────────────
  const cellElements = useMemo(() => {
    const elements = [];
    const losActive = selectedCellId !== null;

    for (let cellId = 0; cellId < TOTAL_CELLS; cellId++) {
      const [row, col] = cellIdToRowCol(cellId);
      const { x, y }  = gridToScreen(row, col);

      const cellType = cellTypes
        ? (cellTypes[row]?.[col] ?? CellType.UNAVAILABLE) as CellType
        : CellType.WALKABLE;

      const interactive = !NON_INTERACTIVE.has(cellType);
      const isVisible   = interactive && visibleCells.has(cellId);
      const isBlocked   = interactive && losActive && !isVisible;

      elements.push(
        <GridCell
          key={cellId}
          cellId={cellId}
          x={x}
          y={y}
          cellType={cellType}
          isSelected={selectedCellId === cellId}
          isVisible={isVisible}
          isBlocked={isBlocked}
          onClick={() => handleCellLeftClick(cellId)}
          onContextMenu={(e) => handleCellRightClick(cellId, e)}
          onDrop={(e) => handleDrop(cellId, e)}
        />
      );
    }

    return elements;
  }, [cellTypes, selectedCellId, visibleCells, handleCellLeftClick,handleCellRightClick, handleDrop]);

  // ── Entity sprites (memoised) ──────────────────────────────────────────────
  const entitySprites = useMemo(() => (
    Array.from(entities.values()).map(entity => {
      const [row, col] = cellIdToRowCol(entity.cellId);
      const { x, y }  = gridToScreen(row, col);
      return (
        <GridEntitySprite
          key={entity.id}
          entity={entity}
          x={x}
          y={y-14}
        />
      );
    })
  ), [entities]);

  // ── Selected cell label ────────────────────────────────────────────────────
  const selectedCellLabel = useMemo(() => {
    if (selectedCellId === null) return null;
    const [row, col] = cellIdToRowCol(selectedCellId);
    const { x, y }  = gridToScreen(row, col);
    return (
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fontSize="7"
        fill="#5BC0F5"
        fontFamily="monospace"
        fontWeight="bold"
        className="pointer-events-none"
      >
        {selectedCellId}
      </text>
    );
  }, [selectedCellId]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
    >
      {/* Reset button */}
      <button
        onClick={handleReset}
        className="absolute top-2 right-2 z-10 bg-app-blue bg-opacity-80 hover:bg-opacity-100
                   text-app-white text-sm font-mono px-2 py-1 rounded transition-opacity"
        title="Clear entities and LOS"
      >
        ↺
      </button>

      <svg
        width="100%"
        height="100%"
        viewBox={`5 10 ${GRID_PIXEL_WIDTH} ${GRID_PIXEL_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid cells */}
        <g>{cellElements}</g>

        {/* Entity sprites — rendered on top of cells */}
        <g>{entitySprites}</g>

        {/* Selected cell ID label */}
        {selectedCellLabel}
      </svg>

      {/* Info overlay */}
      <div className="absolute bottom-2 left-2 bg-app-blue bg-opacity-80 text-app-white
                      text-xs font-mono px-2 py-1 rounded pointer-events-none">
        <div>{TOTAL_CELLS} cells ({GRID_COLS}×{GRID_ROWS})</div>
        {selectedCellId !== null && (
          <div>LOS from {selectedCellId} — {visibleCells.size} visible</div>
        )}
        {entities.size > 0 && (
          <div>Entities: {entities.size}</div>
        )}
      </div>
    </div>
  );
}

export default IsometricGrid;