import { describe, it, expect } from 'vitest';
import { byId, RACES, BUILDINGS, ORES, ASTEROIDS } from './gameData';

describe('gameData', () => {
  it('finds race by id', () => {
    const race = byId(RACES, 'helion');
    expect(race).toBeDefined();
    expect(race?.name).toBe('Helion Corp');
  });

  it('returns undefined for missing id', () => {
    const race = byId(RACES, 'nonexistent');
    expect(race).toBeUndefined();
  });

  it('has 7 races', () => {
    expect(RACES.length).toBe(7);
  });

  it('has 23 buildings', () => {
    expect(BUILDINGS.length).toBe(23);
  });

  it('has 10 ores', () => {
    expect(ORES.length).toBe(10);
  });

  it('has 15 asteroids', () => {
    expect(ASTEROIDS.length).toBe(15);
  });

  it('every building has a unique id', () => {
    const ids = BUILDINGS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every ore has a valid tier', () => {
    for (const ore of ORES) {
      expect(ore.tier).toBeGreaterThanOrEqual(1);
      expect(ore.tier).toBeLessThanOrEqual(4);
    }
  });
});
