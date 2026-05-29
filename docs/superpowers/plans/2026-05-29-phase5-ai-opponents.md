# Phase 5 — AI Opponents Implementation Plan

**Goal:** Enemy races run their own economies, build fleets, and make aggression decisions based on personality traits.

**Architecture:** `tickWorld` calls `tickAI(world)` after player tick. Each enemy race gets a simple utility AI: economy → construction → fleet → target selection.

---

## Task 1: AI Personality System

**Files:**
- Create: `src/sim/ai.ts`
- Create: `src/sim/ai.test.ts`

- [ ] Create `src/sim/ai.ts`:
  - `AIPersonality` interface per race (aggression, economy bias, breakNAP threshold)
  - `tickRaceAI(world, raceId)` — handles one race per tick:
    1. Mine ore from their asteroids
    2. Build ships if treasury allows
    3. Evaluate targets (reputation, fleet strength, distance)
    4. Declare war / sign NAP based on thresholds
  - Race traits from spec: Kryll +25% accusation, Motkaj breaks NAP under pressure, Brakkat double retaliation, etc.

## Task 2: Wire AI into Tick

**Files:**
- Modify: `src/sim/tick.ts` — call `tickAI(world)` after player tick
- Modify: `src/sim/types.ts` — add `aiState` to WorldState if needed

## Task 3: Sector Map Live Threats

**Files:**
- Modify: `src/screens/sector/SectorMap.tsx`
- Replace hardcoded threat markers with live `asteroid.threat` from AI decisions
- Show fleet movements and ramming trajectories
