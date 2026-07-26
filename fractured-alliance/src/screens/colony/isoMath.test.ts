import { describe, it, expect } from 'vitest';
import {
  TILE_W,
  TILE_H,
  project,
  cellCenter,
  hitTest,
  gridSizeFor,
  isBuildable,
  mulberry32,
  seedFromId,
} from './isoMath';

describe('project', () => {
  it('maps grid axes to screen diagonals', () => {
    expect(project(0, 0)).toEqual({ x: 0, y: 0 });
    expect(project(1, 0)).toEqual({ x: TILE_W / 2, y: TILE_H / 2 });
    expect(project(0, 1)).toEqual({ x: -TILE_W / 2, y: TILE_H / 2 });
    expect(project(2, 2)).toEqual({ x: 0, y: 64 });
  });

  it('honours the origin offset', () => {
    expect(project(1, 1, { x: 100, y: 50 })).toEqual({ x: 100, y: 82 });
  });
});

describe('hitTest', () => {
  it('is the inverse of projection for every cell centre (9×9)', () => {
    const origin = { x: 320, y: 40 };
    for (let gx = 0; gx < 9; gx++) {
      for (let gy = 0; gy < 9; gy++) {
        const c = cellCenter(gx, gy, origin);
        expect(hitTest(c.x, c.y, 9, origin)).toEqual({ x: gx, y: gy });
      }
    }
  });

  it('round-trips with a non-zero origin on a 5×5 grid', () => {
    const origin = { x: -17, y: 203 };
    for (let gx = 0; gx < 5; gx++) {
      for (let gy = 0; gy < 5; gy++) {
        const c = cellCenter(gx, gy, origin);
        expect(hitTest(c.x, c.y, 5, origin)).toEqual({ x: gx, y: gy });
      }
    }
  });

  it('returns null outside the grid', () => {
    expect(hitTest(-500, -500, 9)).toBeNull();
    expect(hitTest(5000, 5000, 9)).toBeNull();
    // just past the far corner of a 5×5 grid
    const beyond = project(5, 5);
    expect(hitTest(beyond.x, beyond.y + TILE_H, 5)).toBeNull();
  });
});

describe('gridSizeFor', () => {
  it('maps size classes to grid dimensions', () => {
    expect(gridSizeFor('S')).toBe(5);
    expect(gridSizeFor('M')).toBe(7);
    expect(gridSizeFor('L')).toBe(9);
    expect(gridSizeFor('XL')).toBe(11);
    expect(gridSizeFor(undefined)).toBe(9);
  });
});

describe('isBuildable', () => {
  it('matches the legacy rim rule on a 9×9 grid', () => {
    expect(isBuildable(4, 4, 9)).toBe(true);
    expect(isBuildable(4, 0, 9)).toBe(true); // dist 4 → allowed
    expect(isBuildable(0, 0, 9)).toBe(false); // dist 8 → rim
    expect(isBuildable(1, 4, 9)).toBe(true); // dist 3
    expect(isBuildable(0, 4, 9)).toBe(true); // dist 4... rim threshold is >5
  });
});

describe('mulberry32', () => {
  it('is deterministic for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 10; i++) {
      expect(a()).toBe(b());
    }
  });

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = Array.from({ length: 8 }, () => a());
    const seqB = Array.from({ length: 8 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  it('returns values in [0, 1)', () => {
    const rand = mulberry32(12345);
    for (let i = 0; i < 1000; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('seedFromId', () => {
  it('is deterministic', () => {
    expect(seedFromId('arch-i')).toBe(seedFromId('arch-i'));
  });

  it('differs across asteroid ids', () => {
    expect(seedFromId('arch-i')).not.toBe(seedFromId('forge-3'));
  });
});
