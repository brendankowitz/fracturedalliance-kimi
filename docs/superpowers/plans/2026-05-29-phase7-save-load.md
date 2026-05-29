# Phase 7 — Save/Load + Serialization Implementation Plan

**Goal:** Full game state serialization, working save slots, schema migration.

---

## Task 1: WorldState Serializer

**Files:**
- Create: `src/sim/serialize.ts`
- Create: `src/sim/serialize.test.ts`

- [ ] `serializeWorld(world): string` — JSON + gzip via pako (or just JSON if pako not installed)
- [ ] `deserializeWorld(json): WorldState` — validate schema version, migrate if needed
- [ ] Handle all nested types: asteroids, fleets, market, relations, events

## Task 2: IndexedDB Save Slots

**Files:**
- Modify: `src/store/saveLoad.ts` — replace stub with real IndexedDB writes
- Use `idb` package (already implied by package.json) or native IndexedDB
- 4 save slots with name/day/verdict/stamp

## Task 3: Wire Main Menu

**Files:**
- Modify: `src/screens/menu/MainMenu.tsx` — load save slot list, continue button, delete save
- Modify: `src/store/gameStore.ts` — `loadSave(slot)` deserializes and restores full state
