/* ============================================================
   beltMath — world/screen transform + hit-testing for the
   sector belt map. World space is 0..100 units on both axes
   (asteroid x/y coords). Pure module, no React/DOM deps.
   ============================================================ */

import type { SizeClass } from '../colony/isoMath';

export interface BeltView {
  zoom: number;
  panX: number;
  panY: number;
}

export interface BeltBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/* World bounds: the 0..100 chart plus a margin so edge rocks
   (and their labels/glows) can be panned into view. */
export const BELT_BOUNDS: BeltBounds = { minX: -12, maxX: 112, minY: -12, maxY: 112 };

export const BELT_MIN_ZOOM = 0.4;
export const BELT_MAX_ZOOM = 6;

/** World → screen (CSS px) under the given view. */
export function worldToScreen(
  v: BeltView,
  wx: number,
  wy: number
): { x: number; y: number } {
  return { x: wx * v.zoom + v.panX, y: wy * v.zoom + v.panY };
}

/** Screen (CSS px) → world, inverse of worldToScreen. */
export function screenToWorld(
  v: BeltView,
  sx: number,
  sy: number
): { x: number; y: number } {
  return { x: (sx - v.panX) / v.zoom, y: (sy - v.panY) / v.zoom };
}

/** Zoom-and-centre view that fits the whole belt into w×h. */
export function fitBeltView(w: number, h: number, bounds: BeltBounds = BELT_BOUNDS): BeltView {
  const worldW = bounds.maxX - bounds.minX;
  const worldH = bounds.maxY - bounds.minY;
  const zoom = Math.max(
    BELT_MIN_ZOOM,
    Math.min(BELT_MAX_ZOOM, Math.min(w / worldW, h / worldH))
  );
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  return { zoom, panX: w / 2 - cx * zoom, panY: h / 2 - cy * zoom };
}

/**
 * Keep the belt from being panned fully off-screen: at least a
 * 20%-of-viewport margin of the world bounds stays inside.
 */
export function clampBeltView(
  v: BeltView,
  w: number,
  h: number,
  bounds: BeltBounds = BELT_BOUNDS
): BeltView {
  const margin = Math.min(w, h) * 0.2;
  let { panX, panY } = v;
  const loX = margin - bounds.maxX * v.zoom;
  const hiX = w - margin - bounds.minX * v.zoom;
  const loY = margin - bounds.maxY * v.zoom;
  const hiY = h - margin - bounds.minY * v.zoom;
  panX = loX > hiX ? (loX + hiX) / 2 : Math.min(hiX, Math.max(loX, panX));
  panY = loY > hiY ? (loY + hiY) / 2 : Math.min(hiY, Math.max(loY, panY));
  return { ...v, panX, panY };
}

/**
 * Wheel zoom anchored at screen point (sx, sy): the world point
 * under the cursor stays put. Result is zoom-limited and clamped.
 */
export function zoomBeltAt(
  v: BeltView,
  sx: number,
  sy: number,
  deltaY: number,
  w: number,
  h: number,
  bounds: BeltBounds = BELT_BOUNDS
): BeltView {
  const zoom = Math.max(
    BELT_MIN_ZOOM,
    Math.min(BELT_MAX_ZOOM, v.zoom * (deltaY < 0 ? 1.12 : 1 / 1.12))
  );
  const wx = (sx - v.panX) / v.zoom;
  const wy = (sy - v.panY) / v.zoom;
  return clampBeltView({ zoom, panX: sx - wx * zoom, panY: sy - wy * zoom }, w, h, bounds);
}

/** Nominal rock radius (world units) per size class. */
export function rockRadiusFor(size: SizeClass | undefined): number {
  switch (size) {
    case 'S':
      return 3.2;
    case 'M':
      return 4.4;
    case 'L':
      return 5.8;
    case 'XL':
      return 7.4;
    default:
      return 4.4;
  }
}

export interface BeltRock {
  id: string;
  x: number;
  y: number;
  r: number;
}

/**
 * Nearest rock whose (slightly padded) radius contains the world
 * point, or null. Padding makes small S-class rocks clickable.
 */
export function hitTestRock(wx: number, wy: number, rocks: BeltRock[]): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const rock of rocks) {
    const dx = wx - rock.x;
    const dy = wy - rock.y;
    const dist = Math.hypot(dx, dy);
    const hitR = Math.max(rock.r * 1.2, rock.r + 1.2);
    if (dist <= hitR && dist < bestDist) {
      best = rock.id;
      bestDist = dist;
    }
  }
  return best;
}
