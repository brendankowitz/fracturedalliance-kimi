# Phase 4 — Diplomacy + Treaties Implementation Plan

**Goal:** Dynamic reputation system, treaty negotiation, council events. Diplomacy screen shows live race relations and actionable treaties.

**Architecture:** Reputation changes flow through `tickWorld` events. Treaties are stored per race in `WorldState`. Diplomacy screen reads live data and provides negotiate/break/actions.

---

## Task 1: Treaty System

**Files:**
- Create: `src/sim/diplomacy.ts`
- Create: `src/sim/diplomacy.test.ts`

- [ ] Create `src/sim/diplomacy.ts` with:
  - `RaceRelations` interface: reputation (-100 to 100), treaties[], standing
  - `proposeTreaty(world, raceId, treatyKind)` — validates reputation threshold
  - `breakTreaty(world, raceId, treatyKind)` — casus belli event
  - `updateReputation(world, raceId, delta)` — clamped -100 to 100
  - Reputation thresholds: NAP requires ≥0, Trade ≥20, Defensive ≥40

- [ ] Create tests for propose/break/reputation logic.

## Task 2: Wire Diplomacy into Tick + Store

**Files:**
- Modify: `src/sim/types.ts` — add `relations: Record<string, RaceRelations>` to WorldState
- Modify: `src/sim/tick.ts` — generate reputation events (trade bonuses, combat penalties)
- Modify: `src/store/gameStore.ts` — add `proposeTreaty`, `breakTreaty`, `updateReputation` actions
- Modify: `src/store/gameStore.test.ts` — add diplomacy tests

## Task 3: Wire Diplomacy Screen

**Files:**
- Modify: `src/screens/diplomacy/Diplomacy.tsx`
- Replace hardcoded reputation bars with live `relations` data
- Add negotiate/break treaty buttons with validation
- Wire council event log to `events` filtered for diplomacy

---

Commit each task separately.