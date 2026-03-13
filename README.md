# kingskolossium
Dofus game helper


kingskolossium/
├── public/                      # Static assets (favicon, og-image)
│   └── favicon.svg
├── src/
│   ├── api/
│   │   ├── client.ts            # Axios instance, API_BASE_URL env var
│   │   ├── combatMaps.ts        # fetchCombatMaps(), fetchCombatMap()
│   │   └── index.ts             # Re-exports
│   ├── engine/
│   │   ├── grid/
│   │   │   ├── GridMath.ts      # gridToScreen(), cellIdToRowCol(), getDiamondPoints()
│   │   │   ├── LineOfSight.ts   # hasLOS(), getVisibleCells(), buildObstacleSet()
│   │   │   └── index.ts
│   │   └── types/
│   │       ├── Grid.ts          # CellType enum, GRID_COLS, GRID_ROWS, interfaces
│   │       └── index.ts
│   ├── features/
│   │   └── arena/
│   │       ├── ArenaPage.tsx    # Root layout: search + nav + carousel + grid
│   │       ├── index.ts
│   │       ├── components/
│   │       │   ├── IsometricGrid.tsx   # SVG grid, entity sprites, LOS overlay
│   │       │   ├── MapSelection.tsx    # 3-card carousel with ◀ ▶ arrows
│   │       │   ├── MapCard.tsx         # Single map preview card
│   │       │   ├── MapSearchBar.tsx    # Liquid-glass search input
│   │       │   └── MapIndexNav.tsx     # Quick-jump pill buttons
│   │       ├── hooks/
│   │       │   └── useMapLoader.ts    # Shared async map-load logic
│   │       └── stores/
│   │           └── arenaStore.ts      # Zustand store (entities, maps, LOS state)
│   ├── styles/
│   │   └── globals.css          # Tailwind directives, custom CSS vars
│   ├── App.tsx                  # Router — single route "/" → ArenaPage
│   └── main.tsx                 # React 18 root, QueryClientProvider
├── .env.example                 # VITE_API_URL=https://api.kingskolossium.com
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── .gitignore
├── .gitattributes
└── README.md

