# Phase 2 — Fleet + Combat Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task.

**Goal:** Add fleet management and tactical combat. Ships can be built at yards, assigned to fleets, and engage in auto-resolved combat with visible HP/shield changes.

**Architecture:** Pure simulation functions in `src/sim/combat.ts`. Fleet state lives in `WorldState`. Combat resolution is deterministic (no randomness yet). React Tactical screen reads fleet state from Zustand.

**Tech Stack:** Vite 6 · React 19 · TypeScript 5.7 · Zustand 5 · Vitest

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/sim/fleet.ts` | Fleet state types, ship factory, fleet creation |
| `src/sim/fleet.test.ts` | Ship factory tests |
| `src/sim/combat.ts` | Combat resolution: engagement → damage calc → HP/shield updates |
| `src/sim/combat.test.ts` | Combat tests: 1v1, fleet vs fleet, shield absorption, destruction |
| `src/store/gameStore.ts` | Add fleets to WorldState, ship construction in build queue completion |
| `src/screens/combat/Combat.tsx` | Wire fleet roster + engagement view to live fleet data |

---

## Task 1: Fleet Types and Ship Factory

**Files:**
- Create: `src/sim/fleet.ts`
- Create: `src/sim/fleet.test.ts`

- [ ] **Step 1: Create `src/sim/fleet.ts`**

```typescript
import type { ShipClassDef } from '../types';

export interface ShipInstance {
  id: string;
  classId: string;
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  speed: number;
  dmg: number;
  ownerId: string;
  loc: string; // asteroid id or 'sector'
  status: 'idle' | 'moving' | 'engaged' | 'destroyed';
}

export interface Fleet {
  id: string;
  name: string;
  ownerId: string;
  ships: ShipInstance[];
  orders: 'hold' | 'patrol' | 'attack' | 'retreat';
  targetFleetId?: string;
}

let shipIdCounter = 0;
export function createShip(classDef: ShipClassDef, ownerId: string, loc: string): ShipInstance {
  shipIdCounter += 1;
  return {
    id: `ship-${shipIdCounter}`,
    classId: classDef.id,
    name: classDef.name,
    hp: classDef.hp,
    maxHp: classDef.hp,
    shield: classDef.shield,
    maxShield: classDef.shield,
    speed: classDef.speed,
    dmg: classDef.dmg,
    ownerId,
    loc,
    status: 'idle',
  };
}

export function createFleet(id: string, name: string, ownerId: string, ships: ShipInstance[]): Fleet {
  return { id, name, ownerId, ships, orders: 'hold' };
}

export function resetShipIdCounter() {
  shipIdCounter = 0;
}
```

- [ ] **Step 2: Create `src/sim/fleet.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createShip, createFleet, resetShipIdCounter } from './fleet';
import { SHIP_CLASSES } from '../data/gameData';

beforeEach(() => resetShipIdCounter());

describe('createShip', () => {
  it('creates a ship with stats from class def', () => {
    const scout = SHIP_CLASSES.find((s) => s.id === 'scout')!;
    const ship = createShip(scout, 'helion', 'arch-i');
    expect(ship.classId).toBe('scout');
    expect(ship.hp).toBe(60);
    expect(ship.shield).toBe(0);
    expect(ship.ownerId).toBe('helion');
    expect(ship.status).toBe('idle');
  });

  it('assigns unique ids', () => {
    const scout = SHIP_CLASSES.find((s) => s.id === 'scout')!;
    const a = createShip(scout, 'helion', 'arch-i');
    const b = createShip(scout, 'helion', 'arch-i');
    expect(a.id).not.toBe(b.id);
  });
});

describe('createFleet', () => {
  it('creates a fleet with ships', () => {
    const scout = SHIP_CLASSES.find((s) => s.id === 'scout')!;
    const ship = createShip(scout, 'helion', 'arch-i');
    const fleet = createFleet('f1', 'Alpha', 'helion', [ship]);
    expect(fleet.ships).toHaveLength(1);
    expect(fleet.orders).toBe('hold');
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/sim/fleet.test.ts
```
Expected: 3/3 PASS

- [ ] **Step 4: Commit**

```bash
git add src/sim/fleet.ts src/sim/fleet.test.ts
git commit -m "feat(sim): add fleet types and ship factory"
```

---

## Task 2: Ship Construction on Build Complete

**Files:**
- Modify: `src/sim/tick.ts`
- Modify: `src/sim/tick.test.ts`
- Modify: `src/sim/types.ts`

- [ ] **Step 1: Extend `WorldState` and `AsteroidState` to hold fleets**

In `src/sim/types.ts`, add to `AsteroidState`:
```typescript
import type { Fleet } from './fleet';
// ... existing imports

export interface AsteroidState {
  // ... existing fields
  fleets: Fleet[];
}
```

In `src/sim/types.ts`, add to `WorldState`:
```typescript
export interface WorldState {
  // ... existing fields
  fleets: Fleet[];
}
```

- [ ] **Step 2: Modify `src/sim/tick.ts` to spawn ships when shipyard/dock construction completes**

Add import:
```typescript
import { createShip, createFleet } from './fleet';
import { SHIP_CLASSES } from '../data/gameData';
```

In `tickAsteroid`, when a building completes construction, check if it's a shipyard or dock:
```typescript
// After building.constructing = false and queue shift:
if (building.kind === 'shipyard') {
  // Spawn a Scout (cheapest hull) automatically for now
  const scoutDef = SHIP_CLASSES.find((s) => s.id === 'scout');
  if (scoutDef) {
    const ship = createShip(scoutDef, next.ownerId ?? 'helion', next.id);
    const fleet = createFleet(`fleet-${next.id}`, `${next.id} Defence`, next.ownerId ?? 'helion', [ship]);
    next.fleets = [...next.fleets, fleet];
  }
}
if (building.kind === 'dock') {
  const cruiserDef = SHIP_CLASSES.find((s) => s.id === 'cruiser');
  if (cruiserDef) {
    const ship = createShip(cruiserDef, next.ownerId ?? 'helion', next.id);
    const fleet = createFleet(`fleet-${next.id}-cap`, `${next.id} Capital`, next.ownerId ?? 'helion', [ship]);
    next.fleets = [...next.fleets, fleet];
  }
}
```

- [ ] **Step 3: Update `DEFAULT_ASTEROIDS` in `src/store/gameStore.ts` to include `fleets: []`**

Add `fleets: []` to every asteroid in `DEFAULT_ASTEROIDS`.

- [ ] **Step 4: Update tests**

Add test in `tick.test.ts`:
```typescript
it('spawns a fleet when shipyard construction completes', () => {
  const asteroid = makeAsteroid();
  asteroid.placedBuildings['0,0'] = { kind: 'shipyard', constructing: true, progress: 0.99 };
  asteroid.buildQueue = [{ name: 'Ship Yard', cell: '[0,0]', pct: 99, etaDays: 0, active: true }];
  asteroid.fleets = [];

  const result = tickAsteroid(asteroid, 1);
  expect(result.fleets).toHaveLength(1);
  expect(result.fleets[0].ships[0].classId).toBe('scout');
});
```

- [ ] **Step 5: Run all tests**

```bash
npx vitest run
```
Expected: all PASS

- [ ] **Step 6: Commit**

```bash
git add src/sim/tick.ts src/sim/tick.test.ts src/sim/types.ts src/store/gameStore.ts
git commit -m "feat(sim): spawn fleets on shipyard/dock completion"
```

---

## Task 3: Combat Resolution Engine

**Files:**
- Create: `src/sim/combat.ts`
- Create: `src/sim/combat.test.ts`

- [ ] **Step 1: Create `src/sim/combat.ts`**

```typescript
import type { Fleet, ShipInstance } from './fleet';

export interface CombatResult {
  attackerLosses: ShipInstance[];
  defenderLosses: ShipInstance[];
  log: string[];
}

export function resolveCombat(attacker: Fleet, defender: Fleet): CombatResult {
  const log: string[] = [];
  const attackerLosses: ShipInstance[] = [];
  const defenderLosses: ShipInstance[] = [];

  // Simple round-robin damage
  let aIdx = 0;
  let dIdx = 0;
  let round = 1;

  const aliveAttacker = () => attacker.ships.filter((s) => s.status !== 'destroyed');
  const aliveDefender = () => defender.ships.filter((s) => s.status !== 'destroyed');

  while (aliveAttacker().length > 0 && aliveDefender().length > 0 && round <= 20) {
    const aShips = aliveAttacker();
    const dShips = aliveDefender();

    // Each alive attacker fires at one defender
    for (const ship of aShips) {
      const target = dShips[dIdx % dShips.length];
      applyDamage(ship, target, log);
      if (target.status === 'destroyed') {
        defenderLosses.push(target);
      }
      dIdx++;
    }

    // Each alive defender fires back
    for (const ship of dShips) {
      if (ship.status === 'destroyed') continue;
      const target = aShips[aIdx % aShips.length];
      applyDamage(ship, target, log);
      if (target.status === 'destroyed') {
        attackerLosses.push(target);
      }
      aIdx++;
    }

    round++;
  }

  return { attackerLosses, defenderLosses, log };
}

function applyDamage(attacker: ShipInstance, target: ShipInstance, log: string[]) {
  let dmg = attacker.dmg;

  // Shield absorbs damage first
  if (target.shield > 0) {
    const shieldAbsorb = Math.min(target.shield, dmg);
    target.shield -= shieldAbsorb;
    dmg -= shieldAbsorb;
    if (shieldAbsorb > 0) {
      log.push(`${attacker.name} hits ${target.name} shield for ${shieldAbsorb}`);
    }
  }

  if (dmg > 0) {
    target.hp -= dmg;
    log.push(`${attacker.name} deals ${dmg} hull damage to ${target.name}`);
  }

  if (target.hp <= 0) {
    target.hp = 0;
    target.status = 'destroyed';
    log.push(`${target.name} destroyed!`);
  }
}
```

- [ ] **Step 2: Create `src/sim/combat.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { resolveCombat } from './combat';
import { createShip, createFleet, resetShipIdCounter } from './fleet';
import { SHIP_CLASSES } from '../data/gameData';

describe('resolveCombat', () => {
  beforeEach(() => resetShipIdCounter());

  it('resolves a 1v1 combat', () => {
    const scoutDef = SHIP_CLASSES.find((s) => s.id === 'scout')!;
    const a = createFleet('fa', 'A', 'helion', [createShip(scoutDef, 'helion', 'arch-i')]);
    const b = createFleet('fb', 'B', 'kryll', [createShip(scoutDef, 'kryll', 'pyre')]);

    const result = resolveCombat(a, b);
    expect(result.log.length).toBeGreaterThan(0);
    expect(result.attackerLosses.length + result.defenderLosses.length).toBeGreaterThan(0);
  });

  it('shield absorbs damage before hull', () => {
    const eagleDef = SHIP_CLASSES.find((s) => s.id === 'eagle')!; // has 60 shield
    const scoutDef = SHIP_CLASSES.find((s) => s.id === 'scout')!; // 4 dmg
    const a = createFleet('fa', 'A', 'helion', [createShip(eagleDef, 'helion', 'arch-i')]);
    const b = createFleet('fb', 'B', 'kryll', [createShip(scoutDef, 'kryll', 'pyre')]);

    resolveCombat(a, b);
    expect(a.ships[0].shield).toBeLessThan(60);
    expect(a.ships[0].hp).toBe(240); // hull untouched if shield held
  });

  it('destroys ships at 0 hp', () => {
    const scoutDef = SHIP_CLASSES.find((s) => s.id === 'scout')!;
    const battleshipDef = SHIP_CLASSES.find((s) => s.id === 'battleship')!;
    const a = createFleet('fa', 'A', 'helion', [createShip(battleshipDef, 'helion', 'arch-i')]);
    const b = createFleet('fb', 'B', 'kryll', [createShip(scoutDef, 'kryll', 'pyre')]);

    const result = resolveCombat(a, b);
    expect(result.defenderLosses.length).toBe(1);
    expect(b.ships[0].status).toBe('destroyed');
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/sim/combat.test.ts
```
Expected: 3/3 PASS

- [ ] **Step 4: Commit**

```bash
git add src/sim/combat.ts src/sim/combat.test.ts
git commit -m "feat(sim): add combat resolution engine"
```

---

## Task 4: Wire Tactical Screen to Live Fleet Data

**Files:**
- Modify: `src/screens/combat/Combat.tsx`

- [ ] **Step 1: Modify `src/screens/combat/Combat.tsx`**

Replace hardcoded fleet data with store selectors:

```typescript
import { useGameStore } from '../../store/gameStore';
import { SHIP_CLASSES } from '../../data/gameData';

export function Combat() {
  const fleets = useGameStore((s) => s.asteroids.flatMap((a) => a.fleets));
  const playerFleets = fleets.filter((f) => f.ownerId === 'helion');
  const enemyFleets = fleets.filter((f) => f.ownerId !== 'helion');

  return (
    <div className="screen screen-enter" style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', height: '100%' }}>
      <FleetRoster fleets={playerFleets} title="PLAYER FLEETS" />
      <EngagementView playerFleets={playerFleets} enemyFleets={enemyFleets} />
      <TargetPanel fleets={enemyFleets} />
    </div>
  );
}
```

Update `FleetRoster` to accept `fleets: Fleet[]` and render actual ship HP/shield bars.

Update `EngagementView` to show actual fleet counts.

Update `TargetPanel` to show actual enemy fleets.

**Keep existing visual structure and styling.** Only replace hardcoded data with live props.

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Run all tests**

```bash
npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add src/screens/combat/Combat.tsx
git commit -m "feat(combat): wire tactical screen to live fleet data"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Ship construction on yard/dock completion
- ✅ Fleet state model
- ✅ Combat resolution with shields + hull
- ✅ Tactical screen reads live data

**2. Placeholder scan:**
- No TBDs. All code is complete.

**3. Type consistency:**
- `Fleet` and `ShipInstance` are new types. `AsteroidState` gains `fleets: Fleet[]`.
- `WorldState` also gains `fleets: Fleet[]` for future sector-level fleets.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-28-phase2-fleet-combat.md`.**

**Execution: Subagent-Driven** — fresh subagent per task, review between tasks.
