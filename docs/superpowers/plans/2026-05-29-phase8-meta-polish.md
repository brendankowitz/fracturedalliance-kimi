# Phase 8 — Meta + Polish Implementation Plan

**Goal:** Achievements, audio hooks, difficulty selection, final QA.

---

## Task 1: Achievements

**Files:**
- Create: `src/sim/achievements.ts`
- Create: `src/sim/achievements.test.ts`

- [ ] 12 achievement definitions with predicates checked per tick
- [ ] IndexedDB persistence for unlocked achievements
- [ ] Post-match screen shows earned achievements

## Task 2: Difficulty + Scenario Select

**Files:**
- Modify: `src/screens/menu/MainMenu.tsx` — add difficulty selector (Intern to Board)
- Modify: `src/store/gameStore.ts` — apply difficulty config to world generation

## Task 3: Audio Infrastructure

**Files:**
- Create: `src/audio/audio.ts`
- Event-to-sound mappings: build_complete, treaty_signed, colony_attack, etc.
- 3 ambient music tracks (exploration, conflict, endgame)

## Task 4: Final QA

- Run full test suite
- Verify all screens accessible
- Check for TypeScript errors
- Confirm build reproducible
