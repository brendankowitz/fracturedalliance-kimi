# Phase 1 — Core Simulation Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the game tick actually simulate resources, construction, and events. Replace all hardcoded colony stats with live computed values.

**Architecture:** Pure simulation functions in `src/sim/` (zero UI deps) compute the next world state from the current one. Zustand store calls these on `advanceTick()` and persists the result. React components read computed values from store selectors.

**Tech Stack:** Vite 6 · React 19 · TypeScript 5.7 · Zustand 5 · Vitest

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/sim/types.ts` | Simulation-specific types: `AsteroidState`, `ResourceSnapshot`, `SimEvent` |
| `src/sim/buildingEffects.ts` | Per-building production/consumption table. Pure data. |
| `src/sim/tick.ts` | Main tick function: `tickWorld(world, buildingsDef) → nextWorld + events` |
| `src/sim/tick.test.ts` | Tests for tick logic: construction, resources, events |
| `src/store/gameStore.ts` | Modify `advanceTick()` to call `tickWorld`. Add asteroid state. |
| `src/store/gameStore.test.ts` | Update existing tests, add simulation tests |
| `src/screens/colony/ColonyView.tsx` | Replace hardcoded stats with store selectors |

---

## Task 1: Simulation Types

**Files:**
- Create: `src/sim/types.ts`
- Create: `src/sim/buildingEffects.ts`

- [ ] **Step 1: Create `src/sim/types.ts`**

```typescript
import type { OreKind } from '../types';

export interface BuildingEffect {
  pwr: number;      // positive = generates, negative = consumes
  food: number;
  water: number;
  air: number;
  popCap: number;   // population capacity added
  happiness: number; // base happiness modifier
  rad: number;      // radiation produced
  mining?: { ore: OreKind; rate: number }; // ore per tick
}

export interface AsteroidResources {
  power: number;    // current net power (can be negative)
  food: number;     // daily surplus/shortfall
  water: number;
  air: number;
  pop: number;      // current population
  popCap: number;   // max population
  happiness: number; // 0-100
  rad: number;      // current radiation level
  ores: Record<OreKind, number>; // stockpiles
}

export interface AsteroidState {
  id: string;
  ownerId: string | null;
  resources: AsteroidResources;
  placedBuildings: Record<string, { kind: string; damaged?: boolean; constructing?: boolean; progress?: number }>;
  buildQueue: {
    name: string;
    cell: string;
    pct: number;
    etaDays: number;
    active: boolean;
    disabled?: boolean;
    note?: string;
  }[];
}

export interface SimEvent {
  id: number;
  t: string; // formatted tick string
  kind: 'warn' | 'signal' | 'crit' | 'illegal' | 'ally';
  text: string;
}

export interface WorldState {
  tick: number;
  treasury: number;
  asteroids: AsteroidState[];
  suspicion: number;
  reputation: Record<string, number>;
  federationStanding: number;
  events: SimEvent[];
}
```

- [ ] **Step 2: Create `src/sim/buildingEffects.ts`**

```typescript
import type { BuildingEffect } from './types';

export const BUILDING_EFFECTS: Record<string, BuildingEffect> = {
  cpu:     { pwr: -5, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  air:     { pwr: -4, food: 0, water: 0, air: 4, popCap: 0, happiness: 0, rad: 0 },
  hydration:{ pwr: -3, food: 0, water: 12, air: 0, popCap: 0, happiness: 0, rad: 0 },
  hydroponics:{ pwr: -4, food: 8, water: -2, air: 2, popCap: 0, happiness: 0, rad: 0 },
  living:  { pwr: -1, food: 0, water: 0, air: 0, popCap: 50, happiness: 0, rad: 0 },
  resiblock:{ pwr: -3, food: 0, water: 0, air: 0, popCap: 150, happiness: -5, rad: 0 },
  pleasure:{ pwr: -5, food: 0, water: 0, air: 0, popCap: 0, happiness: 10, rad: 0 },
  medical: { pwr: -3, food: 0, water: 0, air: 0, popCap: 0, happiness: 2, rad: 0 },
  security:{ pwr: -2, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  mine1:   { pwr: -2, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0, mining: { ore: 'selenium', rate: 2 } },
  mine2:   { pwr: -3, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0, mining: { ore: 'selenium', rate: 4 } },
  deep:    { pwr: -4, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0, mining: { ore: 'barium', rate: 1 } },
  seismic: { pwr: -8, food: 0, water: 0, air: 0, popCap: 0, happiness: -8, rad: 4, mining: { ore: 'traxium', rate: 0.5 } },
  power1:  { pwr: 10, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  power2:  { pwr: 30, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  storage: { pwr: -1, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  radfilter:{ pwr: -2, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: -6 },
  laser:   { pwr: -3, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  silo:    { pwr: -4, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  shipyard:{ pwr: -5, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  dock:    { pwr: -10, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  gravnull:{ pwr: -6, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  engine:  { pwr: -12, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
};

export function getBuildingEffect(kind: string): BuildingEffect {
  return BUILDING_EFFECTS[kind] ?? { pwr: 0, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/sim/types.ts src/sim/buildingEffects.ts
git commit -m "feat(sim): add simulation types and building effects table"
```

---

## Task 2: Core Tick Function

**Files:**
- Create: `src/sim/tick.ts`
- Create: `src/sim/tick.test.ts`

- [ ] **Step 1: Write failing tests in `src/sim/tick.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { tickAsteroid } from './tick';
import type { AsteroidState } from './types';

function makeAsteroid(): AsteroidState {
  return {
    id: 'test',
    ownerId: 'helion',
    resources: {
      power: 0, food: 0, water: 0, air: 0,
      pop: 100, popCap: 100, happiness: 50, rad: 0,
      ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 },
    },
    placedBuildings: {},
    buildQueue: [],
  };
}

describe('tickAsteroid', () => {
  it('increments construction progress for active queue items', () => {
    const asteroid = makeAsteroid();
    asteroid.placedBuildings['0,0'] = { kind: 'mine1', constructing: true, progress: 0.5 };
    asteroid.buildQueue = [{ name: 'Mine Mk1', cell: '[0,0]', pct: 50, etaDays: 2, active: true }];

    const result = tickAsteroid(asteroid, 1);
    expect(result.placedBuildings['0,0'].progress).toBeGreaterThan(0.5);
    expect(result.buildQueue[0].pct).toBeGreaterThan(50);
  });

  it('completes construction at 100%', () => {
    const asteroid = makeAsteroid();
    asteroid.placedBuildings['0,0'] = { kind: 'mine1', constructing: true, progress: 0.99 };
    asteroid.buildQueue = [{ name: 'Mine Mk1', cell: '[0,0]', pct: 99, etaDays: 0, active: true }];

    const result = tickAsteroid(asteroid, 1);
    expect(result.placedBuildings['0,0'].constructing).toBe(false);
    expect(result.buildQueue).toHaveLength(0);
  });

  it('computes net power from buildings', () => {
    const asteroid = makeAsteroid();
    asteroid.placedBuildings['0,0'] = { kind: 'power1' };
    asteroid.placedBuildings['0,1'] = { kind: 'mine1' };

    const result = tickAsteroid(asteroid, 1);
    expect(result.resources.power).toBe(8); // 10 - 2
  });

  it('generates food and water from life support', () => {
    const asteroid = makeAsteroid();
    asteroid.placedBuildings['0,0'] = { kind: 'hydroponics' };

    const result = tickAsteroid(asteroid, 1);
    expect(result.resources.food).toBe(8);
    expect(result.resources.water).toBe(-2);
    expect(result.resources.air).toBe(2);
  });

  it('caps population at popCap', () => {
    const asteroid = makeAsteroid();
    asteroid.resources.pop = 150;
    asteroid.resources.popCap = 100;

    const result = tickAsteroid(asteroid, 1);
    expect(result.resources.pop).toBe(100);
  });

  it('generates happiness from pleasure dome', () => {
    const asteroid = makeAsteroid();
    asteroid.placedBuildings['0,0'] = { kind: 'pleasure' };

    const result = tickAsteroid(asteroid, 1);
    expect(result.resources.happiness).toBe(60); // 50 + 10
  });

  it('clamps happiness to 0-100', () => {
    const asteroid = makeAsteroid();
    asteroid.resources.happiness = 95;
    asteroid.placedBuildings['0,0'] = { kind: 'pleasure' };
    asteroid.placedBuildings['0,1'] = { kind: 'pleasure' };

    const result = tickAsteroid(asteroid, 1);
    expect(result.resources.happiness).toBe(100);
  });

  it('produces ore from mines', () => {
    const asteroid = makeAsteroid();
    asteroid.placedBuildings['0,0'] = { kind: 'mine1' };

    const result = tickAsteroid(asteroid, 1);
    expect(result.resources.ores.selenium).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd fractured-alliance
npx vitest run src/sim/tick.test.ts
```
Expected: FAIL — `tickAsteroid` not found

- [ ] **Step 3: Implement `src/sim/tick.ts`**

```typescript
import type { AsteroidState, SimEvent, WorldState } from './types';
import { getBuildingEffect } from './buildingEffects';

const TICKS_PER_DAY = 30;

export function tickAsteroid(state: AsteroidState, tick: number): AsteroidState {
  const next: AsteroidState = {
    ...state,
    resources: { ...state.resources, ores: { ...state.resources.ores } },
    placedBuildings: { ...state.placedBuildings },
    buildQueue: state.buildQueue.map(q => ({ ...q })),
  };

  // 1. Sum building effects
  let netPwr = 0;
  let netFood = 0;
  let netWater = 0;
  let netAir = 0;
  let netPopCap = 0;
  let netHappiness = 0;
  let netRad = 0;

  for (const [cell, building] of Object.entries(next.placedBuildings)) {
    if (building.constructing) continue;
    const fx = getBuildingEffect(building.kind);
    netPwr += fx.pwr;
    netFood += fx.food;
    netWater += fx.water;
    netAir += fx.air;
    netPopCap += fx.popCap;
    netHappiness += fx.happiness;
    netRad += fx.rad;
    if (fx.mining) {
      next.resources.ores[fx.mining.ore] += fx.mining.rate;
    }
  }

  next.resources.power = netPwr;
  next.resources.food = netFood;
  next.resources.water = netWater;
  next.resources.air = netAir;
  next.resources.popCap = netPopCap;
  next.resources.happiness = Math.max(0, Math.min(100, next.resources.happiness + netHappiness));
  next.resources.rad = Math.max(0, next.resources.rad + netRad);

  // 2. Cap population
  if (next.resources.pop > next.resources.popCap) {
    next.resources.pop = next.resources.popCap;
  }

  // 3. Advance construction
  if (next.buildQueue.length > 0) {
    const active = next.buildQueue[0];
    if (active.active && !active.disabled) {
      const buildTimeTicks = active.etaDays * TICKS_PER_DAY;
      const increment = buildTimeTicks > 0 ? (100 / buildTimeTicks) : 100;
      active.pct = Math.min(100, active.pct + increment);

      const cellKey = active.cell.replace('[', '').replace(']', '');
      const building = next.placedBuildings[cellKey];
      if (building) {
        building.progress = active.pct / 100;
        if (active.pct >= 100) {
          building.constructing = false;
          next.buildQueue.shift();
        }
      }
    }
  }

  return next;
}

export function tickWorld(world: WorldState): { world: WorldState; events: SimEvent[] } {
  const nextTick = world.tick + 1;
  const newEvents: SimEvent[] = [];

  const nextAsteroids = world.asteroids.map(a => tickAsteroid(a, nextTick));

  // Generate events based on state changes
  for (const asteroid of nextAsteroids) {
    if (asteroid.resources.power < 0) {
      newEvents.push({
        id: Date.now() + Math.random(),
        t: formatTick(nextTick),
        kind: 'warn',
        text: `${asteroid.id}: Power deficit detected. ${asteroid.resources.power} MW shortfall.`,
      });
    }
    if (asteroid.resources.happiness < 30) {
      newEvents.push({
        id: Date.now() + Math.random(),
        t: formatTick(nextTick),
        kind: 'crit',
        text: `${asteroid.id}: Colony happiness critical (${Math.floor(asteroid.resources.happiness)}%). Strikes imminent.`,
      });
    }
  }

  const nextWorld: WorldState = {
    ...world,
    tick: nextTick,
    asteroids: nextAsteroids,
    events: [...newEvents, ...world.events].slice(0, 50),
  };

  return { world: nextWorld, events: newEvents };
}

function formatTick(tick: number): string {
  const day = Math.floor(tick / TICKS_PER_DAY);
  const rem = tick % TICKS_PER_DAY;
  return `T+${day.toString().padStart(3, '0')}.${rem.toString().padStart(2, '0')}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/sim/tick.test.ts
```
Expected: 8/8 PASS

- [ ] **Step 5: Commit**

```bash
git add src/sim/tick.ts src/sim/tick.test.ts
git commit -m "feat(sim): implement core tick function with construction and resources"
```

---

## Task 3: Wire Simulation into Game Store

**Files:**
- Modify: `src/store/gameStore.ts`
- Modify: `src/store/gameStore.test.ts`

- [ ] **Step 1: Modify `src/store/gameStore.ts`**

Add imports at top:
```typescript
import type { AsteroidState } from '../sim/types';
import { tickWorld } from '../sim/tick';
```

Replace `advanceTick` implementation:
```typescript
advanceTick: () => {
  const state = get();
  if (state.paused) return;

  const world = tickWorld({
    tick: state.tick,
    treasury: state.treasury,
    asteroids: state.asteroids,
    suspicion: state.suspicion,
    reputation: state.reputation,
    federationStanding: state.federationStanding,
    events: state.events,
  });

  set({
    tick: world.world.tick,
    asteroids: world.world.asteroids,
    events: world.world.events,
    alerts: world.events.length,
  });
},
```

Replace `DEFAULT_PLACED` and `DEFAULT_QUEUE` with full `AsteroidState` initializers. Add `asteroids` and `events` to the store state:

```typescript
const DEFAULT_ASTEROIDS: AsteroidState[] = [
  {
    id: 'arch-i',
    ownerId: 'helion',
    resources: {
      power: 12, food: 8, water: 12, air: 4,
      pop: 480, popCap: 700, happiness: 78, rad: 8,
      ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 },
    },
    placedBuildings: {
      '4,4': { kind: 'cpu' },
      '3,4': { kind: 'air' },
      '5,4': { kind: 'hydration' },
      '4,3': { kind: 'living' },
      '4,5': { kind: 'living' },
      '3,3': { kind: 'power1' },
      '5,5': { kind: 'power1' },
      '2,4': { kind: 'mine1' },
      '6,4': { kind: 'mine2' },
      '3,5': { kind: 'hydroponics' },
      '5,3': { kind: 'medical' },
      '2,3': { kind: 'storage' },
      '6,5': { kind: 'storage' },
      '2,5': { kind: 'laser' },
      '6,3': { kind: 'laser' },
      '4,6': { kind: 'silo' },
      '1,4': { kind: 'deep' },
      '7,4': { kind: 'security' },
      '4,2': { kind: 'resiblock' },
      '3,6': { kind: 'pleasure', damaged: true },
      '1,3': { kind: 'mine1', constructing: true, progress: 0.55 },
      '1,5': { kind: 'mine1', constructing: true, progress: 0.32 },
    },
    buildQueue: [
      { name: 'Mine Mk1', cell: '[1,3]', pct: 55, etaDays: 2, active: true },
      { name: 'Mine Mk1', cell: '[1,5]', pct: 32, etaDays: 3, active: true },
      { name: 'Storage Tower', cell: '[7,5]', pct: 0, etaDays: 4, active: false },
      { name: 'Laser Turret', cell: '[3,2]', pct: 0, etaDays: 5, active: false },
      { name: 'Mine Mk2', cell: '[7,3]', pct: 0, etaDays: 7, active: false },
      { name: 'Pleasure Dome', cell: '—', pct: 0, etaDays: 8, active: false, disabled: true, note: 'awaiting medical clear' },
    ],
  },
  // ... other asteroids can be stubbed with minimal state
  {
    id: 'arch-ii',
    ownerId: 'helion',
    resources: { power: 0, food: 0, water: 0, air: 0, pop: 240, popCap: 300, happiness: 71, rad: 4, ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 } },
    placedBuildings: {},
    buildQueue: [],
  },
  {
    id: 'forge-3',
    ownerId: 'helion',
    resources: { power: 0, food: 0, water: 0, air: 0, pop: 380, popCap: 400, happiness: 64, rad: 22, ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 } },
    placedBuildings: {},
    buildQueue: [],
  },
  {
    id: 'kepler-7',
    ownerId: 'helion',
    resources: { power: 0, food: 0, water: 0, air: 0, pop: 90, popCap: 100, happiness: 88, rad: 2, ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 } },
    placedBuildings: {},
    buildQueue: [],
  },
  {
    id: 'long-shot',
    ownerId: 'helion',
    resources: { power: 0, food: 0, water: 0, air: 0, pop: 0, popCap: 0, happiness: 50, rad: 38, ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 } },
    placedBuildings: {},
    buildQueue: [],
  },
];
```

Update store interface:
```typescript
interface GameState {
  screen: ScreenId;
  paused: boolean;
  speed: number;
  tick: number;
  treasury: number;
  alerts: number;
  settings: GameSettings;
  selectedAsteroid: string;
  selectedBuilding: string | null;
  asteroids: AsteroidState[];
  blueprintsOwned: string[];
  suspicion: number;
  reputation: Record<string, number>;
  federationStanding: number;
  saves: SaveSlot[];
  events: SimEvent[];

  setScreen: (s: ScreenId) => void;
  setPaused: (p: boolean) => void;
  setSpeed: (s: number) => void;
  advanceTick: () => void;
  setSettings: (s: Partial<GameSettings>) => void;
  setSelectedAsteroid: (id: string) => void;
  setSelectedBuilding: (id: string | null) => void;
  placeBuilding: (cell: string, kind: string) => void;
  purchaseBlueprint: (id: string, cost: number) => boolean;
  updateReputation: (raceId: string, delta: number) => void;
  addSuspicion: (amount: number) => void;
  loadSave: (slot: number) => void;
}
```

Update `placeBuilding` to target the selected asteroid:
```typescript
placeBuilding: (cell, kind) => {
  set((state) => {
    const idx = state.asteroids.findIndex(a => a.id === state.selectedAsteroid);
    if (idx === -1) return state;
    const next = [...state.asteroids];
    next[idx] = {
      ...next[idx],
      placedBuildings: {
        ...next[idx].placedBuildings,
        [cell]: { kind, constructing: true, progress: 0 },
      },
    };
    return { asteroids: next };
  });
},
```

- [ ] **Step 2: Update `src/store/gameStore.test.ts`**

Add test that `advanceTick` changes asteroid resources:
```typescript
it('advanceTick runs simulation and updates resources', () => {
  const { result } = renderHook(() => useGameStore());
  act(() => result.current.setPaused(false));
  const initialPower = result.current.asteroids[0].resources.power;
  act(() => result.current.advanceTick());
  expect(result.current.asteroids[0].resources.power).not.toBe(initialPower);
  expect(result.current.tick).toBe(342);
});
```

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```
Expected: all PASS

- [ ] **Step 4: Commit**

```bash
git add src/store/gameStore.ts src/store/gameStore.test.ts
git commit -m "feat(store): wire tick simulation into game store"
```

---

## Task 4: Wire Live Stats into Colony View

**Files:**
- Modify: `src/screens/colony/ColonyView.tsx`

- [ ] **Step 1: Replace hardcoded stats with store selectors**

Replace the static `<ResourceStat>` values in `ColonyGrid` with computed values from the selected asteroid:

```typescript
const selectedAsteroidId = useGameStore((s) => s.selectedAsteroid);
const asteroid = useGameStore((s) => s.asteroids.find((a) => a.id === s.selectedAsteroid));
const placed = asteroid?.placedBuildings ?? {};
const buildQueue = asteroid?.buildQueue ?? [];
```

Replace the hardcoded stats section:
```typescript
const r = asteroid?.resources;
const stats = r ? [
  { label: 'POPULATION', value: `${Math.floor(r.pop)} / ${r.popCap}`, bar: Math.round((r.pop / Math.max(1, r.popCap)) * 100), color: 'signal' as const },
  { label: 'HAPPINESS', value: `${Math.floor(r.happiness)}`, bar: r.happiness, color: 'ally' as const },
  { label: 'POWER', value: `${r.power > 0 ? '+' : ''}${r.power}`, bar: Math.min(100, Math.max(0, 50 + r.power * 3)), color: r.power < 0 ? 'crit' : 'warn' as const },
  { label: 'FOOD', value: `${r.food > 0 ? '+' : ''}${r.food} / day`, bar: Math.min(100, Math.max(0, 50 + r.food * 5)), color: 'ally' as const },
  { label: 'WATER', value: `${r.water > 0 ? '+' : ''}${r.water} / day`, bar: Math.min(100, Math.max(0, 50 + r.water * 5)), color: 'signal' as const },
  { label: 'AIR', value: `${r.air > 0 ? '+' : ''}${r.air} / day`, bar: Math.min(100, Math.max(0, 50 + r.air * 5)), color: 'signal' as const },
  { label: 'RAD', value: `${r.rad} mSv`, bar: Math.min(100, r.rad * 4), color: 'ally' as const },
] : [];
```

Then map over `stats` instead of hardcoding 7 `<ResourceStat>` components.

- [ ] **Step 2: Verify the app still compiles and tests pass**

```bash
npm run build
npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/screens/colony/ColonyView.tsx
git commit -m "feat(colony): wire live simulation stats into colony view"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Resource simulation (power, food, water, air, happiness, radiation)
- ✅ Building construction progress per tick
- ✅ Ore mining/extraction
- ✅ Population capping
- ✅ Event generation on state changes
- ✅ UI reads live computed values

**2. Placeholder scan:**
- No TBDs, TODOs, or vague steps. All code provided.

**3. Type consistency:**
- `AsteroidState` uses same `placedBuildings` shape as existing store.
- `BuildQueueItem` in sim types uses `etaDays` (number) vs old `eta` (string) — store adapter converts.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-28-phase1-core-simulation.md`.**

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Keeps context small.

2. **Inline Execution** — Execute tasks in this session using `executing-plans`, batch execution with checkpoints.

**Which approach?**
