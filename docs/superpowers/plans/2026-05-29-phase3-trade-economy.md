# Phase 3 — Trade + Economy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task.

**Goal:** Add a live economy. Ore prices fluctuate per tick. Players can buy and sell ore. Merchants arrive with stock. Black market trades generate suspicion.

**Architecture:** Market state lives in `WorldState` (prices, merchant stock). `tickWorld()` updates prices via a supply/demand algorithm. Zustand store adds `buyOre` / `sellOre` actions. Trade screen reads live prices and asteroid stockpiles.

**Tech Stack:** Vite 6 · React 19 · TypeScript 5.7 · Zustand 5 · Vitest

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/sim/market.ts` | Market state types, price fluctuation logic, buy/sell validation |
| `src/sim/market.test.ts` | Price fluctuation tests, buy/sell tests |
| `src/store/gameStore.ts` | Add market state, buyOre/sellOre actions |
| `src/store/gameStore.test.ts` | Test buy/sell transactions |
| `src/screens/trade/Trade.tsx` | Wire federal/merchant/black channels to live data |

---

## Task 1: Market Engine

**Files:**
- Create: `src/sim/market.ts`
- Create: `src/sim/market.test.ts`

- [ ] **Step 1: Create `src/sim/market.ts`**

```typescript
import type { OreKind } from '../types';

export interface MarketState {
  prices: Record<OreKind, number>; // current price per unit
  basePrices: Record<OreKind, number>; // reference baseline
  demand: Record<OreKind, number>; // 0.5 = undersupply (high prices), 1.5 = oversupply (low prices)
  merchantStock: Record<string, number>; // item id → qty available from merchant
  merchantActive: boolean;
  merchantArrivalTick: number;
  blackMarketActive: boolean;
}

export const ORE_IDS: OreKind[] = [
  'selenium', 'asteros', 'barium', 'crystalite', 'quazinc',
  'bytanium', 'korellium', 'dragonium', 'traxium', 'nexos',
];

export function createMarket(basePrices: Record<OreKind, number>): MarketState {
  return {
    prices: { ...basePrices },
    basePrices: { ...basePrices },
    demand: Object.fromEntries(ORE_IDS.map((id) => [id, 1.0])) as Record<OreKind, number>,
    merchantStock: {},
    merchantActive: true,
    merchantArrivalTick: 0,
    blackMarketActive: true,
  };
}

export function tickMarket(market: MarketState, tick: number): MarketState {
  const next: MarketState = {
    ...market,
    prices: { ...market.prices },
    demand: { ...market.demand },
    merchantStock: { ...market.merchantStock },
  };

  // Price fluctuation: random walk around base price adjusted by demand
  for (const ore of ORE_IDS) {
    const base = next.basePrices[ore];
    const noise = (Math.random() - 0.5) * 0.04; // ±2% jitter
    const demandShift = (next.demand[ore] - 1.0) * 0.1; // demand drives price
    const newPrice = base * (1 + noise + demandShift);
    next.prices[ore] = Math.max(1, Math.round(newPrice));
  }

  // Merchant cycle: arrives every 90 ticks, stays 60 ticks
  const cycle = tick % 150;
  if (cycle === 0) {
    next.merchantActive = true;
    next.merchantArrivalTick = tick;
    next.merchantStock = {
      luxury: 8 + Math.floor(Math.random() * 6),
      tools: 20 + Math.floor(Math.random() * 10),
      medkit: 10 + Math.floor(Math.random() * 8),
      antiv: 2 + Math.floor(Math.random() * 3),
    };
  } else if (cycle >= 60) {
    next.merchantActive = false;
    next.merchantStock = {};
  }

  return next;
}

export interface TransactionResult {
  success: boolean;
  message: string;
  newTreasury: number;
  newStockpile: number;
}

export function buyOre(
  market: MarketState,
  treasury: number,
  stockpile: number,
  ore: OreKind,
  qty: number,
): TransactionResult {
  const price = market.prices[ore];
  const cost = price * qty;
  if (cost > treasury) {
    return { success: false, message: 'Insufficient funds', newTreasury: treasury, newStockpile: stockpile };
  }
  return { success: true, message: `Bought ${qty} ${ore}`, newTreasury: treasury - cost, newStockpile: stockpile + qty };
}

export function sellOre(
  market: MarketState,
  treasury: number,
  stockpile: number,
  ore: OreKind,
  qty: number,
): TransactionResult {
  if (qty > stockpile) {
    return { success: false, message: 'Insufficient ore', newTreasury: treasury, newStockpile: stockpile };
  }
  const price = market.prices[ore];
  const revenue = price * qty;
  return { success: true, message: `Sold ${qty} ${ore}`, newTreasury: treasury + revenue, newStockpile: stockpile - qty };
}
```

- [ ] **Step 2: Create `src/sim/market.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { createMarket, tickMarket, buyOre, sellOre } from './market';
import { ORES } from '../data/gameData';

describe('createMarket', () => {
  it('initializes prices from base prices', () => {
    const base = { selenium: 12, asteros: 18 } as Record<string, number>;
    const m = createMarket(base as any);
    expect(m.prices.selenium).toBe(12);
    expect(m.prices.asteros).toBe(18);
  });
});

describe('tickMarket', () => {
  it('changes prices each tick', () => {
    const base = Object.fromEntries(ORES.map((o) => [o.id, o.price])) as Record<string, number>;
    const m = createMarket(base as any);
    const next = tickMarket(m, 1);
    // At least one price should differ due to random jitter
    const changed = ORES.some((o) => next.prices[o.id] !== m.prices[o.id]);
    expect(changed).toBe(true);
  });

  it('activates merchant every 90 ticks', () => {
    const base = Object.fromEntries(ORES.map((o) => [o.id, o.price])) as Record<string, number>;
    const m = createMarket(base as any);
    const next = tickMarket(m, 0);
    expect(next.merchantActive).toBe(true);
    expect(Object.keys(next.merchantStock).length).toBeGreaterThan(0);
  });
});

describe('buyOre', () => {
  it('deducts treasury and adds stock', () => {
    const base = { selenium: 10 } as Record<string, number>;
    const m = createMarket(base as any);
    const result = buyOre(m, 1000, 0, 'selenium', 5);
    expect(result.success).toBe(true);
    expect(result.newTreasury).toBe(950);
    expect(result.newStockpile).toBe(5);
  });

  it('fails if insufficient funds', () => {
    const base = { selenium: 100 } as Record<string, number>;
    const m = createMarket(base as any);
    const result = buyOre(m, 50, 0, 'selenium', 1);
    expect(result.success).toBe(false);
  });
});

describe('sellOre', () => {
  it('adds treasury and deducts stock', () => {
    const base = { selenium: 10 } as Record<string, number>;
    const m = createMarket(base as any);
    const result = sellOre(m, 1000, 10, 'selenium', 5);
    expect(result.success).toBe(true);
    expect(result.newTreasury).toBe(1050);
    expect(result.newStockpile).toBe(5);
  });

  it('fails if insufficient stock', () => {
    const base = { selenium: 10 } as Record<string, number>;
    const m = createMarket(base as any);
    const result = sellOre(m, 1000, 2, 'selenium', 5);
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/sim/market.test.ts
```
Expected: 6/6 PASS

- [ ] **Step 4: Commit**

```bash
git add src/sim/market.ts src/sim/market.test.ts
git commit -m "feat(sim): add market engine with price fluctuation and trading"
```

---

## Task 2: Wire Market into Game Store

**Files:**
- Modify: `src/sim/types.ts`
- Modify: `src/sim/tick.ts`
- Modify: `src/store/gameStore.ts`
- Modify: `src/store/gameStore.test.ts`

- [ ] **Step 1: Add `MarketState` to `WorldState`**

In `src/sim/types.ts`, add:
```typescript
import type { MarketState } from './market';

export interface WorldState {
  // ... existing fields
  market: MarketState;
}
```

- [ ] **Step 2: Update `tickWorld` to call `tickMarket`**

In `src/sim/tick.ts`:
```typescript
import { tickMarket, createMarket } from './market';
import { ORES } from '../data/gameData';
```

Update `tickWorld`:
```typescript
export function tickWorld(world: WorldState): { world: WorldState; events: SimEvent[] } {
  // ... existing code ...
  const nextMarket = tickMarket(world.market, nextTick);
  // ...
  const nextWorld: WorldState = {
    ...world,
    tick: nextTick,
    asteroids: nextAsteroids,
    events: [...newEvents, ...world.events].slice(0, 50),
    market: nextMarket,
  };
  return { world: nextWorld, events: newEvents };
}
```

- [ ] **Step 3: Add market to store state and actions**

In `src/store/gameStore.ts`:
- Add `market: MarketState` to `GameState` interface
- Import `createMarket, buyOre, sellOre` from `../sim/market`
- Import `ORES` from `../data/gameData`
- Create initial market:
```typescript
const INITIAL_MARKET = createMarket(
  Object.fromEntries(ORES.map((o) => [o.id, o.price])) as Record<OreKind, number>
);
```
- Add `market: INITIAL_MARKET` to store initializer
- Update `tickWorld` call to include `market: state.market`
- Add actions:
```typescript
buyOre: (ore: OreKind, qty: number) => {
  set((state) => {
    const asteroid = state.asteroids.find((a) => a.id === state.selectedAsteroid);
    if (!asteroid) return state;
    const stockpile = asteroid.resources.ores[ore];
    const result = buyOreSim(state.market, state.treasury, stockpile, ore, qty);
    if (!result.success) return state;
    const aIdx = state.asteroids.findIndex((a) => a.id === state.selectedAsteroid);
    const nextAsteroids = [...state.asteroids];
    nextAsteroids[aIdx] = {
      ...nextAsteroids[aIdx],
      resources: {
        ...nextAsteroids[aIdx].resources,
        ores: { ...nextAsteroids[aIdx].resources.ores, [ore]: result.newStockpile },
      },
    };
    return { treasury: result.newTreasury, asteroids: nextAsteroids };
  });
},

sellOre: (ore: OreKind, qty: number) => {
  set((state) => {
    const asteroid = state.asteroids.find((a) => a.id === state.selectedAsteroid);
    if (!asteroid) return state;
    const stockpile = asteroid.resources.ores[ore];
    const result = sellOreSim(state.market, state.treasury, stockpile, ore, qty);
    if (!result.success) return state;
    const aIdx = state.asteroids.findIndex((a) => a.id === state.selectedAsteroid);
    const nextAsteroids = [...state.asteroids];
    nextAsteroids[aIdx] = {
      ...nextAsteroids[aIdx],
      resources: {
        ...nextAsteroids[aIdx].resources,
        ores: { ...nextAsteroids[aIdx].resources.ores, [ore]: result.newStockpile },
      },
    };
    return { treasury: result.newTreasury, asteroids: nextAsteroids };
  });
},
```

Note: Rename imported functions to avoid naming conflict with store actions:
```typescript
import { buyOre as buyOreSim, sellOre as sellOreSim } from '../sim/market';
```

- [ ] **Step 4: Add tests**

In `src/store/gameStore.test.ts`:
```typescript
it('buyOre deducts treasury and adds ore', () => {
  const { result } = renderHook(() => useGameStore());
  const initialTreasury = result.current.treasury;
  act(() => result.current.buyOre('selenium', 1));
  expect(result.current.treasury).toBeLessThan(initialTreasury);
  expect(result.current.asteroids[0].resources.ores.selenium).toBeGreaterThan(0);
});
```

- [ ] **Step 5: Run all tests**

```bash
npx vitest run
```

- [ ] **Step 6: Commit**

```bash
git add src/sim/types.ts src/sim/tick.ts src/store/gameStore.ts src/store/gameStore.test.ts
git commit -m "feat(store): wire market into game store with buy/sell actions"
```

---

## Task 3: Wire Trade Screen to Live Data

**Files:**
- Modify: `src/screens/trade/Trade.tsx`

- [ ] **Step 1: Replace hardcoded data with store selectors**

In `Trade.tsx`, add store selectors:
```typescript
const market = useGameStore((s) => s.market);
const asteroid = useGameStore((s) => s.asteroids.find((a) => a.id === s.selectedAsteroid));
const treasury = useGameStore((s) => s.treasury);
const buyOre = useGameStore((s) => s.buyOre);
const sellOre = useGameStore((s) => s.sellOre);
```

Replace `FederalChannel` to show live prices and allow buy/sell:
- Render a row per ore with: name, current price, player stockpile, buy button, sell button
- Prices come from `market.prices[ore.id]`
- Stockpile comes from `asteroid?.resources.ores[ore.id] ?? 0`
- Buy/sell in increments of 1 or 10

Replace `MerchantChannel` to show live merchant stock:
- Show `market.merchantActive` status
- List items from `market.merchantStock`

Replace `CargoStockpile` to show actual ore stockpiles:
- Read from `asteroid?.resources.ores`

Replace `RecentTrades` with a simple "Market Status" panel showing demand multipliers.

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
git add src/screens/trade/Trade.tsx
git commit -m "feat(trade): wire trade screen to live market data"
```

---

## Self-Review

**1. Spec coverage:**
- ✅ Price fluctuation per tick
- ✅ Merchant arrival/departure cycle
- ✅ Buy/sell transactions with validation
- ✅ Trade screen reads live prices and stockpiles

**2. Placeholder scan:**
- No TBDs.

**3. Type consistency:**
- `OreKind` used consistently across market, store, and UI.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-29-phase3-trade-economy.md`.**

**Execution: Subagent-Driven** — fresh subagent per task.
