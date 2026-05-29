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
