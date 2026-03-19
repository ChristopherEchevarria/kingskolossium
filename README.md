# Kings Kolossium

> A real-time battle simulation and arena tool for **Dofus 3.0 Unity** — built as a full-stack personal project from the ground up.

🌐 **Live:** [kingskolossium.com](https://kingskolossium.com)

---

## What Is This?

Kings Kolossium is a web-based tactical arena explorer that lets players visualize Dofus combat maps, simulate line-of-sight, and plan strategy before entering or during battle. It surfaces calibrated combat map data through a custom isometric SVG grid engine with full LOS (line-of-sight) ray casting — all built from scratch in TypeScript.

This is the **public-facing frontend**. It is paired with a private admin backend called *The 13th Control Center* which handles map calibration, data management, and deployment workflows.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 5.9, Vite 7 |
| Styling | Tailwind CSS 3, custom liquid-glass CSS |
| State | Zustand |
| Data fetching | Axios, TanStack Query |
| Grid engine | Custom SVG renderer (pure TypeScript) |
| LOS engine | Dual-ray marching algorithm (pure TypeScript) |
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
Backend Server  →  uvicorn + FastAPI  →  PostgreSQL 16
    ↑  Logical Replication (Tailscale mesh VPN)
Private Server  →  PostgreSQL 17 Publisher  →  13th Control Center
```

- **No open ports** on the server — Cloudflare Tunnel creates an outbound encrypted connection
- **Automatic HTTPS** on both frontend and API via GitHub Pages and Cloudflare respectively
- **Real-time DB replication** via PostgreSQL logical replication over a Tailscale WireGuard mesh

---

## Key Features

- **Isometric SVG Grid** — 560-cell staggered diamond grid rendered entirely in SVG with `gridToScreen()` projection math
- **Line of Sight Engine** — dual-ray marching algorithm with epsilon offsets, column-aligned path detection, and obstacle sets
- **Map Carousel** — 3-card sliding carousel with search, index navigation, and async map loading
- **Liquid Glass UI** — custom CSS component system with `backdrop-filter` blur and Honolulu Blue theme
- **Deployed-only filtering** — API layer enforces `calibration_status=deployed` so only production-ready maps are served to users
## Future implementations:
- **Left click on isometric grid** placing a 'chafer' to simulate and in game obstacle for LOS calculation.
- **Entity drag & drop** — drop monsters onto grid cells, LOS updates in real time 

---

## Project Structure

```
src/
├── api/
│   ├── client.ts          # Axios instance + VITE_API_URL config
│   ├── combatMaps.ts      # fetchCombatMaps() — hardcoded status=deployed
│   └── index.ts
├── engine/
│   ├── grid/
│   │   ├── GridMath.ts    # gridToScreen(), getDofusDistance(), getDiamondPoints()
│   │   └── LineOfSight.ts # hasLineOfSight(), getVisibleCells(), buildObstacleSet()
│   └── types/
│       └── Grid.ts        # CellType enum, CombatMapInfo, GridCell interfaces
└── features/
    └── arena/
        ├── ArenaPage.tsx           # Root layout
        ├── components/
        │   ├── IsometricGrid.tsx   # SVG grid + LOS overlay + entity sprites
        │   ├── MapSelection.tsx    # 3-card carousel
        │   ├── MapCard.tsx         # Preview card with image + roman numeral variant
        │   ├── MapSearchBar.tsx    # Liquid-glass search
        │   └── MapIndexNav.tsx     # Quick-jump pill nav
        ├── hooks/
        │   └── useMapLoader.ts     # Async map detail loading
        └── stores/
            └── arenaStore.ts       # Zustand store — maps, entities, LOS state
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

The frontend runs on standard `localhost:5173`. It expects a FastAPI backend at `VITE_API_URL`. Without the backend the grid renders but maps won't load.

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

The API backend is served from a home Backend Server through Cloudflare Tunnel — no cloud hosting costs.

---

## The Broader System

This repo is the public half of a two-frontend system:

| Project | Audience | Maps shown |
|---|---|---|
| **kingskolossium** (this repo) | Public users | `status=deployed` only |
| **The 13th Control Center** (private) | Admin only | All maps, calibration tools |

Both frontends share one FastAPI backend. The API layer enforces access control through the `calibration_status` filter — no authentication required since all publicly served data is intentionally public game data.

---

## Author

**Christopher Echevarria** — [github.com/ChristopherEchevarria](https://github.com/ChristopherEchevarria)



