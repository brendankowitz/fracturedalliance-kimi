/* ============================================================
   rock — shared canvas rendering for asteroid bodies and
   starfields. Used by the colony iso surface and the sector
   belt map so both views read as the same world.
   Pure drawing helpers, no React deps.
   ============================================================ */

import { mulberry32, seedFromId } from '../screens/colony/isoMath';

export interface RockPalette {
  light: string;
  mid: string;
  dark: string;
  rim: string;
  crater: string;
  craterLit: string;
}

/* Rock palette — tan/grey 1996-style asteroid. */
export const ROCK: RockPalette = {
  light: '#96855f',
  mid: '#7b6d4f',
  dark: '#4c4332',
  rim: '#2c2718',
  crater: 'rgba(28, 24, 15, 0.55)',
  craterLit: 'rgba(216, 196, 152, 0.22)',
};

/* Desaturated variant for unclaimed bodies on the belt map. */
export const ROCK_GREY: RockPalette = {
  light: '#8d8d88',
  mid: '#71716c',
  dark: '#494945',
  rim: '#2b2b28',
  crater: 'rgba(18, 18, 16, 0.55)',
  craterLit: 'rgba(210, 210, 200, 0.20)',
};

export interface Rect {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Smoothed radial noise multipliers for the lumpy silhouette.
 * Consumes exactly `steps` values from rand.
 */
export function rockNoise(rand: () => number, steps = 48): number[] {
  const noise: number[] = [];
  for (let i = 0; i < steps; i++) noise.push(0.84 + rand() * 0.3);
  for (let i = 0; i < steps; i++) {
    noise[i] = (noise[i] + noise[(i + 1) % steps] + noise[(i + steps - 1) % steps]) / 3;
  }
  return noise;
}

/** Lumpy silhouette: noisy radial blob, lightly smoothed. */
export function rockBlobPath(
  rand: () => number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): Path2D {
  const steps = 48;
  const noise = rockNoise(rand, steps);
  const pts: number[][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const k = noise[i % steps];
    pts.push([cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k]);
  }
  const blob = new Path2D();
  blob.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) blob.lineTo(pts[i][0], pts[i][1]);
  blob.closePath();
  return blob;
}

/** Base rock gradient fill + rim stroke. */
export function fillRockBase(
  ctx: CanvasRenderingContext2D,
  blob: Path2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  palette: RockPalette = ROCK
) {
  const grad = ctx.createLinearGradient(cx - rx * 0.4, cy - ry, cx + rx * 0.5, cy + ry);
  grad.addColorStop(0, palette.light);
  grad.addColorStop(0.55, palette.mid);
  grad.addColorStop(1, palette.dark);
  ctx.fillStyle = grad;
  ctx.fill(blob);
  ctx.strokeStyle = palette.rim;
  ctx.lineWidth = 2;
  ctx.stroke(blob);
}

export interface ShadeOpts {
  /* craters = craterBase + floor(rand() * 5) */
  craterBase: number;
  craterMin: number;
  craterVar: number;
  speckle: number;
  speckleSize: number;
  clipBounds: Rect;
  palette: RockPalette;
}

/**
 * Lighting + craters + speckle, clipped to the blob. Call after
 * fillRockBase; consumes rand in a fixed order (count → per-crater
 * px/py/r → per-speckle px/py/shade).
 */
export function shadeRock(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  blob: Path2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  opts: ShadeOpts
) {
  const { palette, clipBounds } = opts;
  ctx.save();
  ctx.clip(blob);

  /* Top-left light / bottom-right shade */
  const light = ctx.createRadialGradient(cx - rx * 0.45, cy - ry * 0.55, 10, cx, cy, rx * 1.4);
  light.addColorStop(0, 'rgba(255, 238, 200, 0.14)');
  light.addColorStop(0.6, 'rgba(0, 0, 0, 0)');
  light.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
  ctx.fillStyle = light;
  ctx.fillRect(
    clipBounds.minX,
    clipBounds.minY,
    clipBounds.maxX - clipBounds.minX,
    clipBounds.maxY - clipBounds.minY
  );

  /* Craters */
  const craters = opts.craterBase + Math.floor(rand() * 5);
  for (let i = 0; i < craters; i++) {
    const px = cx + (rand() * 2 - 1) * rx * 0.78;
    const py = cy + (rand() * 2 - 1) * ry * 0.72;
    const inside = ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 < 0.8;
    if (!inside) continue;
    const r = opts.craterMin + rand() * opts.craterVar;
    ctx.beginPath();
    ctx.ellipse(px, py, r, r * 0.48, 0, 0, Math.PI * 2);
    ctx.fillStyle = palette.crater;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px, py, r, r * 0.48, 0, Math.PI * 1.05, Math.PI * 1.75);
    ctx.strokeStyle = palette.craterLit;
    ctx.lineWidth = 1.1;
    ctx.stroke();
  }

  /* Speckle */
  for (let i = 0; i < opts.speckle; i++) {
    const px = cx + (rand() * 2 - 1) * rx * 0.9;
    const py = cy + (rand() * 2 - 1) * ry * 0.85;
    ctx.fillStyle = rand() < 0.5 ? 'rgba(0,0,0,0.10)' : 'rgba(255,240,210,0.08)';
    ctx.fillRect(px, py, opts.speckleSize, opts.speckleSize);
  }
  ctx.restore();
}

/**
 * The colony-surface rock (iso footprint for an N×N grid).
 * Seeded by asteroid id — identical output to the original
 * IsoSurface inline implementation.
 */
export function drawRock(
  ctx: CanvasRenderingContext2D,
  asteroidId: string,
  n: number,
  bounds: Rect
) {
  const rand = mulberry32(seedFromId(asteroidId));
  const cx = 0;
  const cy = n * 16;
  const rx = n * 32 + 34;
  const ry = n * 16 + 30;

  const blob = rockBlobPath(rand, cx, cy, rx, ry);
  fillRockBase(ctx, blob, cx, cy, rx, ry);
  shadeRock(ctx, rand, blob, cx, cy, rx, ry, {
    craterBase: 7 + n,
    craterMin: 3.5,
    craterVar: 9,
    speckle: 90,
    speckleSize: 1.1,
    clipBounds: bounds,
    palette: ROCK,
  });
}

/**
 * Freestanding rock sprite for the belt map: roughly spherical
 * blob centred on (cx, cy) with nominal radius r (world units),
 * seeded directly (pass seedFromId(asteroidId)).
 */
export function drawRockSprite(
  ctx: CanvasRenderingContext2D,
  seed: number,
  cx: number,
  cy: number,
  r: number,
  palette: RockPalette = ROCK
) {
  const rand = mulberry32(seed);
  const rx = r;
  const ry = r * 0.86;

  const blob = rockBlobPath(rand, cx, cy, rx, ry);

  /* Base gradient (thinner rim line for small sprites). */
  const grad = ctx.createLinearGradient(cx - rx * 0.4, cy - ry, cx + rx * 0.5, cy + ry);
  grad.addColorStop(0, palette.light);
  grad.addColorStop(0.55, palette.mid);
  grad.addColorStop(1, palette.dark);
  ctx.fillStyle = grad;
  ctx.fill(blob);
  ctx.strokeStyle = palette.rim;
  ctx.lineWidth = Math.max(0.4, r * 0.09);
  ctx.stroke(blob);

  shadeRock(ctx, rand, blob, cx, cy, rx, ry, {
    craterBase: 2 + Math.round(r * 0.7),
    craterMin: Math.max(0.35, r * 0.1),
    craterVar: r * 0.32,
    speckle: Math.max(24, Math.min(90, Math.round(r * 12))),
    speckleSize: Math.max(0.18, r * 0.045),
    clipBounds: { minX: cx - rx * 1.3, maxX: cx + rx * 1.3, minY: cy - ry * 1.3, maxY: cy + ry * 1.3 },
    palette,
  });
}

/**
 * Seeded starfield filling [minX..maxX] × [minY..maxY] in the
 * caller's current transform space.
 */
export function drawStarfield(
  ctx: CanvasRenderingContext2D,
  rand: () => number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  count: number
) {
  for (let i = 0; i < count; i++) {
    const sx = minX + rand() * (maxX - minX);
    const sy = minY + rand() * (maxY - minY);
    const a = 0.25 + rand() * 0.65;
    const s = rand() < 0.12 ? 1.6 : 0.9;
    ctx.fillStyle = `rgba(214, 226, 245, ${a})`;
    ctx.fillRect(sx, sy, s, s);
  }
}
