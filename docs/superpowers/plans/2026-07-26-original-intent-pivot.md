# Original-Intent Pivot — Fractured Alliance back to Fragile Allegiance (2026-07-26)

Reviewer: Kimi (principal coding agent for this workspace). Method: read the full
`docs/gamespec.md`, the sim layer (`fractured-alliance/src/sim/*`), the data catalogue
(`src/data/gameData.ts`), all eight screens, the Claude-Design handoff bundle, the user's
reference screenshot of the 1996 original, and the sibling `opus` workspace's own
playability review (2026-07-25), which reached a matching conclusion for its tree.

---

## 0. North star

The original *Fragile Allegiance* (Gremlin, 1996) opens on an **isometric asteroid
surface**: lumpy cratered terrain, ~20 chunky buildings with distinct silhouettes, a
right-hand circular icon rail, and a top bar carrying the in-fiction date (`9-09-2496`)
and the asteroid's name (`AST:NEO-605`). You are looking at **a place**, through a
diegetic corporate console.

This repo's game shows an abstract square glyph grid inside a "Helion OS" dashboard.
The mechanics are right; the *place* is missing. **This pivot is a presentation rebuild
around a sim that is already FA-faithful — not a mechanics rewrite.**

Success test for every stage: put the screen next to the 1996 screenshot. A player who
loved the original should nod.

## 1. Keep / change inventory

### Keep (verified FA-faithful, tested)

| System | Where | Notes |
|---|---|---|
| 10 canonical ores (Selenium…Nexos) | `src/data/gameData.ts:72` | Exact original names/tiers |
| FA building catalogue | `src/data/gameData.ts:85` | Seismic Penetrator, Gravity Nullifier, Asteroid Engine, Missile Silo, etc. |
| 25 blueprints, flat money-gated shop | `src/data/gameData.ts:111` | Nuke/Stasis/Virus/Nexos warhead, Anti-Virus, Autonomy Manifesto |
| 7 races with FA archetypes | `src/data/gameData.ts:6` | Renamed per spec §C.9 (IP-safe) |
| Day-based tick (30 ticks/day) | `src/sim/tick.ts:9` | Colony economy, construction, radiation |
| Market, diplomacy, espionage, AI, fleets | `src/sim/market.ts`, `diplomacy.ts`, `espionage.ts`, `ai.ts`, `fleet.ts` | Each with vitest suites |
| Save/load (IndexedDB, slots) | `src/store/saveLoad.ts` | |
| Colony screen *panels* (palette, vitals, queue) | `src/screens/colony/ColonyView.tsx` | Content stays; framing changes |

### Change (the pivot itself)

| What | Where | Why |
|---|---|---|
| Abstract square glyph grid → **isometric asteroid surface** | `ColonyView.tsx` center | The place. Stage 1. |
| Dot-map sector screen → **belt map with sprite asteroids** | `SectorMap.tsx` | Rocks, not dots. Stage 2. |
| "Helion OS" dashboard chrome → **diegetic console** (date + asteroid name top bar, right icon rail) | `App.tsx`, `Taskbar.tsx`, `StatusBar.tsx` | Frame the fantasy. Stage 3. |
| Hidden sim events → **visible world feedback** | event feed, map overlays | Transporters, rams, salvos you can *see*. Stage 5. |

## 2. Staged roadmap

Each stage is independently shippable: existing tests stay green, `npm run build` passes,
and a screenshot is captured against the reference mood before merge.

### Stage 1 — Isometric asteroid surface *(implemented 2026-07-26)*
Canvas-rendered diamond-projection surface in the Colony screen: procedurally-seeded
lumpy rock (seed = asteroid id), crater shading, starfield backdrop, stylized iso
building sprites per category (dome, derrick, reactor, turret, engine cone…),
construction scaffolding + progress, damage state, hover/click cell interaction wired to
the existing `placeBuilding(cell, kind)` store action with the same `"x,y"` keys.
Pure projection math in `src/screens/colony/isoMath.ts` with unit tests. **No sim
changes.**

### Stage 2 — Belt-sector map
Starfield + procedurally-drawn asteroid sprites (size-class scaled, ownership-tinted,
threat badges), ship lanes for fleets/transporters, smooth zoom transition
sector → asteroid surface. Replaces the dot grid in `src/screens/sector/SectorMap.tsx`.

### Stage 3 — Diegetic console chrome
Top bar: visible 2496-calendar date (derived from tick), selected asteroid name,
credits, alert count. Right circular icon rail for the seven screens (Sector, Colony,
Sci-Tek, Commerce, Diplomacy, Tactical, Black Cell) — the original's signature
navigation. Bottom status/speed bar stays but gets FA-style speed presets. Retire the
"Helion OS" boot-menu aesthetic on the main menu in favour of a corporate-terminal
landing that still leads with New Match / Continue.

### Stage 4 — Feel & feedback
Day-boundary chime + date rollover, pause-on-event options (attack, famine, trader,
treaty), placement/demolition animations, ambient life (blinking lights, smoke,
twinkling stars), audio hook points (no assets yet — CC0 pack later).

### Stage 5 — Mechanics visibility gaps
Most of this exists in sim data but is invisible: monthly **Federal Ore Transporter**
arrival/docking on the map, **merchant** ships you can watch dock, **inbound asteroid
ram** warning with ETA countdown, **missile salvos** as map projectiles, **spy
satellite** presence indicators. Render what the sim already knows.

## 3. Art approach

**Procedural only** — canvas/SVG generated at runtime, extending the existing
generated-glyph language in `src/assets/` (`BuildingTile.tsx`, `ShipGlyph.tsx`,
`BlueprintSchematic.tsx`). No external assets, nothing from the original game (IP-safe
per spec §F.1). Palette sampled from the reference mood: tan/grey cratered rock, cool
charcoal console, amber signal accents. If commissioned art ever lands, it drops into
the same sprite slots.

## 4. Verification protocol (every stage)

1. `npm test -- --run` — all suites green (54 tests at pivot start).
2. `npm run build` — clean.
3. Screenshot of every touched screen, compared against the 1996 reference mood.
4. Deployed to GitHub Pages (auto on push to `main`) and spot-checked live.
5. Handoff note appended to this file: what was built, how to test, known limitations,
   integration points (per `agents.md` handoff rules).

## 5. Publish pipeline (landed 2026-07-26)

- Repo: `github.com/brendankowitz/fracturedalliance-kimi`, branch `main`.
- `.github/workflows/deploy.yml`: npm ci → tests (gate) → lint (non-blocking; 28
  pre-existing errors, mostly `no-explicit-any` — cleanup deferred) → build with
  `GHPAGES=true` (vite `base=/fracturedalliance-kimi/`) → `actions/deploy-pages`.
- Live at `https://brendankowitz.github.io/fracturedalliance-kimi/`.

## 6. History-note: secret purge (2026-07-26)

Before first push, git history was rewritten (26 commits, `filter-branch`) to remove
`claude-kimi.ps1` (contained a Kimi API key) and redact an API key embedded in
`docs/superpowers/plans/2026-04-20-audio-art.md`. Both keys must be considered
compromised and rotated. Full verification: no `sk-*` patterns remain in any revision.

## 7. Stage handoffs (executed 2026-07-26)

All five stages landed on `main` and are live on Pages. Test count 54 → 114 over the day;
lint held at exactly the 28 pre-existing errors throughout (cleanup still owed).

- **Stage 1 — iso colony surface** (`8ce4590` ancestry): `isoMath.ts`, `IsoSurface.tsx`,
  ColonyView center swap. Bonus fix: building placement was previously unreachable from
  the UI (hover-only cells, no click handler) — now click-to-place.
- **Stage 2 — belt map** (`4cf8606`): `render/rock.ts` shared rock/starfield (colony rock
  pixel-identical), `beltMath.ts`, `BeltCanvas.tsx`; double-click helion rock → colony.
- **Stage 3 — console chrome** (`f8d0c4a`): `simDate.ts` (day 0 = 25-05-2496), Taskbar
  date + `AST:` readout + real treasury, `IconRail` (F2–F8, real shortcuts), StatusBar
  real readouts, conservative menu copy pass.
- **Stage 4 — feel & feedback** (`154179d`): `audio/sfx.ts` procedural WebAudio
  (autoplay-safe), `useSfx` day-chime + date flash + crit stinger, `pauseOnCrit` +
  `sound` settings in TweaksPanel, IsoSurface ambient layer (twinkle/blink/smoke).
- **Stage 5 — mechanics visibility** (`8ce4590`): `beltBadges.ts` pure derivation;
  fleet silhouette arcs + hull chips + attack/patrol states, merchant docked marker,
  engines-armed badges on the belt; orbital darts in the colony sky. **Renders only real
  sim state** — no ship positions, real ram ETAs, or spy satellites exist in the sim, so
  none were drawn. Adding those is sim work (see below).

### Known limitations / next work

- One unreproduced test flake observed during Stage 2 verification (1 failure in 8 local
  runs, green in CI) — watch `beltMath` viewport-sensitive tests.
- `speed` setting is display-only (fixed 6s tick loop in `startTickLoop`) — pre-existing;
  making speed presets actually scale the loop is store work, not presentation.
- Sim gaps that Stage 5 deliberately did not fake: ship world-positions/transit, real
  asteroid-ram flight + ETA, spy-satellite entities, Federal Ore Transporter schedule.
  These are the next sim-side milestones; the rendering hooks now exist to surface them.
- Rock silhouette under-fills on XL/11×11 grids (no XL asteroid in current data).
- DEEP/ORBITAL view buttons in Colony remain inert.
