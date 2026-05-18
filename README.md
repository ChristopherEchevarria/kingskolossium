# Kings Kolossium

> A full-stack Dofus 3.0 Unity companion app — tactical arena explorer and equipment build planner, built from scratch.

🌐 **Live:** [kingskolossium.com](https://kingskolossium.com)

---

## What Is This?

Kings Kolossium is a web-based companion tool for Dofus 3.0 Unity players. It has two core modes:

**Combat Mode** — Visualize Dofus combat maps with a custom isometric SVG grid engine, simulate line-of-sight via dual-ray marching, and plan spawn and positioning strategy before or during battle.

**Build Mode** — Browse and equip any item in the game, allocate character stat points, track active set bonuses, and calculate total stat totals across equipment and base stats — all live, without saving to a server.

This is the **public-facing frontend**. It is paired with a private admin backend called *The 13th Control Center* which handles map calibration, data management, and deployment workflows.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 5.9, Vite 7 |
| Styling | Tailwind CSS 3, custom liquid-glass CSS |
| State | Zustand (+ `persist` middleware) |
| Data fetching | Axios, TanStack Query |
| Grid engine | Custom SVG renderer (pure TypeScript) |
| LOS engine | Dual-ray marching algorithm (pure TypeScript) |
| Routing | React Router v6 |
| Backend | FastAPI + uvicorn (Python) |
| Database | PostgreSQL 17 |
| Hosting | GitHub Pages (frontend) + Cloudflare Tunnel (API) |
| CI/CD | GitHub Actions |

---

## Architecture

```
User Browser
    ↓  HTTPS
kingskolossium.com  →  GitHub Pages (React/Vite static build)
    ↓  API calls
api.kingskolossium.com  →  Cloudflare Tunnel (zero open ports)
    ↓
Backend Server  →  uvicorn + FastAPI  →  PostgreSQL 17
    ↑  Logical Replication (Tailscale mesh VPN)
Private Server  →  PostgreSQL 17 Publisher  →  13th Control Center
```

- **No open ports** on the server — Cloudflare Tunnel creates an outbound encrypted connection
- **Automatic HTTPS** on both frontend and API via GitHub Pages and Cloudflare respectively
- **Real-time DB replication** via PostgreSQL logical replication over a Tailscale WireGuard mesh

---

## Key Features

### Combat Mode
- **Isometric SVG Grid** — 560-cell staggered diamond grid rendered entirely in SVG with `gridToScreen()` projection math
- **Line of Sight Engine** — dual-ray marching algorithm with epsilon offsets, column-aligned path detection, and obstacle sets
- **Map Carousel** — 3-card sliding carousel with search, index navigation, and async map loading
- **Deployed-only filtering** — API layer enforces `calibration_status=deployed` so only production-ready maps are served

### Build Mode
- **Equipment Browser** — paginated, searchable item grid with multi-type filter pills; data is language-aware (EN/FR/ES)
- **Equipment Slots** — full character sheet with 16+ named slots; equipping auto-routes to the correct slot or triggers a swap popup for ambiguous items
- **Active Sets Panel** — live detection of equipped set pieces with per-bonus threshold tracking
- **Total Characteristics** — live aggregation of all equipped item effects broken into Primary, Elemental, Combat, and Secondary stat groups
- **Primary Stat Allocator** — 995-point base pool + scroll bonus (up to +100 per stat) with marginal cost scaling per Dofus rules
- **Breed Selector** — choose character class and gender (currently cosmetic, wired for future stat modifiers)

### Site-Wide
- **Authentication** — JWT-based user accounts with register/login flow; token persisted in `localStorage` and rehydrated on load
- **Badge System** — tiered user roles (`visitor`, `loyal`, `king`) displayed in the site header
- **Language Selector** — switch between EN, FR, and ES; preference persisted across sessions; drives all API label fetches
- **Liquid Glass UI** — custom CSS component system with `backdrop-filter` blur and Honolulu Blue theme

---

## Routes

| Path | Component | Description |
|---|---|---|
| `/` | `ArenaPage` | Main app — Combat or Build mode via toggle |
| `/login` | `LoginPage` | Email + password login |
| `/signup` | `SignupPage` | New user registration |

---

## Project Structure

```
src/
├── api/
│   ├── auth.ts              # register, login, fetchCurrentUser
│   ├── breeds.ts            # fetchBreeds()
│   ├── builds.ts            # save/load build endpoints (in progress)
│   ├── characteristics.ts   # fetchCharacteristics()
│   ├── client.ts            # Axios instance + VITE_API_URL config
│   ├── combatMaps.ts        # fetchCombatMaps() — status=deployed filter
│   ├── equipment.ts         # fetchEquipment(), fetchEquipmentTypes()
│   ├── sets.ts              # fetchSets()
│   └── index.ts
├── engine/
│   ├── grid/
│   │   ├── GridMath.ts      # gridToScreen(), getDofusDistance(), getDiamondPoints()
│   │   └── LineOfSight.ts   # hasLineOfSight(), getVisibleCells(), buildObstacleSet()
│   └── types/
│       └── Grid.ts          # CellType enum, CombatMapInfo, GridCell interfaces
└── features/
    ├── arena/
    │   ├── ArenaPage.tsx              # Root layout — renders ModeToggle + active mode
    │   ├── components/
    │   │   ├── CombatMode.tsx         # Wraps map search, carousel, isometric grid
    │   │   ├── IsometricGrid.tsx      # SVG grid + LOS overlay + entity sprites
    │   │   ├── MapCard.tsx            # Preview card with image + roman numeral variant
    │   │   ├── MapIndexNav.tsx        # Quick-jump pill nav
    │   │   ├── MapSearchBar.tsx       # Liquid-glass search
    │   │   ├── MapSelection.tsx       # 3-card carousel
    │   │   └── ModeToggle.tsx         # Combat / Build mode toggle buttons
    │   ├── hooks/
    │   │   └── useMapLoader.ts        # Async map detail loading
    │   └── stores/
    │       └── arenaStore.ts          # Zustand — maps, entities, LOS state, active mode
    ├── auth/
    │   ├── LoginPage.tsx
    │   ├── SignupPage.tsx
    │   └── stores/
    │       └── authStore.ts           # Zustand — user, token, isAuthenticated
    ├── build/
    │   ├── BuildPage.tsx              # Build mode root layout
    │   ├── characteristicGroups.ts    # Stat grouping config (primary/elemental/combat/secondary)
    │   ├── primaryStats.ts            # Point pool math, scroll cap, PrimaryStatId types
    │   ├── slots.ts                   # SlotId definitions, SLOT_ACCEPTS, SINGLE_SLOT_TYPE
    │   ├── components/
    │   │   ├── ActiveSetsPanel.tsx
    │   │   ├── BuildActions.tsx
    │   │   ├── EquipmentActiveSlots.tsx
    │   │   ├── EquipmentCard.tsx
    │   │   ├── EquipmentFilter.tsx
    │   │   ├── EquipmentGrid.tsx
    │   │   ├── EquipmentSearchBar.tsx
    │   │   ├── TotalCharacteristics.tsx
    │   │   └── card/                  # CardHeader, CharacteristicEffects, WeaponEffects, etc.
    │   │   └── totals/                # PrimaryStats, ElementalStats, CombatStats, SecondaryStats
    │   ├── hooks/
    │   │   ├── useEquipmentTotals.ts  # Aggregates effects across all equipped slots
    │   │   └── useReferenceData.ts    # Loads characteristics, breeds, sets on mount
    │   ├── stores/
    │   │   └── buildStore.ts          # Zustand — equipped slots, filters, stat allocation, active sets
    │   └── utils/
    │       ├── aggregateEquipmentEffects.ts
    │       ├── combatBaseValues.ts
    │       ├── effectUtils.ts
    │       └── selectActiveSets.ts
    ├── common/
    │   └── popups/
    │       ├── PopupProvider.tsx       # Mounts all popups at app root
    │       ├── SwapPopup.tsx           # Slot conflict resolution
    │       ├── BreedSelectorPopup.tsx  # Class + gender picker
    │       ├── SetInfoPopup.tsx        # Set bonus detail view
    │       ├── popupStore.ts           # Zustand — popup stack
    │       └── types.ts               # PopupId, PopupConfig, per-popup payload types
    └── header/
        ├── SiteHeader.tsx
        ├── components/
        │   ├── BadgeStrip.tsx          # User badge (visitor / loyal / king)
        │   ├── HamburgerMenu.tsx
        │   ├── LanguageSelector.tsx    # EN / FR / ES picker
        │   └── LoginButton.tsx
        └── stores/
            └── headerStore.ts          # Zustand + persist — language, menuOpen, badgeStatus
```

---

## Local Development

```bash
# Clone
git clone git@github.com:ChristopherEchevarria/kingskolossium.git
cd kingskolossium

# Install
npm install

# Configure API
cp .env.example .env.local
# Edit .env.local: VITE_API_URL=http://localhost:8000

# Run
npm run dev
```

The frontend runs on `localhost:5173`. It expects a FastAPI backend at `VITE_API_URL`. Without the backend, the grid renders but maps won't load and auth endpoints will fail.

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

---

## Deployment

Deployment is fully automated via GitHub Actions. Every push to `main`:

1. Installs Node 20
2. Runs `npm run build` with `VITE_API_URL`
3. Uploads `dist/` to GitHub Pages

The API backend is served from a home server through Cloudflare Tunnel — no cloud hosting costs.

---

## The Broader System

This repo is the public half of a two-frontend system:

| Project | Audience | Maps shown |
|---|---|---|
| **kingskolossium** (this repo) | Public users | `status=deployed` only |
| **The 13th Control Center** (private) | Admin only | All maps, calibration tools |

Both frontends share one FastAPI backend. The API layer enforces access control through the `calibration_status` filter — no authentication required since all publicly served data is intentionally public game data.

---

## Future Implementations

- **Save/Load Builds** — persist named builds server-side via the `/builds` API (endpoint scaffolded, frontend wiring in progress)
- **Share Build Link** — generate a shareable URL or QR code for a given build configuration
- **Chafer Placement** — left-click on the isometric grid to place a temporary obstacle for LOS simulation
- **Entity Drag & Drop** — place monsters or ally units onto grid cells; LOS and spawn overlays update in real time
- **Breed Stat Modifiers** — wire selected breed/gender into the characteristics total calculation

---

## Author

**Christopher Echevarria** — [github.com/ChristopherEchevarria](https://github.com/ChristopherEchevarria)
