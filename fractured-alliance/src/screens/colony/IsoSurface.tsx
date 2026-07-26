import { useEffect, useRef, useState } from 'react';
import { BUILDINGS } from '../../data/gameData';
import type { BuildingDef } from '../../types';
import {
  project,
  cellCenter,
  hitTest,
  isBuildable,
  mulberry32,
  seedFromId,
} from './isoMath';
import { drawRock, drawStarfield } from '../../render/rock';

export interface PlacedCell {
  kind: string;
  damaged?: boolean;
  constructing?: boolean;
  progress?: number;
}

interface View {
  zoom: number;
  panX: number;
  panY: number;
}

/* Building palette — mirrors assets/BuildingTile.tsx tones. */
const T = {
  top: '#3f4858',
  topLit: '#4f5867',
  sideR: '#1c212c',
  sideL: '#2a3140',
  edge: '#0c0f17',
  pad: '#161b25',
  glass: 'rgba(80, 156, 102, 0.45)',
  glassD: 'rgba(54, 122, 80, 0.5)',
  glow: '#e8a04a',
  glowDim: '#a87530',
  water: '#5c9bb8',
  crit: '#dc5050',
  signal: '#5fa8d3',
};

/* Rock palette + rock/starfield drawing live in render/rock.ts
   (shared with the sector belt map). */

export function IsoSurface({
  asteroidId,
  gridSize,
  placed,
  selected,
  hoverCell,
  inspectedCell,
  onHoverCell,
  onCellClick,
}: {
  asteroidId: string;
  gridSize: number;
  placed: Record<string, PlacedCell>;
  selected: BuildingDef | null;
  hoverCell: string | null;
  inspectedCell: string | null;
  onHoverCell: (key: string | null) => void;
  onCellClick: (key: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 0, h: 0, dpr: 1 });
  const [view, setView] = useState<View>({ zoom: 1, panX: 0, panY: 0 });
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState(false);

  const viewRef = useRef(view);
  const dimsRef = useRef(dims);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number; moved: boolean } | null>(null);
  const fitKeyRef = useRef('');

  useEffect(() => {
    viewRef.current = view;
    dimsRef.current = dims;
  }, [view, dims]);

  const n = gridSize;
  // World-space bounds of the rock (grid footprint + margin).
  const bounds = {
    minX: -n * 32 - 70,
    maxX: n * 32 + 70,
    minY: -64,
    maxY: 2 * n * 16 + 70,
  };

  const hasDamaged = Object.values(placed).some((c) => c.damaged);

  /* Distress flicker: cheap phase toggle only while damage exists. */
  useEffect(() => {
    if (!hasDamaged) return;
    const id = setInterval(() => setPhase((p) => !p), 550);
    return () => clearInterval(id);
  }, [hasDamaged]);

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

  /* Fit the rock into view on first layout / asteroid change. */
  useEffect(() => {
    const key = `${asteroidId}:${n}`;
    if (dims.w < 10 || dims.h < 10 || fitKeyRef.current === key) return;
    fitKeyRef.current = key;
    const worldW = bounds.maxX - bounds.minX;
    const worldH = bounds.maxY - bounds.minY;
    const zoom = Math.max(0.4, Math.min(1.6, Math.min(dims.w / worldW, dims.h / worldH)));
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    setView({ zoom, panX: dims.w / 2 - cx * zoom, panY: dims.h / 2 - cy * zoom });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dims, asteroidId, n]);

  const clampView = (v: View, w: number, h: number): View => {
    const margin = Math.min(w, h) * 0.2;
    let { panX, panY } = v;
    const loX = margin - bounds.maxX * v.zoom;
    const hiX = w - margin - bounds.minX * v.zoom;
    const loY = margin - bounds.maxY * v.zoom;
    const hiY = h - margin - bounds.minY * v.zoom;
    panX = loX > hiX ? (loX + hiX) / 2 : Math.min(hiX, Math.max(loX, panX));
    panY = loY > hiY ? (loY + hiY) / 2 : Math.min(hiY, Math.max(loY, panY));
    return { ...v, panX, panY };
  };

  /* Wheel zoom around the cursor (native listener: preventDefault). */
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const v = viewRef.current;
      const d = dimsRef.current;
      const zoom = Math.max(0.4, Math.min(2.5, v.zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
      const wx = (sx - v.panX) / v.zoom;
      const wy = (sy - v.panY) / v.zoom;
      setView(clampView({ zoom, panX: sx - wx * zoom, panY: sy - wy * zoom }, d.w, d.h));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const eventCell = (e: React.PointerEvent): string | null => {
    const el = canvasRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const v = viewRef.current;
    const wx = (e.clientX - rect.left - v.panX) / v.zoom;
    const wy = (e.clientY - rect.top - v.panY) / v.zoom;
    const g = hitTest(wx, wy, n);
    return g ? `${g.x},${g.y}` : null;
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
        setView(clampView({ ...viewRef.current, panX: drag.panX + dx, panY: drag.panY + dy }, d.w, d.h));
        return;
      }
    }
    const key = eventCell(e);
    if (key !== hoverCell) onHoverCell(key);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (drag && !drag.moved) {
      const key = eventCell(e);
      if (key) onCellClick(key);
    }
  };

  const onPointerLeave = () => {
    dragRef.current = null;
    setDragging(false);
    onHoverCell(null);
  };

  /* ---- render -------------------------------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w < 10 || dims.h < 10) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // jsdom: no canvas backend

    const { w, h, dpr } = dims;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* Space backdrop */
    const bg = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h) * 0.7);
    bg.addColorStop(0, '#11151f');
    bg.addColorStop(1, '#05070c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    /* World transform */
    ctx.setTransform(dpr * view.zoom, 0, 0, dpr * view.zoom, dpr * view.panX, dpr * view.panY);
    ctx.lineJoin = 'round';

    /* Starfield (seeded, world space) */
    const starRand = mulberry32(seedFromId(asteroidId) ^ 0x9e3779b9);
    drawStarfield(
      ctx,
      starRand,
      bounds.minX - 120,
      bounds.minY - 120,
      bounds.maxX + 120,
      bounds.maxY + 120,
      170
    );

    drawRock(ctx, asteroidId, n, bounds);
    drawGrid(ctx, n, placed, hoverCell, inspectedCell);
    drawCells(ctx, n, placed, hoverCell, inspectedCell, selected, phase);
  });

  /* Cursor feedback */
  const hoverPlaced = hoverCell ? placed[hoverCell] : undefined;
  const hoverBuildable = (() => {
    if (!hoverCell) return false;
    const [gx, gy] = hoverCell.split(',').map(Number);
    return isBuildable(gx, gy, n);
  })();
  const cursor = dragging
    ? 'grabbing'
    : hoverPlaced
      ? 'pointer'
      : hoverCell && hoverBuildable && selected
        ? 'crosshair'
        : hoverCell && !hoverBuildable
          ? 'not-allowed'
          : 'grab';

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor, touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      />
    </div>
  );
}

/* ============================================================
   Grid diamonds + hover/inspect overlays
   ============================================================ */
function diamondPath(ctx: CanvasRenderingContext2D, gx: number, gy: number) {
  const top = project(gx, gy);
  const right = project(gx + 1, gy);
  const bottom = project(gx + 1, gy + 1);
  const left = project(gx, gy + 1);
  ctx.beginPath();
  ctx.moveTo(top.x, top.y);
  ctx.lineTo(right.x, right.y);
  ctx.lineTo(bottom.x, bottom.y);
  ctx.lineTo(left.x, left.y);
  ctx.closePath();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  n: number,
  placed: Record<string, PlacedCell>,
  hoverCell: string | null,
  inspectedCell: string | null
) {
  for (let gx = 0; gx < n; gx++) {
    for (let gy = 0; gy < n; gy++) {
      if (!isBuildable(gx, gy, n)) continue;
      const key = `${gx},${gy}`;
      diamondPath(ctx, gx, gy);
      ctx.fillStyle = placed[key] ? 'rgba(0, 0, 0, 0.10)' : 'rgba(255, 255, 255, 0.035)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(20, 18, 12, 0.38)';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      if (key === hoverCell) {
        diamondPath(ctx, gx, gy);
        if (placed[key]) {
          ctx.strokeStyle = T.signal;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(232, 160, 74, 0.28)';
          ctx.fill();
          ctx.strokeStyle = T.glow;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      }
      if (key === inspectedCell) {
        diamondPath(ctx, gx, gy);
        ctx.strokeStyle = T.signal;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
}

/* ============================================================
   Canvas building sprites — silhouette-first, mirrors the
   generated-glyph language of assets/BuildingTile.tsx.
   (cx, cy) is the front-bottom anchor point of the cell pad.
   ============================================================ */
function poly(ctx: CanvasRenderingContext2D, pts: number[][], fill: string, stroke = T.edge, lw = 0.4) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.stroke();
}

function seg(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stroke: string,
  lw = 0.8,
  dash?: number[]
) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  if (dash) ctx.setLineDash(dash);
  ctx.stroke();
  if (dash) ctx.setLineDash([]);
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function isoPad(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, d: number) {
  poly(
    ctx,
    [
      [cx, cy],
      [cx + w, cy - w / 2],
      [cx + w - d, cy - w / 2 - d / 2],
      [cx - d, cy - d / 2],
    ],
    T.pad
  );
}

function isoBox(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  d: number,
  h: number,
  top = T.top
) {
  poly(ctx, [[cx, cy], [cx - d, cy - d / 2], [cx - d, cy - d / 2 - h], [cx, cy - h]], T.sideL);
  poly(ctx, [[cx, cy], [cx + w, cy - w / 2], [cx + w, cy - w / 2 - h], [cx, cy - h]], T.sideR);
  poly(
    ctx,
    [
      [cx, cy - h],
      [cx + w, cy - w / 2 - h],
      [cx + w - d, cy - w / 2 - d / 2 - h],
      [cx - d, cy - d / 2 - h],
    ],
    top
  );
}

function dome(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, fill = T.topLit) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.62, 0, Math.PI, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = T.edge;
  ctx.lineWidth = 0.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.5, 0, 0, Math.PI);
  ctx.strokeStyle = T.edge;
  ctx.stroke();
}

function tank(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, h: number) {
  ctx.fillStyle = T.sideL;
  ctx.fillRect(cx - r, cy - h, r * 2, h);
  seg(ctx, cx - r, cy - h, cx - r, cy, T.edge, 0.4);
  seg(ctx, cx + r, cy - h, cx + r, cy, T.edge, 0.4);
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.42, 0, 0, Math.PI * 2);
  ctx.fillStyle = T.sideR;
  ctx.fill();
  ctx.strokeStyle = T.edge;
  ctx.lineWidth = 0.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy - h, r, r * 0.42, 0, 0, Math.PI * 2);
  ctx.fillStyle = T.topLit;
  ctx.fill();
  ctx.stroke();
}

function drawBuilding(ctx: CanvasRenderingContext2D, kind: string, cx: number, cy: number) {
  switch (kind) {
    case 'cpu': {
      isoPad(ctx, cx, cy, 20, 20);
      isoBox(ctx, cx, cy, 9, 9, 13);
      isoBox(ctx, cx, cy - 13, 5, 5, 7, T.topLit);
      seg(ctx, cx, cy - 20, cx, cy - 26, T.glowDim, 0.7);
      dot(ctx, cx, cy - 27, 1.2, T.glow);
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i % 2 ? T.glowDim : T.glow;
        ctx.fillRect(cx - 6, cy - 4 - i * 3.4, 1.6, 1.2);
      }
      break;
    }
    case 'air': {
      isoPad(ctx, cx, cy, 20, 20);
      isoBox(ctx, cx, cy, 11, 11, 9);
      ctx.beginPath();
      ctx.arc(cx - 5.5, cy - 6.5, 2.6, 0, Math.PI * 2);
      ctx.strokeStyle = T.glow;
      ctx.lineWidth = 0.6;
      ctx.stroke();
      seg(ctx, cx - 7.6, cy - 6.5, cx - 3.4, cy - 6.5, T.glowDim, 0.5);
      seg(ctx, cx - 5.5, cy - 8.6, cx - 5.5, cy - 4.4, T.glowDim, 0.5);
      break;
    }
    case 'hydration': {
      isoPad(ctx, cx, cy, 20, 20);
      tank(ctx, cx, cy, 8, 12);
      ctx.beginPath();
      ctx.ellipse(cx, cy - 12, 5, 2.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(54, 96, 116, 0.6)';
      ctx.fill();
      seg(ctx, cx - 8, cy - 6, cx + 8, cy - 6, T.water, 0.5);
      break;
    }
    case 'hydroponics': {
      isoPad(ctx, cx, cy, 22, 20);
      isoBox(ctx, cx, cy, 13, 11, 3);
      poly(ctx, [[cx - 12, cy - 8], [cx + 2, cy - 15], [cx + 12, cy - 10], [cx - 2, cy - 3]], T.glass);
      poly(ctx, [[cx - 12, cy - 8], [cx - 2, cy - 3], [cx + 12, cy - 10], [cx + 2, cy - 15]], T.glassD);
      dot(ctx, cx - 6, cy - 7, 0.7, '#79c188');
      dot(ctx, cx + 1, cy - 10, 0.7, '#79c188');
      break;
    }
    case 'living': {
      isoPad(ctx, cx, cy, 21, 21);
      dome(ctx, cx - 6, cy - 4, 5);
      dome(ctx, cx + 3, cy - 7, 6);
      dome(ctx, cx + 7, cy - 2, 4);
      dot(ctx, cx - 6, cy - 5.5, 0.7, T.glow);
      dot(ctx, cx + 3, cy - 9, 0.7, T.glow);
      break;
    }
    case 'resiblock': {
      isoPad(ctx, cx, cy, 19, 19);
      isoBox(ctx, cx, cy, 9, 9, 22);
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 2; col++) {
          ctx.fillStyle = (row + col) % 2 ? T.glowDim : T.glow;
          ctx.fillRect(cx - 7 + col * 3.4, cy - 5 - row * 4.4 - col * 1.7, 1.4, 2);
        }
      }
      break;
    }
    case 'pleasure': {
      isoPad(ctx, cx, cy, 24, 24);
      dome(ctx, cx, cy - 4, 12);
      seg(ctx, cx, cy - 16, cx - 8, cy - 6, T.edge, 0.4);
      seg(ctx, cx, cy - 16, cx + 8, cy - 6, T.edge, 0.4);
      seg(ctx, cx, cy - 16, cx, cy - 4, T.edge, 0.4);
      dot(ctx, cx, cy - 11, 1.8, T.glow);
      break;
    }
    case 'medical': {
      isoPad(ctx, cx, cy, 19, 19);
      isoBox(ctx, cx, cy, 9, 9, 9, T.topLit);
      ctx.fillStyle = T.glow;
      ctx.fillRect(cx - 0.9, cy - 14.5, 1.8, 5);
      ctx.fillRect(cx - 2.5, cy - 12.9, 5, 1.8);
      dot(ctx, cx - 5.5, cy - 3.5, 0.7, T.glow);
      break;
    }
    case 'security': {
      isoPad(ctx, cx, cy, 20, 20);
      isoBox(ctx, cx, cy, 10, 10, 5);
      isoBox(ctx, cx - 2, cy - 6, 3, 3, 6, T.topLit);
      dot(ctx, cx - 2, cy - 13, 1, T.glow);
      seg(ctx, cx - 2, cy - 13, cx + 5, cy - 16, T.glow, 0.5);
      break;
    }
    case 'radfilter': {
      isoPad(ctx, cx, cy, 20, 20);
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy);
      ctx.quadraticCurveTo(cx - 8, cy - 8, cx - 6, cy - 16);
      ctx.lineTo(cx + 6, cy - 16);
      ctx.quadraticCurveTo(cx + 8, cy - 8, cx + 6, cy);
      ctx.closePath();
      ctx.fillStyle = T.sideL;
      ctx.fill();
      ctx.strokeStyle = T.edge;
      ctx.lineWidth = 0.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy - 16, 6, 2.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = T.edge;
      ctx.fill();
      ctx.strokeStyle = T.glowDim;
      ctx.stroke();
      break;
    }
    case 'mine1':
    case 'mine2': {
      isoPad(ctx, cx, cy, 20, 20);
      isoBox(ctx, cx, cy, 10, 10, 2);
      poly(ctx, [[cx - 2, cy - 4], [cx + 4, cy - 7], [cx + 4, cy - 5], [cx - 2, cy - 2]], T.edge, T.glowDim);
      seg(ctx, cx - 4, cy - 3, cx - 1, cy - 11, T.sideL, 0.9);
      seg(ctx, cx + 3, cy - 6.5, cx - 1, cy - 11, T.sideL, 0.9);
      seg(ctx, cx - 1, cy - 11, cx + 6, cy - 7.5, T.sideR, 0.9);
      dot(ctx, cx - 1, cy - 11, 1.1, T.glow);
      if (kind === 'mine2') {
        seg(ctx, cx + 5, cy - 2.5, cx + 1, cy - 9.5, T.sideL, 0.9);
        dot(ctx, cx + 1, cy - 9.5, 1.1, T.glow);
        seg(ctx, cx + 6, cy - 3, cx + 12, cy, T.glowDim, 0.5, [1, 1]);
      }
      break;
    }
    case 'deep': {
      isoPad(ctx, cx, cy, 19, 19);
      isoBox(ctx, cx, cy, 9, 9, 3);
      seg(ctx, cx - 4, cy - 3, cx, cy - 26, T.sideL, 0.9);
      seg(ctx, cx + 4, cy - 4, cx, cy - 26, T.sideL, 0.9);
      seg(ctx, cx - 2, cy - 3.5, cx, cy - 26, T.sideL, 0.7);
      seg(ctx, cx - 3, cy - 10, cx + 2.6, cy - 11, T.sideL, 0.5);
      seg(ctx, cx - 2, cy - 17, cx + 1.4, cy - 17.6, T.sideL, 0.5);
      dot(ctx, cx, cy - 26, 1.1, T.glow);
      ctx.beginPath();
      ctx.ellipse(cx, cy - 3, 2, 1, 0, 0, Math.PI * 2);
      ctx.fillStyle = T.edge;
      ctx.fill();
      break;
    }
    case 'seismic': {
      isoPad(ctx, cx, cy, 24, 24);
      poly(ctx, [[cx, cy - 14], [cx + 8, cy - 10], [cx + 8, cy - 2], [cx, cy + 2], [cx - 8, cy - 2], [cx - 8, cy - 10]], T.sideL);
      poly(ctx, [[cx, cy - 14], [cx + 8, cy - 10], [cx, cy - 6], [cx - 8, cy - 10]], T.topLit);
      seg(ctx, cx, cy - 14, cx, cy - 26, T.sideR, 1.6);
      poly(ctx, [[cx - 2, cy - 26], [cx + 2, cy - 26], [cx, cy - 31]], T.glow);
      seg(ctx, cx - 8, cy - 6, cx + 8, cy - 6, T.glow, 0.5, [1, 1]);
      break;
    }
    case 'power1': {
      isoPad(ctx, cx, cy, 20, 20);
      isoBox(ctx, cx, cy, 10, 10, 7);
      ctx.fillStyle = T.sideL;
      ctx.fillRect(cx - 6, cy - 16, 2, 9);
      ctx.strokeStyle = T.edge;
      ctx.lineWidth = 0.4;
      ctx.strokeRect(cx - 6, cy - 16, 2, 9);
      poly(ctx, [[cx + 4, cy - 8], [cx + 1.5, cy - 3.5], [cx + 3.5, cy - 3.5], [cx + 1.5, cy]], T.glow);
      break;
    }
    case 'power2': {
      isoPad(ctx, cx, cy, 23, 23);
      isoBox(ctx, cx, cy, 12, 12, 5);
      dome(ctx, cx, cy - 9, 6);
      dot(ctx, cx, cy - 11, 1.1, T.glow);
      ctx.fillStyle = T.sideL;
      ctx.fillRect(cx - 11, cy - 13, 2, 8);
      ctx.fillRect(cx + 9, cy - 13, 2, 8);
      ctx.strokeStyle = T.edge;
      ctx.lineWidth = 0.4;
      ctx.strokeRect(cx - 11, cy - 13, 2, 8);
      ctx.strokeRect(cx + 9, cy - 13, 2, 8);
      break;
    }
    case 'storage': {
      isoPad(ctx, cx, cy, 21, 21);
      tank(ctx, cx - 5, cy - 3, 3, 9);
      tank(ctx, cx + 4, cy - 5, 3, 11);
      tank(ctx, cx + 1, cy, 2.4, 7);
      break;
    }
    case 'laser': {
      isoPad(ctx, cx, cy, 19, 19);
      isoBox(ctx, cx, cy, 9, 9, 4);
      tank(ctx, cx, cy - 4, 3.6, 4);
      seg(ctx, cx, cy - 8, cx + 7, cy - 19, T.sideR, 1.7);
      dot(ctx, cx + 7, cy - 19, 1.2, T.glow);
      break;
    }
    case 'silo': {
      isoPad(ctx, cx, cy, 20, 20);
      isoBox(ctx, cx, cy, 10, 10, 3);
      poly(ctx, [[cx - 4, cy - 5], [cx + 4, cy - 9], [cx + 4, cy - 5.5], [cx - 4, cy - 1.5]], T.edge, T.glowDim);
      seg(ctx, cx, cy - 7, cx, cy - 3, T.glowDim, 0.4);
      poly(ctx, [[cx - 1, cy - 9], [cx + 1, cy - 9], [cx, cy - 13]], T.glow);
      dot(ctx, cx - 8, cy - 1, 0.6, T.crit);
      dot(ctx, cx + 8, cy - 5, 0.6, T.glow);
      break;
    }
    case 'gravnull': {
      isoPad(ctx, cx, cy, 21, 21);
      isoBox(ctx, cx, cy, 10, 10, 5);
      seg(ctx, cx, cy - 6, cx, cy - 14, T.sideL, 1.4);
      ctx.beginPath();
      ctx.ellipse(cx, cy - 17, 8, 2.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = T.sideL;
      ctx.fill();
      ctx.strokeStyle = T.edge;
      ctx.lineWidth = 0.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy - 17, 5, 1.6, 0, 0, Math.PI * 2);
      ctx.strokeStyle = T.glow;
      ctx.stroke();
      dot(ctx, cx, cy - 17, 0.8, T.glow);
      break;
    }
    case 'shipyard': {
      isoPad(ctx, cx, cy, 24, 18);
      isoBox(ctx, cx, cy, 13, 9, 6);
      ctx.beginPath();
      ctx.moveTo(cx - 13, cy - 12.5);
      ctx.quadraticCurveTo(cx, cy - 19, cx + 13, cy - 12.5);
      ctx.lineTo(cx, cy - 16);
      ctx.closePath();
      ctx.fillStyle = T.topLit;
      ctx.fill();
      ctx.strokeStyle = T.edge;
      ctx.lineWidth = 0.4;
      ctx.stroke();
      ctx.fillStyle = T.glow;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(cx - 10, cy - 5, 5, 4);
      ctx.globalAlpha = 1;
      break;
    }
    case 'dock': {
      isoPad(ctx, cx, cy, 20, 20);
      seg(ctx, cx, cy, cx, cy - 10, T.sideR, 1.5);
      ctx.beginPath();
      ctx.ellipse(cx, cy - 19, 12, 5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = T.sideR;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.strokeStyle = T.topLit;
      ctx.lineWidth = 1;
      ctx.stroke();
      poly(ctx, [[cx, cy - 23], [cx + 2.5, cy - 19], [cx, cy - 17], [cx - 2.5, cy - 19]], T.sideL);
      dot(ctx, cx - 12, cy - 19, 0.7, T.glow);
      dot(ctx, cx + 12, cy - 19, 0.7, T.glow);
      break;
    }
    case 'engine': {
      isoPad(ctx, cx, cy, 24, 18);
      isoBox(ctx, cx, cy, 13, 9, 9);
      /* exhaust cone facing right */
      poly(ctx, [[cx + 13, cy - 10], [cx + 20, cy - 13], [cx + 20, cy - 8], [cx + 13, cy - 5]], T.sideL);
      ctx.beginPath();
      ctx.ellipse(cx + 20, cy - 10.5, 2, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = T.edge;
      ctx.fill();
      ctx.strokeStyle = T.glowDim;
      ctx.lineWidth = 0.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx + 20, cy - 10.5, 1.1, 1.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = T.glow;
      ctx.fill();
      seg(ctx, cx - 9, cy - 4, cx + 9, cy - 9, T.glow, 0.5, [1, 1]);
      break;
    }
    default: {
      isoPad(ctx, cx, cy, 16, 16);
      isoBox(ctx, cx, cy, 7, 7, 7);
      break;
    }
  }
}

function drawScaffold(ctx: CanvasRenderingContext2D, cx: number, cy: number, progress: number) {
  isoPad(ctx, cx, cy, 18, 18);
  /* dashed wireframe frame */
  const corners = [
    [cx, cy],
    [cx + 12, cy - 6],
    [cx, cy - 12],
    [cx - 12, cy - 6],
  ];
  for (const [px, py] of corners) {
    seg(ctx, px, py, px, py - 12, T.glowDim, 0.7, [2, 2]);
  }
  seg(ctx, cx, cy - 12, cx + 12, cy - 18, T.glowDim, 0.6, [2, 2]);
  seg(ctx, cx + 12, cy - 18, cx, cy - 24, T.glowDim, 0.6, [2, 2]);
  seg(ctx, cx, cy - 24, cx - 12, cy - 18, T.glowDim, 0.6, [2, 2]);
  seg(ctx, cx - 12, cy - 18, cx, cy - 12, T.glowDim, 0.6, [2, 2]);
  /* progress bar along the cell front edge */
  ctx.fillStyle = 'rgba(12, 15, 23, 0.85)';
  ctx.fillRect(cx - 14, cy + 4, 28, 3.4);
  ctx.strokeStyle = T.glowDim;
  ctx.lineWidth = 0.5;
  ctx.strokeRect(cx - 14, cy + 4, 28, 3.4);
  ctx.fillStyle = T.glow;
  ctx.fillRect(cx - 13, cy + 5, 26 * Math.max(0, Math.min(1, progress)), 1.4);
}

function drawDistress(ctx: CanvasRenderingContext2D, cx: number, cy: number, phase: boolean) {
  /* cracks over the structure */
  seg(ctx, cx - 5, cy - 14, cx - 1, cy - 8, '#120f0a', 0.9);
  seg(ctx, cx - 1, cy - 8, cx - 4, cy - 3, '#120f0a', 0.9);
  seg(ctx, cx + 4, cy - 11, cx + 1, cy - 5, '#120f0a', 0.9);
  /* warning blink */
  dot(ctx, cx + 6, cy - 18, 1.4, T.crit);
  ctx.globalAlpha = phase ? 0.9 : 0.25;
  ctx.beginPath();
  ctx.arc(cx + 6, cy - 18, 2.6, 0, Math.PI * 2);
  ctx.strokeStyle = T.crit;
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/* ============================================================
   Cells pass (painter's order: back row first)
   ============================================================ */
function drawCells(
  ctx: CanvasRenderingContext2D,
  n: number,
  placed: Record<string, PlacedCell>,
  hoverCell: string | null,
  inspectedCell: string | null,
  selected: BuildingDef | null,
  phase: boolean
) {
  for (let s = 0; s <= 2 * (n - 1); s++) {
    for (let gx = 0; gx < n; gx++) {
      const gy = s - gx;
      if (gy < 0 || gy >= n) continue;
      const key = `${gx},${gy}`;
      const cell = placed[key];
      const cc = cellCenter(gx, gy);
      const cx = cc.x;
      const cy = cc.y + 10;

      if (cell) {
        if (cell.constructing) {
          drawScaffold(ctx, cx, cy, cell.progress ?? 0);
        } else {
          drawBuilding(ctx, cell.kind, cx, cy);
          if (cell.damaged) drawDistress(ctx, cx, cy, phase);
        }
      } else if (key === hoverCell && selected && isBuildable(gx, gy, n)) {
        /* ghost preview of the pending placement */
        ctx.globalAlpha = 0.55;
        drawBuilding(ctx, selected.id, cx, cy);
        ctx.globalAlpha = 1;
      }

      /* tiny id tag on inspected buildings */
      if (cell && key === inspectedCell) {
        const def = BUILDINGS.find((b) => b.id === cell.kind);
        if (def) {
          ctx.font = '7px "JetBrains Mono", monospace';
          ctx.fillStyle = T.signal;
          ctx.textAlign = 'center';
          ctx.fillText(def.id.slice(0, 4).toUpperCase(), cx, cy + 12);
        }
      }
    }
  }
}
