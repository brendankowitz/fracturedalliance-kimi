import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BUILDINGS, EVENT_FEED, ASTEROIDS } from '../../data/gameData';
import { BuildingGlyph } from '../../assets/BuildingGlyph';
import { IsoSurface } from './IsoSurface';
import { gridSizeFor, isBuildable } from './isoMath';
import { click, place, error } from '../../audio/sfx';
import type { AsteroidState } from '../../sim/types';

const CATS = [
  { id: 'core', label: 'Core' },
  { id: 'life', label: 'Life Support' },
  { id: 'pop', label: 'Population' },
  { id: 'mine', label: 'Extraction' },
  { id: 'power', label: 'Power' },
  { id: 'log', label: 'Logistics' },
  { id: 'def', label: 'Defence' },
  { id: 'prod', label: 'Production' },
  { id: 'prop', label: 'Propulsion' },
];

export function ColonyView() {
  const selectedBuilding = useGameStore((s) => s.selectedBuilding);
  const setSelectedBuilding = useGameStore((s) => s.setSelectedBuilding);
  const asteroids = useGameStore((s) => s.asteroids);
  const selectedAsteroidId = useGameStore((s) => s.selectedAsteroid);
  const asteroid = useMemo(
    () => asteroids.find((a) => a.id === selectedAsteroidId),
    [asteroids, selectedAsteroidId]
  );
  const placed = asteroid?.placedBuildings ?? {};
  const buildQueue = asteroid?.buildQueue ?? [];
  const placeBuilding = useGameStore((s) => s.placeBuilding);
  const [hoverCell, setHoverCell] = useState<string | null>(null);
  const [inspectedCell, setInspectedCell] = useState<string | null>(null);

  if (!asteroid) {
    return (
      <div className="screen screen-enter" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <div className="t-eyebrow" style={{ color: 'var(--crit)' }}>SELECTED ASTEROID NOT FOUND</div>
      </div>
    );
  }

  const sel = BUILDINGS.find((b) => b.id === selectedBuilding) ?? null;
  const asteroidDef = ASTEROIDS.find((a) => a.id === asteroid.id);
  const gridN = gridSizeFor(asteroidDef?.size ?? asteroid.size);

  const handleCellClick = (key: string) => {
    if (placed[key]) {
      // Occupied cell: inspect (legacy grid had no click handler; the
      // inspect ring + overlay readout is the new select behavior).
      click();
      setInspectedCell(key);
      return;
    }
    if (!sel) return;
    const [x, y] = key.split(',').map(Number);
    if (!isBuildable(x, y, gridN)) {
      error();
      return;
    }
    setInspectedCell(null);
    placeBuilding(key, sel.id);
    place();
  };

  return (
    <div
      className="screen screen-enter"
      style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr 320px',
        height: '100%',
      }}
    >
      <ColonyPalette
        buildings={BUILDINGS}
        selected={selectedBuilding}
        onSelect={setSelectedBuilding}
      />
      <ColonyGrid
        placed={placed}
        selected={sel}
        hoverCell={hoverCell}
        onHover={setHoverCell}
        asteroid={asteroid}
        gridN={gridN}
        inspectedCell={inspectedCell}
        onCellClick={handleCellClick}
      />
      <ColonySidebar buildQueue={buildQueue} />
    </div>
  );
}

/* ============================================================
   ColonyPalette
   ============================================================ */
function ColonyPalette({
  buildings,
  selected,
  onSelect,
}: {
  buildings: typeof BUILDINGS;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <aside
      style={{
        borderRight: '1px solid var(--line-soft)',
        background: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 14, borderBottom: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow">[ BUILD PALETTE ]</div>
        <input
          placeholder="search ⌘K"
          style={{
            width: '100%',
            marginTop: 10,
            padding: '6px 10px',
            background: 'var(--bg-input)',
            border: '1px solid var(--line-soft)',
            color: 'var(--fg-80)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            outline: 'none',
          }}
        />
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {CATS.map((cat) => {
          const items = buildings.filter((b) => b.cat === cat.id);
          if (!items.length) return null;
          return (
            <div key={cat.id}>
              <div
                style={{
                  padding: '8px 14px 6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.18em',
                  color: 'var(--fg-40)',
                  textTransform: 'uppercase',
                  background: 'var(--bg-void)',
                  borderTop: '1px solid var(--line-soft)',
                  borderBottom: '1px solid var(--line-soft)',
                }}
              >
                ─ {cat.label}
              </div>
              {items.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onSelect(b.id)}
                  style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: '28px 1fr auto',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    textAlign: 'left',
                    background:
                      selected === b.id ? 'var(--bg-elev)' : 'transparent',
                    borderLeft:
                      selected === b.id
                        ? '2px solid var(--warn)'
                        : '2px solid transparent',
                    color: 'var(--fg-80)',
                    transition: 'background 100ms',
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      display: 'grid',
                      placeItems: 'center',
                      background:
                        selected === b.id ? 'var(--warn-bg)' : 'var(--bg-elev)',
                      border:
                        '1px solid ' +
                        (selected === b.id
                          ? 'var(--warn-dim)'
                          : 'var(--line-soft)'),
                      color:
                        selected === b.id ? 'var(--warn)' : 'var(--fg-80)',
                    }}
                  >
                    <BuildingGlyph id={b.id} size={18} />
                  </div>
                  <div style={{ fontSize: 12 }}>{b.name}</div>
                  <div
                    className="t-data"
                    style={{ fontSize: 10, color: 'var(--fg-40)' }}
                  >
                    {b.cost ? `${b.cost}` : '—'}
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

/* ============================================================
   ColonyGrid
   ============================================================ */
function ColonyGrid({
  placed,
  selected,
  hoverCell,
  onHover,
  asteroid,
  gridN,
  inspectedCell,
  onCellClick,
}: {
  placed: Record<string, { kind: string; damaged?: boolean; constructing?: boolean; progress?: number }>;
  selected: (typeof BUILDINGS)[number] | null;
  hoverCell: string | null;
  onHover: (key: string | null) => void;
  asteroid?: AsteroidState;
  gridN: number;
  inspectedCell: string | null;
  onCellClick: (key: string) => void;
}) {
  const N = gridN;
  const asteroidDef = ASTEROIDS.find((a) => a.id === asteroid?.id);
  const inspectedDef = inspectedCell && placed[inspectedCell]
    ? BUILDINGS.find((b) => b.id === placed[inspectedCell].kind)
    : null;
  const r = asteroid?.resources;
  const stats = r ? [
    { label: 'POPULATION', value: `${Math.floor(r.pop)} / ${r.popCap}`, bar: Math.round((r.pop / Math.max(1, r.popCap)) * 100), color: 'signal' as const },
    { label: 'HAPPINESS', value: `${Math.floor(r.happiness)}`, bar: r.happiness, color: 'ally' as const },
    { label: 'POWER', value: `${r.power > 0 ? '+' : ''}${r.power}`, bar: Math.min(100, Math.max(0, 50 + r.power * 3)), color: r.power < 0 ? 'crit' : 'warn' as const },
    { label: 'FOOD', value: `${r.food > 0 ? '+' : ''}${r.food} / day`, bar: Math.min(100, Math.max(0, 50 + r.food * 5)), color: 'ally' as const },
    { label: 'WATER', value: `${r.water > 0 ? '+' : ''}${r.water} / day`, bar: Math.min(100, Math.max(0, 50 + r.water * 5)), color: 'signal' as const },
    { label: 'AIR', value: `${r.air > 0 ? '+' : ''}${r.air} / day`, bar: Math.min(100, Math.max(0, 50 + r.air * 5)), color: 'signal' as const },
    { label: 'RAD', value: `${r.rad} mSv`, bar: Math.min(100, r.rad * 4), color: 'ally' as const },
  ] : [];

  return (
    <section style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top stats bar */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line-soft)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>
              COLONY · {(asteroidDef?.name ?? '—').toUpperCase()} · {asteroidDef?.size ?? '—'}-class · {(asteroidDef?.status ?? '—').toUpperCase()}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                marginTop: 4,
              }}
            >
              {asteroidDef?.name ?? 'Unknown'} Operations
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm ghost">‹ Forge-3</button>
            <button className="btn sm ghost">Kepler-7 ›</button>
            <button className="btn sm">SUPERVISORS</button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 14,
          }}
        >
          {stats.map((s) => (
            <ResourceStat key={s.label} label={s.label} value={s.value} bar={s.bar} color={s.color} />
          ))}
        </div>
      </div>

      {/* Build grid area — isometric asteroid surface */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--bg-void)',
        }}
      >
        <IsoSurface
          asteroidId={asteroid?.id ?? 'unknown'}
          gridSize={N}
          placed={placed}
          selected={selected}
          hoverCell={hoverCell}
          inspectedCell={inspectedCell}
          onHoverCell={onHover}
          onCellClick={onCellClick}
        />

        {/* Coord overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--fg-40)',
            pointerEvents: 'none',
          }}
        >
          ISO GRID {N}×{N} · {hoverCell ? `CELL [${hoverCell}]` : 'WHEEL ZOOM · DRAG PAN'}
          {inspectedDef ? ` · INSPECT: ${inspectedDef.name.toUpperCase()} [${inspectedCell}]` : ''}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 14,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <span className="t-meta">VIEW</span>
          <button className="btn sm ghost" style={{ color: 'var(--warn)' }}>
            SURFACE
          </button>
          <button className="btn sm ghost">DEEP</button>
          <button className="btn sm ghost">ORBITAL</button>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ResourceStat
   ============================================================ */
function ResourceStat({
  label,
  value,
  bar,
  color,
}: {
  label: string;
  value: string;
  bar: number;
  color: string;
}) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div
        className="t-data"
        style={{ fontSize: 14, color: 'var(--fg-100)', marginTop: 2 }}
      >
        {value}
      </div>
      <div className={`meter ${color}`} style={{ marginTop: 6 }}>
        <div style={{ width: `${bar}%` }} />
      </div>
    </div>
  );
}

/* ============================================================
   ColonySidebar
   ============================================================ */
function ColonySidebar({
  buildQueue,
}: {
  buildQueue: {
    name: string;
    cell: string;
    pct: number;
    etaDays: number;
    active?: boolean;
    disabled?: boolean;
    note?: string;
  }[];
}) {
  const activeCount = buildQueue.filter((q) => q.active).length;

  return (
    <aside
      style={{
        background: 'var(--bg-base)',
        borderLeft: '1px solid var(--line-soft)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Build Queue */}
      <div style={{ padding: 14, borderBottom: '1px solid var(--line-soft)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div className="t-eyebrow">BUILD QUEUE · ARCH-I</div>
          <div className="t-meta" style={{ color: 'var(--warn)' }}>
            {activeCount} active
          </div>
        </div>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: 280 }}>
        {buildQueue.map((item, idx) => (
          <QueueItem key={idx} {...item} />
        ))}
      </div>

      {/* Event Feed */}
      <div
        style={{
          padding: 14,
          borderTop: '1px solid var(--line-soft)',
          borderBottom: '1px solid var(--line-soft)',
        }}
      >
        <div className="t-eyebrow">LIVE FEED</div>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {EVENT_FEED.slice(0, 6).map((e) => (
          <div
            key={e.id}
            style={{
              padding: '8px 14px',
              borderBottom: '1px solid var(--line-soft)',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 10,
              fontSize: 11,
              background:
                e.kind === 'crit'
                  ? 'oklch(0.20 0.04 18 / 0.30)'
                  : e.kind === 'illegal'
                  ? 'oklch(0.20 0.04 330 / 0.25)'
                  : 'transparent',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  background:
                    e.kind === 'crit'
                      ? 'var(--crit)'
                      : e.kind === 'warn'
                      ? 'var(--warn)'
                      : e.kind === 'ally'
                      ? 'var(--ally)'
                      : e.kind === 'illegal'
                      ? 'var(--illegal)'
                      : 'var(--signal)',
                  marginTop: 4,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  color: 'var(--fg-40)',
                }}
              >
                {e.t}
              </span>
            </div>
            <div style={{ color: 'var(--fg-80)', lineHeight: 1.4 }}>
              {e.text}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ============================================================
   QueueItem
   ============================================================ */
function QueueItem({
  name,
  cell,
  pct,
  etaDays,
  active,
  disabled,
  note,
}: {
  name: string;
  cell: string;
  pct: number;
  etaDays: number;
  active?: boolean;
  disabled?: boolean;
  note?: string;
}) {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--line-soft)',
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        alignItems: 'center',
        gap: 10,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div>
        <div style={{ fontSize: 12, color: 'var(--fg-100)' }}>{name}</div>
        <div className="t-meta">
          {cell} · {note || (active ? 'building' : 'queued')}
        </div>
        {active && (
          <div className="meter warn" style={{ marginTop: 6, height: 4 }}>
            <div style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
      <div
        className="t-data"
        style={{
          fontSize: 11,
          color: active ? 'var(--warn)' : 'var(--fg-40)',
        }}
      >
        {etaDays}d
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button
          className="btn ghost sm"
          style={{ padding: '2px 6px', fontSize: 9 }}
        >
          ▲
        </button>
        <button
          className="btn ghost sm"
          style={{ padding: '2px 6px', fontSize: 9 }}
        >
          ▼
        </button>
      </div>
    </div>
  );
}
