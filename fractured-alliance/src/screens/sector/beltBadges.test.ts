import { describe, it, expect } from 'vitest';
import type { OreKind } from '../../types';
import type { AsteroidState } from '../../sim/types';
import type { Fleet, ShipInstance } from '../../sim/fleet';
import type { MarketState } from '../../sim/market';
import {
  enginesArmedFor,
  fleetBadgeFor,
  fleetBadgeFromFleets,
  fleetToneFor,
  merchantDockFor,
  silhouetteSizeFor,
} from './beltBadges';

let shipN = 0;
function ship(
  classId: string,
  status: ShipInstance['status'] = 'idle',
  ownerId = 'helion'
): ShipInstance {
  shipN += 1;
  return {
    id: `s${shipN}`,
    classId,
    name: classId,
    hp: 10,
    maxHp: 10,
    shield: 0,
    maxShield: 0,
    speed: 1,
    dmg: 1,
    ownerId,
    loc: 'a1',
    status,
  };
}

function fleet(
  id: string,
  ownerId: string,
  ships: ShipInstance[],
  orders: Fleet['orders'] = 'hold'
): Fleet {
  return { id, name: id, ownerId, ships, orders };
}

function makeAsteroid(overrides: Partial<AsteroidState> = {}): AsteroidState {
  return {
    id: 'a1',
    ownerId: 'helion',
    resources: {
      power: 0,
      food: 0,
      water: 0,
      air: 0,
      pop: 0,
      popCap: 0,
      happiness: 0,
      rad: 0,
      ores: {} as Record<OreKind, number>,
    },
    placedBuildings: {},
    buildQueue: [],
    fleets: [],
    ...overrides,
  };
}

function makeMarket(overrides: Partial<MarketState> = {}): MarketState {
  return {
    prices: {} as Record<OreKind, number>,
    basePrices: {} as Record<OreKind, number>,
    demand: {} as Record<OreKind, number>,
    merchantStock: {},
    merchantActive: false,
    merchantArrivalTick: 0,
    blackMarketActive: false,
    ...overrides,
  };
}

describe('fleetToneFor', () => {
  it('maps owners to the ownership-glow tint idiom', () => {
    expect(fleetToneFor('helion')).toBe('warn');
    expect(fleetToneFor('mauna')).toBe('crit');
    expect(fleetToneFor('kryll')).toBe('signal');
  });
});

describe('silhouetteSizeFor', () => {
  it('buckets ship classes by size', () => {
    expect(silhouetteSizeFor('scout')).toBe('S');
    expect(silhouetteSizeFor('assault')).toBe('S');
    expect(silhouetteSizeFor('eagle')).toBe('M');
    expect(silhouetteSizeFor('battleship')).toBe('M');
    expect(silhouetteSizeFor('destructor')).toBe('M');
    expect(silhouetteSizeFor('terminator')).toBe('L');
    expect(silhouetteSizeFor('cruiser')).toBe('L');
    expect(silhouetteSizeFor('unknown-class')).toBe('S');
  });
});

describe('fleetBadgeFromFleets', () => {
  it('returns null when no fleets are stationed', () => {
    expect(fleetBadgeFromFleets([])).toBeNull();
  });

  it('returns null when every ship is destroyed', () => {
    const f = fleet('f1', 'helion', [ship('scout', 'destroyed'), ship('eagle', 'destroyed')]);
    expect(fleetBadgeFromFleets([f])).toBeNull();
  });

  it('counts only active hulls', () => {
    const f = fleet('f1', 'helion', [
      ship('scout'),
      ship('scout', 'destroyed'),
      ship('eagle', 'engaged'),
    ]);
    expect(fleetBadgeFromFleets([f])?.hulls).toBe(2);
  });

  it('tints by the owner of the largest stationed fleet', () => {
    const small = fleet('f1', 'helion', [ship('scout')]);
    const large = fleet('f2', 'mauna', [ship('eagle'), ship('eagle')]);
    const badge = fleetBadgeFromFleets([small, large]);
    expect(badge?.ownerId).toBe('mauna');
    expect(badge?.tone).toBe('crit');
    expect(badge?.hulls).toBe(3);
  });

  it('flags attack and patrol orders', () => {
    const atk = fleet('f1', 'kryll', [ship('scout')], 'attack');
    expect(fleetBadgeFromFleets([atk])?.attacking).toBe(true);
    expect(fleetBadgeFromFleets([atk])?.patrolling).toBe(false);
    const pat = fleet('f2', 'helion', [ship('scout')], 'patrol');
    expect(fleetBadgeFromFleets([pat])?.patrolling).toBe(true);
    expect(fleetBadgeFromFleets([pat])?.attacking).toBe(false);
  });

  it('caps silhouettes at 3, largest class first', () => {
    const f = fleet('f1', 'helion', [
      ship('scout'),
      ship('cruiser'),
      ship('scout'),
      ship('eagle'),
      ship('assault'),
    ]);
    expect(fleetBadgeFromFleets([f])?.silhouettes).toEqual(['L', 'M', 'S']);
  });
});

describe('fleetBadgeFor', () => {
  it('reads stationed fleets off the asteroid', () => {
    const a = makeAsteroid({ fleets: [fleet('f1', 'helion', [ship('scout')])] });
    expect(fleetBadgeFor(a)?.hulls).toBe(1);
    expect(fleetBadgeFor(makeAsteroid())).toBeNull();
  });
});

describe('enginesArmedFor', () => {
  it('counts built engines only', () => {
    const a = makeAsteroid({
      placedBuildings: {
        '1,1': { kind: 'engine' },
        '2,2': { kind: 'engine', constructing: true, progress: 0.4 },
        '3,3': { kind: 'laser' },
        '4,4': { kind: 'engine' },
      },
    });
    expect(enginesArmedFor(a)).toBe(2);
  });

  it('returns 0 with no engines', () => {
    expect(enginesArmedFor(makeAsteroid())).toBe(0);
  });
});

describe('merchantDockFor', () => {
  const home = makeAsteroid({ id: 'arch-i', status: 'home', ownerId: 'helion' });
  const colony = makeAsteroid({ id: 'arch-ii', status: 'colony', ownerId: 'helion' });
  const foreign = makeAsteroid({ id: 'pyre', status: 'foreign', ownerId: 'kryll' });

  it('returns null while the merchant is inactive', () => {
    expect(merchantDockFor([home], makeMarket({ merchantActive: false }))).toBeNull();
  });

  it('docks at the home asteroid and reports stock lots', () => {
    const dock = merchantDockFor(
      [colony, home, foreign],
      makeMarket({ merchantActive: true, merchantStock: { luxury: 4, tools: 9 } })
    );
    expect(dock).toEqual({ asteroidId: 'arch-i', stockCount: 2 });
  });

  it('falls back to the first helion asteroid when no home is flagged', () => {
    const dock = merchantDockFor([foreign, colony], makeMarket({ merchantActive: true }));
    expect(dock?.asteroidId).toBe('arch-ii');
  });

  it('returns null when the player owns nothing', () => {
    expect(merchantDockFor([foreign], makeMarket({ merchantActive: true }))).toBeNull();
  });
});
