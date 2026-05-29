# Phase 6 — Espionage + Advanced Mechanics Implementation Plan

**Goal:** Agent missions with success/fail rolls, spy satellites, counter-intel.

---

## Task 1: Agent Mission System

**Files:**
- Create: `src/sim/espionage.ts`
- Create: `src/sim/espionage.test.ts`

- [ ] `resolveMission(agent, missionType, target)` — rolls against agent stats vs target security
- [ ] Mission types: `stealTech`, `sabotage`, `infiltrate`, `blackmail`, `liberate`
- [ ] Outcomes: success (gain intel/tech/credits), fail (agent captured), critical fail (war trigger)
- [ ] Spy Satellite building reveals enemy grids for 30 days

## Task 2: Wire Espionage into Store + Screen

**Files:**
- Modify: `src/store/gameStore.ts` — add `assignMission`, `recallAgent` actions
- Modify: `src/screens/espionage/Espionage.tsx` — live agent roster, mission assignment UI, intel panel

## Task 3: Advanced Mechanics

**Files:**
- Modify: `src/sim/tick.ts` — happiness consequences (strikes, secession), asteroid stability decay
- Modify: `src/store/gameStore.ts` — difficulty presets (Intern/Manager/Director/CEO/Board)
