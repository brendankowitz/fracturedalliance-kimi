---
title: Fractured Alliance — Implementation Design
date: 2026-04-18
status: approved
---

# Fractured Alliance — Implementation Design

Full game spec lives at `docs/gamespec.md`. This document captures the confirmed implementation decisions made during the brainstorming session and serves as the entry point for the implementation plan.

## Confirmed Decisions

### Scope
- Full end-to-end implementation across 4 phases (Phase 0 → Phase 3)
- Linear phase-by-phase plan; phases 0 and 1 task-granular, phases 2–3 feature-granular
- Pure client-side PWA — no server

### Stack
| Concern | Choice |
|---|---|
| Package manager / monorepo | pnpm workspaces |
| Bundler | Vite 6 |
| Language | TypeScript 5.7 (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) |
| UI framework | React 19 |
| Game renderer | PixiJS v8 (from day one — no Phaser fallback) |
| UI state | Zustand 5 |
| Flow state | XState v5 |
| Lint / format | Biome 2 |
| Testing | Vitest + Playwright + fast-check |
| PWA | vite-plugin-pwa (Workbox) |
| Worker bridge | Comlink |

### Architecture
- Sim runs in a **Web Worker** at 20 Hz fixed timestep; deterministic; seeded `mulberry32` PRNG
- **Comlink RPC** bridges worker ↔ main thread
- **Zustand 5** holds read-only HUD snapshots published from the worker
- **SharedArrayBuffer** for hot ship-position paths (requires `COOP: same-origin` + `COEP: require-corp`)
- **PixiJS RAF loop** reads worker state; React DOM sits above canvas for all HUD/menus
- **XState v5** machine: `mainMenu → loading → playing → paused → combat → gameOver → victory`
- Domain model is pure TypeScript (`Map<BrandedId, T>`) — knows nothing about Pixi or React

### Monorepo Layout
```
belt-baron/
├── apps/
│   └── web/          # Vite + React + PixiJS
├── packages/
│   ├── domain/       # Pure TS types, branded IDs, entity interfaces
│   ├── sim/          # World, systems, fixed-timestep loop (runs in worker)
│   ├── ai/           # Utility AI + mistreevous behavior trees
│   ├── content/      # JSON data: buildings, races, blueprints, scenarios
│   ├── persistence/  # Save serialisation, idb adapter, migrations
│   └── shared-ui/    # React primitives, design tokens
├── tools/
│   ├── balance-sim/  # Headless match runner
│   └── asset-pipeline/
├── tests/
│   ├── replay-fixtures/
│   └── e2e/
└── docs/
```

### Phase Roadmap
| Phase | Scope | Success Criteria | Est. Weeks |
|---|---|---|---|
| **0 — Prototype** | Single asteroid · 3 buildings (Air, Mine, Storage) · 1 ore · fixed-timestep worker loop · Pixi grid · Zustand · save/load IndexedDB | Click to place a mine; watch ore accumulate; close tab, reopen, resume | 2–3 |
| **1 — MVP** | Multi-asteroid sector (6–10) · all life-support/power/mining buildings · 4 ore types · scout/trade ships · 1 AI opponent · simple combat · Federal Transporter · tutorial pass · basic diplomacy screen | Survive 30 sim-days or destroy AI's last asteroid | 6–8 |
| **2 — Content Complete** | All 40 blueprints · all 7 races + personalities · full diplomacy (7 treaty types + AI memory) · espionage · Asteroid Engine + ramming + Gravity Nullifier · Black Market + Independence arc · 5 victory conditions | All 5 victories demonstrably achievable end-to-end | 10–14 |
| **3 — Polish** | Commissioned art + audio · WCAG 2.2 AA · difficulty tuning · scenarios · PWA · Tauri 2.0 desktop | Lighthouse ≥90 PWA · WCAG AA · 100 beta testers satisfied | 8–12 |

## Key Invariants to Preserve
1. The sim package must never import from React, Pixi, or any browser-rendering API.
2. All stochastic decisions flow through named sub-generators reseeded from the master seed.
3. Saving then loading must be idempotent (property-based tested).
4. AI compute is hard-capped at 10 ms per player per tick.
5. Every icon, status indicator, and alert uses icon + colour + text (never colour alone).

---

## UI / UX Design System (Source of Truth)
> **Claude Design handoff bundle** — `prototype/Fractured Alliance.html` and supporting files are the canonical reference for all screen layouts, colours, typography, and assets. The summary below is for quick orientation; when in doubt, read the prototype.

**Aesthetic direction:** "Helion Corp Operations Console" — a diegetic corporate-terminal frame. Dense panels, monospace numerics, bracket frames, signal-colour accents. Modern execution without skeuomorphic chrome; the *density* and *information-first* attitude is the homage to 1996.

**Palette (oklch, cool/industrial):**
| Token | Value | Usage |
|---|---|---|
| `--bg-void` | `oklch(0.14 0.012 240)` | deep space background |
| `--bg-base` | `oklch(0.18 0.013 240)` | main panel surface |
| `--fg-100` | `oklch(0.96 0.008 80)` | warm off-white text |
| `--signal` | `oklch(0.78 0.14 200)` | cyan — primary interactive |
| `--warn` | `oklch(0.80 0.15 70)` | amber — Helion brand, alerts, hot data |
| `--crit` | `oklch(0.72 0.18 18)` | hot red — attacks, failures |
| `--illegal` | `oklch(0.70 0.18 330)` | magenta — black market, espionage |
| `--ally` | `oklch(0.74 0.13 150)` | green — positive diplomacy |

**Typography:** Space Grotesk (display, 300–700) + JetBrains Mono (data, 400–600). All numerics are tabular-nums. Eyebrows and labels are uppercase with wide letter-spacing.

**Wordmark:** `FRACTURED // ALLIANCE` — the `//` is literal, acting as a comment-marker and fracture line.

**Screens (8 navigable prototypes):**
1. **Main Menu** — boot console, scenario picker, save slots
2. **Sector Map** — asteroid belt overview with size-coded markers, trade-route lines, ramming-trajectory threats
3. **Colony View** — 9×9 build grid, 23-building palette, live queue, event feed
4. **Sci-Tek** — blueprint vault with discipline filter, card grid, detail panel with schematic
5. **Diplomacy** — race roster, ambassador video-link placeholders, reputation bars, treaty rows, council log
6. **Commerce** — three channels (Federal / Merchant / Black Market), suspicion meter, price sparklines
7. **Tactical** — fleet roster, radar engagement view with tracer fire, orders panel, bombardment stock
8. **Black Cell (Espionage)** — magenta-tinted off-books panel with agent dossiers, mission planner, counter-intel log

**Asset Library (all in `prototype/`):**
- **Sheet 01** — Colony Structures (schematic glyphs, 24×24 viewBox, 23 icons)
- **Sheet 01b** — Colony Structures (isometric animated tiles, 48×48 viewBox, CSS ambient motion)
- **Sheet 02** — Tactical Hull Classes (7 ships, 32×32 viewBox, engine plume + cockpit glow animations)
- **Sheet 03** — Ordnance (9 missiles/bombs, 24×24 viewBox, warhead burst + trail animations)
- **Sheet 04** — Sci-Tek Blueprint Schematics (hero panel technical drawings, 280×200)
- **Sheet 05** — Tokens (full colour + type ramp)

**Animation vocabulary (CSS-only, GPU-accelerated):**
- `fa-spin` / `fa-spin-slow` — continuous rotation (fans, radar dishes)
- `fa-pulse` — opacity throb (active machinery)
- `fa-flicker` — independent window flickering (3 staggered phases)
- `fa-rise` — exhaust plumes & steam rising (3 staggered phases)
- `fa-conveyor` — stroke-dashoffset scroll (ore conveyors)
- `fa-wave` — concentric anti-grav rings expanding (3 staggered phases)
- `fa-shake` — micro-vibration (Seismic rig)
- `fa-thrust` — thruster pulse out-of-phase (Asteroid Engine)
- `fa-charge` — scale + opacity (laser turret charging)
- `fa-blink` — stepped blink (warning lights)
- `fa-spin-fast` — 1.2s rotation (Vortex)
- `fa-glow-soft` — cockpit/bridge soft pulse
- `fa-trail` — dashed exhaust trail scroll
- `fa-burst` — warhead concentric pulse

Every animation uses stagger offsets so a screen full of tiles never feels synchronized — it reads as *ambient life*.

**Top chrome (Taskbar):** Brand mark + wordmark (clickable to main menu), nav pills with F-key hints, treasury/standing/alerts chips, sim-time ticker.
**Bottom chrome (Status Bar):** Ready state, contextual message, pause/resume + speed controls (0.5×–8×), seed, match timer, sync status.
