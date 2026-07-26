import { useEffect, useRef, useState } from 'react';
import type { AsteroidState } from '../../sim/types';
import type { MarketState } from '../../sim/market';
import { mulberry32, seedFromId } from '../colony/isoMath';
import { drawRockSprite, drawStarfield, ROCK, ROCK_GREY } from '../../render/rock';
import {
  enginesArmedFor,
  fleetBadgeFor,
  merchantDockFor,
  type SilhouetteSize,
} from './beltBadges';
import {
  BELT_BOUNDS,
  clampBeltView,
  fitBeltView,
  hitTestRock,
  rockRadiusFor,
  screenToWorld,
  worldToScreen,
  zoomBeltAt,
  type BeltView,
} from './beltMath';

/* Fallbacks mirror index.css; resolved live so theme swaps apply. */
const FALLBACK = {
  warn: 'oklch(0.80 0.15 70)',
  crit: 'oklch(0.72 0.18 18)',
  signal: 'oklch(0.78 0.14 200)',
  ally: 'oklch(0.74 0.13 150)',
  fg40: 'oklch(0.48 0.012 240)',
  fg60: 'oklch(0.66 0.012 240)',
};

function cssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** ownerId → glow colour key (null = unclaimed, no tint). */
function ownerColorKey(ownerId: string | null): 'warn' | 'crit' | 'signal' | null {
  if (!ownerId) return null;
  if (ownerId === 'helion') return 'warn';
  if (ownerId === 'mauna') return 'crit';
  return 'signal';
}

interface BeltRockItem {
  a: AsteroidState;
  id: string;
  x: number;
  y: number;
  r: number;
  seed: number;
}

/* Decorative ship lanes (world coords, same endpoints the old
   SVG backdrop used: Arch-I hub at 26,38). */
const ROUTES_HELION: [number, number, number, number][] = [
  [26, 38, 22, 56],
  [26, 38, 34, 32],
  [26, 38, 14, 28],
];
const ROUTE_ALLY: [number, number, number, number] = [26, 38, 60, 48];
const ROUTE_RAM: [number, number, number, number] = [78, 38, 22, 56];

/* ---- mechanics-visibility glyphs (screen space) ---- */

/* Delta/dart ship silhouette, nose along -y before rotation.
   Visual language mirrors assets/ShipGlyph.tsx (SVG variant). */
function drawShipSil(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: SilhouetteSize,
  rot: number,
  color: string
) {
  const k = size === 'L' ? 3.1 : size === 'M' ? 2.5 : 1.9;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -2.2 * k);
  ctx.lineTo(1.1 * k, 1.4 * k);
  ctx.lineTo(0, 0.7 * k);
  ctx.lineTo(-1.1 * k, 1.4 * k);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* Boxy merchant hauler: hull + bridge + cargo ribs + engine flicker. */
function drawHauler(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, pulse: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.92;
  ctx.fillRect(-6, -3, 12, 6);
  ctx.fillRect(-3, -5.5, 5, 2.5);
  ctx.fillRect(-8.5, -2, 2.5, 4);
  ctx.globalAlpha = 0.55;
  ctx.fillRect(-1.5, -3, 1, 6);
  ctx.fillRect(2.5, -3, 1, 6);
  ctx.globalAlpha = 0.35 + 0.45 * pulse;
  ctx.fillRect(-10.2, -1, 1.8, 2);
  ctx.restore();
}

export function BeltCanvas({
  asteroids,
  market,
  selectedId,
  onSelect,
  onJumpToColony,
  onZoomChange,
}: {
  asteroids: AsteroidState[];
  market: MarketState;
  selectedId: string;
  onSelect: (id: string) => void;
  onJumpToColony: (id: string) => void;
  onZoomChange?: (zoom: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0, dpr: 1 });
  const [view, setView] = useState<BeltView>({ zoom: 1, panX: 0, panY: 0 });
  const [dragging, setDragging] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const viewRef = useRef(view);
  const dimsRef = useRef(dims);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number; moved: boolean } | null>(null);
  const fitDoneRef = useRef(false);
  const zoomReportedRef = useRef(0);

  /* Latest props for the rAF draw loop. */
  const propsRef = useRef({ asteroids, market, selectedId, onSelect, onJumpToColony, onZoomChange });
  useEffect(() => {
    propsRef.current = { asteroids, market, selectedId, onSelect, onJumpToColony, onZoomChange };
  }, [asteroids, market, selectedId, onSelect, onJumpToColony, onZoomChange]);

  useEffect(() => {
    viewRef.current = view;
    dimsRef.current = dims;
  }, [view, dims]);

  /* Precompute static rock geometry (positions, radii, seeds). */
  const rocksRef = useRef<BeltRockItem[]>([]);
  useEffect(() => {
    rocksRef.current = asteroids.map((a) => ({
      a,
      id: a.id,
      x: a.x ?? 50,
      y: a.y ?? 50,
      r: rockRadiusFor(a.size),
      seed: seedFromId(a.id),
    }));
  }, [asteroids]);

  /* Size tracking (devicePixelRatio-aware). */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setDims({ w: rect.width, h: rect.height, dpr: window.devicePixelRatio || 1 });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Fit the belt into view on first layout. */
  useEffect(() => {
    if (dims.w < 10 || dims.h < 10 || fitDoneRef.current) return;
    fitDoneRef.current = true;
    setView(fitBeltView(dims.w, dims.h));
  }, [dims]);

  /* Report zoom for the legend readout. */
  useEffect(() => {
    if (view.zoom !== zoomReportedRef.current) {
      zoomReportedRef.current = view.zoom;
      propsRef.current.onZoomChange?.(view.zoom);
    }
  }, [view.zoom]);

  /* Wheel zoom around the cursor (native listener: preventDefault). */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const d = dimsRef.current;
      setView(
        zoomBeltAt(viewRef.current, e.clientX - rect.left, e.clientY - rect.top, e.deltaY, d.w, d.h)
      );
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const eventRock = (e: { clientX: number; clientY: number }): BeltRockItem | null => {
    const el = canvasRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const w = screenToWorld(viewRef.current, e.clientX - rect.left, e.clientY - rect.top);
    const id = hitTestRock(w.x, w.y, rocksRef.current);
    return id ? (rocksRef.current.find((r) => r.id === id) ?? null) : null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, panX: viewRef.current.panX, panY: viewRef.current.panY, moved: false };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (drag) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      if (drag.moved) {
        const d = dimsRef.current;
        setView(clampBeltView({ ...viewRef.current, panX: drag.panX + dx, panY: drag.panY + dy }, d.w, d.h));
        return;
      }
    }
    const rock = eventRock(e);
    const id = rock ? rock.a.id : null;
    if (id !== hoverId) setHoverId(id);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (drag && !drag.moved) {
      const rock = eventRock(e);
      if (rock) propsRef.current.onSelect(rock.a.id);
    }
  };

  const onPointerLeave = () => {
    dragRef.current = null;
    setDragging(false);
    setHoverId(null);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const rock = eventRock(e);
    if (rock && rock.a.ownerId === 'helion') propsRef.current.onJumpToColony(rock.a.id);
  };

  /* ---- render loop (dash crawl + pulses animate continuously) -- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // jsdom: no canvas backend

    let raf = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const { w, h, dpr } = dimsRef.current;
      if (w < 10 || h < 10) return;
      const v = viewRef.current;
      const { selectedId: selId, market } = propsRef.current;
      const rocks = rocksRef.current;
      /* Merchant dock: real market state only; null while inactive. */
      const dock = merchantDockFor(
        rocks.map((r) => r.a),
        market
      );

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      const colors = {
        warn: cssVar('--warn', FALLBACK.warn),
        crit: cssVar('--crit', FALLBACK.crit),
        signal: cssVar('--signal', FALLBACK.signal),
        ally: cssVar('--ally', FALLBACK.ally),
        fg40: cssVar('--fg-40', FALLBACK.fg40),
        fg60: cssVar('--fg-60', FALLBACK.fg60),
      };

      const t = now / 1000;
      const pulseSlow = 0.55 + 0.45 * Math.sin(t * ((Math.PI * 2) / 1.6)); // matches CSS pulse 1.6s
      const pulseFast = 0.45 + 0.55 * Math.sin(t * ((Math.PI * 2) / 0.8)); // threat dot 0.8s

      /* Space backdrop */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h) * 0.7);
      bg.addColorStop(0, '#11151f');
      bg.addColorStop(1, '#05070c');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      /* Far star layer: screen-space, parallax against pan. */
      const tile = 340;
      const ox = ((v.panX * 0.22) % tile + tile) % tile;
      const oy = ((v.panY * 0.22) % tile + tile) % tile;
      for (let gx = -1; gx * tile < w + tile; gx++) {
        for (let gy = -1; gy * tile < h + tile; gy++) {
          const rand = mulberry32(0x5eed5eed + gx * 73856093 + gy * 19349663);
          for (let i = 0; i < 26; i++) {
            const sx = gx * tile + ox + rand() * tile - tile;
            const sy = gy * tile + oy + rand() * tile - tile;
            const a = 0.15 + rand() * 0.4;
            ctx.fillStyle = `rgba(200, 214, 238, ${a})`;
            ctx.fillRect(sx, sy, 0.8, 0.8);
          }
        }
      }

      /* World transform */
      ctx.setTransform(dpr * v.zoom, 0, 0, dpr * v.zoom, dpr * v.panX, dpr * v.panY);
      ctx.lineJoin = 'round';

      /* Chart grid (replaces the old SVG backdrop) */
      ctx.lineWidth = 0.12;
      ctx.strokeStyle = 'oklch(0.28 0.014 240)';
      ctx.beginPath();
      for (let g = 0; g <= 100; g += 10) {
        ctx.moveTo(g, 0);
        ctx.lineTo(g, 100);
        ctx.moveTo(0, g);
        ctx.lineTo(100, g);
      }
      ctx.stroke();
      ctx.lineWidth = 0.2;
      ctx.strokeStyle = 'oklch(0.34 0.018 240)';
      ctx.strokeRect(0, 0, 100, 100);
      ctx.font = '2.4px "JetBrains Mono", monospace';
      ctx.fillStyle = 'oklch(0.40 0.012 240)';
      ctx.textAlign = 'left';
      ctx.fillText('α', 2, 4);
      ctx.fillText('β', 48, 4);
      ctx.fillText('γ', 94, 4);

      /* Near star layer: world-space, moves 1:1 with pan/zoom. */
      drawStarfield(
        ctx,
        mulberry32(seedFromId('sector-7-delta')),
        BELT_BOUNDS.minX,
        BELT_BOUNDS.minY,
        BELT_BOUNDS.maxX,
        BELT_BOUNDS.maxY,
        240
      );

      /* Ship lanes: dashed trajectories with a slow crawl. */
      const crawl = (t * 1.6) % 100;
      const lane = (x1: number, y1: number, x2: number, y2: number, color: string, lw: number, dash: number[], opacity: number) => {
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = lw;
        ctx.setLineDash(dash);
        ctx.lineDashOffset = -crawl;
        ctx.stroke();
        ctx.restore();
      };
      for (const [x1, y1, x2, y2] of ROUTES_HELION) lane(x1, y1, x2, y2, colors.warn, 0.22, [0.9, 0.9], 0.45);
      lane(...ROUTE_ALLY, colors.ally, 0.22, [0.9, 0.9], 0.6);
      lane(...ROUTE_RAM, colors.crit, 0.34, [1.6, 0.8], 0.9);

      /* Ownership glow under each rock. */
      for (const rock of rocks) {
        const key = ownerColorKey(rock.a.ownerId);
        if (!key) continue;
        const glowR = rock.r * 2.1;
        const glow = ctx.createRadialGradient(rock.x, rock.y, rock.r * 0.5, rock.x, rock.y, glowR);
        glow.addColorStop(0, colors[key]);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.save();
        ctx.globalAlpha = 0.30;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(rock.x, rock.y, glowR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      /* Rocks. */
      for (const rock of rocks) {
        const unclaimed = !rock.a.ownerId;
        drawRockSprite(ctx, rock.seed, rock.x, rock.y, rock.r, unclaimed ? ROCK_GREY : ROCK);
        if (unclaimed) {
          ctx.beginPath();
          ctx.arc(rock.x, rock.y, rock.r * 1.12, 0, Math.PI * 2);
          ctx.strokeStyle = colors.fg40;
          ctx.lineWidth = 0.18;
          ctx.setLineDash([1.1, 1.1]);
          ctx.save();
          ctx.globalAlpha = 0.6;
          ctx.stroke();
          ctx.restore();
          ctx.setLineDash([]);
        }
      }

      /* Screen-space overlays: selection ring, threat dots, labels, ram tag. */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const rock of rocks) {
        const s = worldToScreen(v, rock.x, rock.y);
        if (s.x < -80 || s.x > w + 80 || s.y < -80 || s.y > h + 80) continue;
        const sr = rock.r * v.zoom;
        const selected = rock.a.id === selId;

        if (selected) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, sr + 7, 0, Math.PI * 2);
          ctx.strokeStyle = colors.warn;
          ctx.lineWidth = 1;
          ctx.save();
          ctx.globalAlpha = pulseSlow;
          ctx.stroke();
          ctx.restore();
        }

        if (rock.a.threat && rock.a.threat !== 'none') {
          const bx = s.x + sr * 0.72;
          const by = s.y - sr * 0.72;
          ctx.save();
          ctx.globalAlpha = pulseFast;
          ctx.beginPath();
          ctx.arc(bx, by, 4, 0, Math.PI * 2);
          ctx.fillStyle = colors.crit;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
          ctx.strokeStyle = colors.crit;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.restore();
        }

        /* Engines-armed badge (built, non-constructing engines only). */
        if (enginesArmedFor(rock.a) > 0) {
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(5, 7, 12, 0.9)';
          ctx.shadowBlur = 3;
          ctx.fillStyle = colors.warn;
          ctx.fillText('◀◀', s.x - sr * 0.72 - 5, s.y - sr * 0.72 + 3);
          ctx.shadowBlur = 0;
        }

        /* Fleet presence: silhouettes on a tight arc above the rock
           plus an owner-tinted hull-count chip. */
        const badge = fleetBadgeFor(rock.a);
        if (badge) {
          const col = colors[badge.tone];
          const ox = s.x;
          const oy = s.y - sr - 20;
          const orbitR = Math.min(15, sr + 7);
          /* Seeded patrol drift — pure oscillation, no state. */
          const phase = mulberry32(seedFromId(`${rock.id}:fleet`))() * Math.PI * 2;
          const drift = badge.patrolling ? Math.sin(t * 0.7 + phase) * 0.5 : 0;
          const nSil = badge.silhouettes.length;
          badge.silhouettes.forEach((sz, i) => {
            const ang = -Math.PI / 2 + (i - (nSil - 1) / 2) * 0.62 + drift;
            drawShipSil(
              ctx,
              ox + Math.cos(ang) * orbitR,
              oy + Math.sin(ang) * orbitR * 0.45,
              sz,
              ang + Math.PI / 2,
              col
            );
          });
          const chip = `⬡ ${badge.hulls}`;
          const chipY = oy - orbitR * 0.45 - 7;
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(5, 7, 12, 0.9)';
          ctx.shadowBlur = 3;
          ctx.fillStyle = col;
          ctx.fillText(chip, ox, chipY);
          ctx.shadowBlur = 0;
          if (badge.attacking) {
            const cw = ctx.measureText(chip).width + 4;
            ctx.save();
            ctx.globalAlpha = pulseFast;
            ctx.strokeStyle = colors.crit;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(ox - cw / 2, chipY + 3.5);
            ctx.lineTo(ox + cw / 2, chipY + 3.5);
            ctx.stroke();
            ctx.restore();
          }
        }

        /* Merchant hauler docked at the home rock (real market state). */
        if (dock && dock.asteroidId === rock.id) {
          const hx = s.x - sr - 14;
          const hy = s.y - sr - 14;
          ctx.save();
          ctx.globalAlpha = 0.5;
          ctx.strokeStyle = colors.ally;
          ctx.lineWidth = 0.6;
          ctx.setLineDash([1.5, 1.5]);
          ctx.beginPath();
          ctx.moveTo(s.x - sr * 0.72, s.y - sr * 0.72);
          ctx.lineTo(hx + 5, hy + 2);
          ctx.stroke();
          ctx.restore();
          drawHauler(ctx, hx, hy, colors.ally, pulseSlow);
          const tag =
            dock.stockCount > 0 ? `MERCHANT DOCKED · ${dock.stockCount} LOTS` : 'MERCHANT DOCKED';
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(5, 7, 12, 0.9)';
          ctx.shadowBlur = 3;
          ctx.fillStyle = colors.ally;
          ctx.fillText(tag, hx, hy - 12);
          ctx.shadowBlur = 0;
        }

        /* Name + size class under the rock. */
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(5, 7, 12, 0.9)';
        ctx.shadowBlur = 3;
        const label = (rock.a.name ?? rock.a.id).toUpperCase();
        const sizeTag = rock.a.size ?? 'M';
        const ly = s.y + sr + 13;
        ctx.fillStyle = selected ? colors.warn : colors.fg60;
        const nameW = ctx.measureText(label).width;
        ctx.fillText(label, s.x - ctx.measureText(` ${sizeTag}`).width / 2, ly);
        ctx.fillStyle = colors.fg40;
        ctx.fillText(` ${sizeTag}`, s.x + nameW / 2, ly);
        ctx.shadowBlur = 0;
      }

      /* Ram trajectory tag. */
      const tagPos = worldToScreen(v, 50, 46);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.globalAlpha = 0.75 + 0.25 * pulseFast;
      ctx.fillStyle = colors.crit;
      ctx.shadowColor = 'rgba(5, 7, 12, 0.9)';
      ctx.shadowBlur = 3;
      ctx.fillText('⚠ TRAJ: GALLOW → FORGE-3 · ETA 42d', tagPos.x, tagPos.y);
      ctx.restore();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const cursor = dragging ? 'grabbing' : hoverId ? 'pointer' : 'grab';

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor, touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onDoubleClick={onDoubleClick}
      />
    </div>
  );
}
