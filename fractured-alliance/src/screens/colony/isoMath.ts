/* ============================================================
   isoMath — diamond isometric projection helpers for the
   colony surface view. Pure module, no React/DOM deps.
   ============================================================ */

export const TILE_W = 64;
export const TILE_H = 32;
export const HALF_W = TILE_W / 2;
export const HALF_H = TILE_H / 2;

export type SizeClass = 'S' | 'M' | 'L' | 'XL';

export interface GridPoint {
  x: number;
  y: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

/** Asteroid size class → build grid dimension (N×N). */
export function gridSizeFor(size: SizeClass | undefined): number {
  switch (size) {
    case 'S':
      return 5;
    case 'M':
      return 7;
    case 'L':
      return 9;
    case 'XL':
      return 11;
    default:
      return 9;
  }
}

/**
 * Project a grid-space point to screen space (diamond lattice).
 * Integer grid coords land on lattice vertices; cell (gx,gy)'s
 * diamond has corners at project(gx,gy) [top], project(gx+1,gy)
 * [right], project(gx,gy+1) [left], project(gx+1,gy+1) [bottom].
 */
export function project(gx: number, gy: number, origin: ScreenPoint = { x: 0, y: 0 }): ScreenPoint {
  return {
    x: origin.x + (gx - gy) * HALF_W,
    y: origin.y + (gx + gy) * HALF_H,
  };
}

/** Screen-space centre of cell (gx,gy)'s diamond. */
export function cellCenter(gx: number, gy: number, origin: ScreenPoint = { x: 0, y: 0 }): ScreenPoint {
  return project(gx + 0.5, gy + 0.5, origin);
}

/**
 * Inverse hit-test: screen point (same space as project output)
 * → grid cell, or null when outside the N×N grid.
 */
export function hitTest(
  sx: number,
  sy: number,
  n: number,
  origin: ScreenPoint = { x: 0, y: 0 }
): GridPoint | null {
  const px = sx - origin.x;
  const py = sy - origin.y;
  const gx = Math.floor((px / HALF_W + py / HALF_H) / 2);
  const gy = Math.floor((py / HALF_H - px / HALF_W) / 2);
  if (gx < 0 || gy < 0 || gx >= n || gy >= n) return null;
  return { x: gx, y: gy };
}

/**
 * Placement rule mirrored from the legacy square grid: cells near
 * the rim (manhattan distance > 5 from grid centre) are off-limits.
 */
export function isBuildable(gx: number, gy: number, n: number): boolean {
  const c = (n - 1) / 2;
  return Math.abs(gx - c) + Math.abs(gy - c) <= 5;
}

/** Deterministic 32-bit PRNG (mulberry32). Returns floats in [0,1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Derive a numeric seed from an asteroid id string (FNV-1a). */
export function seedFromId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
