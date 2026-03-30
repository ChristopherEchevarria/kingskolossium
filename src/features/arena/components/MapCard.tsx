/***
Path:/kingskolossium/src/features/arena/components/MapCard.tsx
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: Single map preview card
***/

import { MapInfo, parsePreviewImg } from '../stores/arenaStore';
import { API_BASE_URL } from '../../../api/client'

// Roman numeral converter — I–X is sufficient for Dofus map variants
function toRoman(n: number | null): string {
  if (!n || n <= 0) return '';
  const table: [number, string][] = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  for (const [val, sym] of table) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result;
}

interface MapCardProps {
  map:        MapInfo;
  isSelected: boolean;
  onClick:    () => void;
}

export function MapCard({ map, isSelected, onClick }: MapCardProps) {

  let roman = null
  if (map.preview_image_path){
      roman = toRoman(parsePreviewImg(map.preview_image_path));
      }
  const label = map.combat_map_id + "\n" + map.displayName + (roman ? ' ' + roman : '');

  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col rounded-lg cursor-pointer border-2 bg-app-dark-blue
        transition-all duration-150
        ${isSelected
          ? 'border-app-white shadow-lg shadow-app-blue scale-100'
          : 'border-transparent opacity-40 scale-95 hover:opacity-75'}
      `}
    >
      {/* Preview image */}
      <div className="w-full bg-black rounded-t overflow-hidden" style={{ aspectRatio: '16/10' }}>
        {map.preview_image_path ? (
          <img
            src={`${API_BASE_URL}/api/combat-maps/${map.preview_image_path}/preview-image/`}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-mono">
            No image
          </div>
        )}
      </div>

      {/* Map name */}
      <div className="p-2 text-center font-mono text-app-white text-sm font-bold leading-tight">
        {label}

      </div>
    </div>
  );
}

export default MapCard;