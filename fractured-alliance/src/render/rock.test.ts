import { describe, it, expect } from 'vitest';
import { rockNoise } from './rock';
import { mulberry32, seedFromId } from '../screens/colony/isoMath';

describe('rockNoise', () => {
  it('is deterministic for a given seed', () => {
    const a = rockNoise(mulberry32(seedFromId('arch-i')));
    const b = rockNoise(mulberry32(seedFromId('arch-i')));
    expect(a).toEqual(b);
  });

  it('differs between seeds', () => {
    const a = rockNoise(mulberry32(seedFromId('arch-i')));
    const b = rockNoise(mulberry32(seedFromId('forge-3')));
    expect(a).not.toEqual(b);
  });

  it('returns 48 smoothed multipliers in a sane range', () => {
    const n = rockNoise(mulberry32(seedFromId('gallow')));
    expect(n).toHaveLength(48);
    for (const k of n) {
      // raw range is [0.84, 1.14); smoothing only narrows it
      expect(k).toBeGreaterThanOrEqual(0.84);
      expect(k).toBeLessThan(1.14);
    }
  });

  it('honours a custom step count', () => {
    expect(rockNoise(mulberry32(7), 16)).toHaveLength(16);
  });
});
