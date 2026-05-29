import { describe, it, expect } from 'vitest';
import { tickAI, AI_PERSONALITIES } from './ai';
import type { WorldState } from './types';

function makeWorld(): WorldState {
  return {
    tick: 60,
    treasury: 10000,
    asteroids: [
      {
        id: 'pyre', ownerId: 'kryll', resources: {
          power: 0, food: 0, water: 0, air: 0,
          pop: 100, popCap: 100, happiness: 50, rad: 0,
          ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 }
        },
        placedBuildings: { '0,0': { kind: 'shipyard' } },
        buildQueue: [],
        fleets: [],
      },
      {
        id: 'arch-i', ownerId: 'helion', resources: {
          power: 0, food: 0, water: 0, air: 0,
          pop: 100, popCap: 100, happiness: 50, rad: 0,
          ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 }
        },
        placedBuildings: {},
        buildQueue: [],
        fleets: [],
      },
    ],
    suspicion: 0,
    reputation: {},
    federationStanding: 50,
    events: [],
    fleets: [],
    market: {} as any,
    relations: {},
  };
}

describe('tickAI', () => {
  it('builds ships for races with shipyards', () => {
    const world = makeWorld();
    const result = tickAI(world);
    const pyre = result.world.asteroids.find((a) => a.id === 'pyre');
    expect(pyre?.fleets.length).toBeGreaterThan(0);
  });

  it('has personalities for all enemy races', () => {
    expect(Object.keys(AI_PERSONALITIES)).toHaveLength(6);
  });
});
