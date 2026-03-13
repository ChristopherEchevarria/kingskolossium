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

// ─────────────────────────────────────────────────────────────────────────────
// GridCell
// ─────────────────────────────────────────────────────────────────────────────

function GridCell({
  cellId,
  x,
  y,
  cellType,
  isSelected,
  isVisible,
  isBlocked,
  onClick,
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
  onDrop:     (e: React.DragEvent) => void;
}) {
  const [row] = cellIdToRowCol(cellId);
  const isRowEven = row % 2 === 0;

  // ── Base fill colour per cell type ───────────────────────────────────────
  let fillColor: string;

  switch (cellType) {
    case CellType.WALKABLE:
      fillColor = isRowEven ? '#212b31' : '#36454f';
      break;
    case CellType.OBSTACLE:
      fillColor = '#874F89';
      break;
    case CellType.HOLE:
      fillColor = '#4C3447';
      break;
    case CellType.SPAWN_ALLY:
      fillColor = '#1d4ed8';
      break;
    case CellType.SPAWN_ENEMY:
      fillColor = '#c2410c';
      break;
    case CellType.UNAVAILABLE:
    default:
      fillColor = '#111111';
      break;
  }

  // ── LOS overlay ──────────────────────────────────────────────────────────
  // isVisible  → tint the cell with Honolulu blue (clear LOS path)
  // isBlocked  → dim the base colour (LOS cannot reach this cell)
  if (isVisible)  fillColor = '#005F8E';
  const opacity = isBlocked ? .5 : 1;

  // ── Selection stroke ──────────────────────────────────────────────────────
  const strokeColor = isSelected ? '#5BC0F5' : '#444';
  const strokeWidth = isSelected ? 1.5       : 0.5;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <polygon
      points={getDiamondPoints(x, y)}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      opacity={opacity}
      className="grid-cell"
      onClick={onClick}
      onDragOver={handleDragOver}
      onDrop={onDrop}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GridEntitySprite
// ─────────────────────────────────────────────────────────────────────────────

function GridEntitySprite({
  entity,
  x,
  y,
}: {
  entity: GridEntity;
  x:      number;
  y:      number;
}) {
  return (
    <g className="pointer-events-none">
      <circle
        cx={x}
        cy={y + 3}
        r={7}
        fill={entity.team === 'ally' ? '#0076B6' : '#dc2626'}
        stroke="#fff"
        strokeWidth={1}
      />
      <image
        href={API_BASE_URL + entity.imageUrl}
        x={x - 12}
        y={y - 15}
        width={24}
        height={24}
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


  const handleCellClick = useCallback((cellId: number) => {
    const [row, col] = cellIdToRowCol(cellId);
    const cellType = cellTypes
    ? (cellTypes[row]?.[col] ?? CellType.UNAVAILABLE) as CellType
    : CellType.WALKABLE;
    if (NON_INTERACTIVE.has(cellType)) return;

     const occupant = Array.from(entities.values()).find(e => e.cellId === cellId);
    if (occupant) {
    removeEntity(occupant.id);
    return;
    }
  selectCell(selectedCellId === cellId ? null : cellId);
  }, [cellTypes, entities, selectedCellId, selectCell, removeEntity]);

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
          onClick={() => handleCellClick(cellId)}
          onDrop={(e) => handleDrop(cellId, e)}
        />
      );
    }

    return elements;
  }, [cellTypes, selectedCellId, visibleCells, handleCellClick, handleDrop]);

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
          y={y}
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
      className="w-full h-full grid-bg rounded overflow-hidden relative"
      onContextMenu={(e) => e.preventDefault()}
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
        viewBox={`0 0 ${GRID_PIXEL_WIDTH} ${GRID_PIXEL_HEIGHT}`}
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