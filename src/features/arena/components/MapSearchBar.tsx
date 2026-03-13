/***
Path:/kingskolossium/src/features/arena/components/MapSearchBar.tsx
Created by: Christopher Echevarria
Date of creation: 08Mar2026
Purpose and Description: Liquid-glass search input
***/

interface MapSearchBarProps {
  value: string;
  onChange: (query: string) => void;
}

export function MapSearchBar({ value, onChange }: MapSearchBarProps) {
  return (
    <div className="liquid-glass rounded-xl px-5 py-2 mb-3 flex items-center gap-3">
      {/* Icon */}
      <svg
        className="w-4 h-4 flex-shrink-0 text-[#FFFFFF]"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search maps…"
        className="
          bg-transparent outline-none flex-1
          text-app-white font-mono text-sm
          placeholder-[#FFFFFF]/40
          caret-[#5BC0F5]
        "
      />

      {/* Clear button — only visible when there's text */}
      {value && (
        <button
          onClick={() => onChange('')}
          title="Clear search"
          className="
            flex-shrink-0 w-5 h-5 rounded-full
            flex justify-center
            text-[#5BC0F5]/70 hover:text-[#5BC0F5]
            bg-[rgba(0,95,142,0.3)] hover:bg-[rgba(0,95,142,0.55)]
            transition-all duration-150 text-xs font-bold
          "
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default MapSearchBar;
