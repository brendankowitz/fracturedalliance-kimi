import { describe, it, expect } from 'vitest';
import {
  BELT_BOUNDS,
  BELT_MAX_ZOOM,
  BELT_MIN_ZOOM,
  worldToScreen,
  screenToWorld,
  fitBeltView,
  clampBeltView,
  zoomBeltAt,
  rockRadiusFor,
  hitTestRock,
} from './beltMath';

describe('worldToScreen / screenToWorld', () => {
  it('round-trips under an arbitrary view', () => {
    const v = { zoom: 2.35, panX: -140, panY: 87 };
    const s = worldToScreen(v, 26, 38);
    const w = screenToWorld(v, s.x, s.y);
    expect(w.x).toBeCloseTo(26, 10);
    expect(w.y).toBeCloseTo(38, 10);
  });

  it('identity view maps 1:1', () => {
    const v = { zoom: 1, panX: 0, panY: 0 };
    expect(worldToScreen(v, 50, 50)).toEqual({ x: 50, y: 50 });
  });
});

describe('fitBeltView', () => {
  it('centres the belt in the viewport', () => {
    const v = fitBeltView(800, 600);
    const cx = (BELT_BOUNDS.minX + BELT_BOUNDS.maxX) / 2;
    const cy = (BELT_BOUNDS.minY + BELT_BOUNDS.maxY) / 2;
    const c = worldToScreen(v, cx, cy);
    expect(c.x).toBeCloseTo(400, 10);
    expect(c.y).toBeCloseTo(300, 10);
  });

  it('fits the whole world inside the viewport', () => {
    const v = fitBeltView(800, 600);
    for (const [wx, wy] of [
      [BELT_BOUNDS.minX, BELT_BOUNDS.minY],
      [BELT_BOUNDS.maxX, BELT_BOUNDS.maxY],
    ]) {
      const s = worldToScreen(v, wx, wy);
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThanOrEqual(800);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThanOrEqual(600);
    }
  });
});

describe('clampBeltView', () => {
  it('pulls an off-screen pan back into range', () => {
    const fit = fitBeltView(800, 600);
    const wild = { ...fit, panX: 99999, panY: -99999 };
    const c = clampBeltView(wild, 800, 600);
    // belt centre must be reachable (not pushed past the margin)
    const centre = worldToScreen(c, 50, 50);
    expect(centre.x).toBeGreaterThan(-800);
    expect(centre.x).toBeLessThan(1600);
    expect(c.panX).not.toBe(99999);
    expect(c.panY).not.toBe(-99999);
  });

  it('leaves a valid view untouched', () => {
    const fit = fitBeltView(800, 600);
    expect(clampBeltView(fit, 800, 600)).toEqual(fit);
  });
});

describe('zoomBeltAt', () => {
  it('keeps the world point under the cursor anchored', () => {
    const v = fitBeltView(400, 300); // fit zoom < BELT_MAX_ZOOM here
    const before = screenToWorld(v, 200, 150);
    const z = zoomBeltAt(v, 200, 150, -100, 400, 300); // zoom in
    expect(z.zoom).toBeGreaterThan(v.zoom);
    const after = screenToWorld(z, 200, 150);
    expect(after.x).toBeCloseTo(before.x, 10);
    expect(after.y).toBeCloseTo(before.y, 10);
  });

  it('respects zoom limits', () => {
    let v = fitBeltView(800, 600);
    for (let i = 0; i < 100; i++) v = zoomBeltAt(v, 400, 300, -100, 800, 600);
    expect(v.zoom).toBeLessThanOrEqual(BELT_MAX_ZOOM);
    for (let i = 0; i < 100; i++) v = zoomBeltAt(v, 400, 300, 100, 800, 600);
    expect(v.zoom).toBeGreaterThanOrEqual(BELT_MIN_ZOOM);
  });
});

describe('rockRadiusFor', () => {
  it('orders size classes S < M < L < XL', () => {
    expect(rockRadiusFor('S')).toBeLessThan(rockRadiusFor('M'));
    expect(rockRadiusFor('M')).toBeLessThan(rockRadiusFor('L'));
    expect(rockRadiusFor('L')).toBeLessThan(rockRadiusFor('XL'));
  });

  it('falls back to M for unknown sizes', () => {
    expect(rockRadiusFor(undefined)).toBe(rockRadiusFor('M'));
  });
});

describe('hitTestRock', () => {
  const rocks = [
    { id: 'a', x: 20, y: 20, r: 4 },
    { id: 'b', x: 60, y: 60, r: 6 },
  ];

  it('hits a rock inside its padded radius', () => {
    expect(hitTestRock(21, 21, rocks)).toBe('a');
    expect(hitTestRock(60, 65.5, rocks)).toBe('b');
  });

  it('returns null in empty space', () => {
    expect(hitTestRock(40, 40, rocks)).toBeNull();
    expect(hitTestRock(0, 0, [])).toBeNull();
  });

  it('prefers the nearest rock when radii overlap', () => {
    const overlap = [
      { id: 'near', x: 10, y: 10, r: 6 },
      { id: 'far', x: 14, y: 10, r: 6 },
    ];
    expect(hitTestRock(10.5, 10, overlap)).toBe('near');
  });
});
