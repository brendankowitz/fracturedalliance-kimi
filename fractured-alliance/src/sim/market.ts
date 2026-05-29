import type { OreKind } from '../types';

export interface MarketState {
  prices: Record<OreKind, number>;
  basePrices: Record<OreKind, number>;
  demand: Record<OreKind, number>;
  merchantStock: Record<string, number>;
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

  for (const ore of ORE_IDS) {
    const base = next.basePrices[ore];
    const noise = (Math.random() - 0.5) * 0.04;
    const demandShift = (next.demand[ore] - 1.0) * 0.1;
    const newPrice = base * (1 + noise + demandShift);
    next.prices[ore] = Math.max(1, Math.round(newPrice));
  }

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
