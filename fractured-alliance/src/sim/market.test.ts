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
    const changed = ORES.some((o) => next.prices[o.id] !== m.prices[o.id]);
    expect(changed).toBe(true);
  });

  it('activates merchant every 150 ticks', () => {
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
