import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BUILDINGS, EVENT_FEED, ASTEROIDS } from '../../data/gameData';
import { BuildingGlyph } from '../../assets/BuildingGlyph';
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
  const [hoverCell, setHoverCell] = useState<string | null>(null);

  if (!asteroid) {
    return (
      <div className="screen screen-enter" style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <div className="t-eyebrow" style={{ color: 'var(--crit)' }}>SELECTED ASTEROID NOT FOUND</div>
      </div>
    );
  }

  const sel = BUILDINGS.find((b) => b.id === selectedBuilding) ?? null;

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
}: {
  placed: Record<string, { kind: string; damaged?: boolean; constructing?: boolean; progress?: number }>;
  selected: (typeof BUILDINGS)[number] | null;
  hoverCell: string | null;
  onHover: (key: string | null) => void;
  asteroid?: AsteroidState;
}) {
  const N = 9;
  const asteroidDef = ASTEROIDS.find((a) => a.id === asteroid?.id);
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

      {/* Build grid area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(ellipse at center, oklch(0.20 0.018 240) 0%, var(--bg-void) 100%)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {/* Ore deposit faint backdrop */}
        <svg
          width={320}
          height={320}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.35,
            pointerEvents: 'none',
          }}
        >
          <circle
            cx={160}
            cy={160}
            r={140}
            fill="none"
            stroke="oklch(0.30 0.06 240)"
            strokeWidth={0.5}
          />
          <circle
            cx={160}
            cy={160}
            r={100}
            fill="none"
            stroke="oklch(0.30 0.06 240)"
            strokeWidth={0.5}
          />
          <circle
            cx={160}
            cy={160}
            r={60}
            fill="none"
            stroke="oklch(0.40 0.06 60)"
            strokeWidth={0.5}
          />
          <text
            x={160}
            y={306}
            textAnchor="middle"
            fontFamily="JetBrains Mono"
            fontSize={9}
            fill="oklch(0.40 0.012 240)"
          >
            SURFACE
          </text>
          <text
            x={160}
            y={266}
            textAnchor="middle"
            fontFamily="JetBrains Mono"
            fontSize={9}
            fill="oklch(0.40 0.012 240)"
          >
            DEEP
          </text>
          <text
            x={160}
            y={226}
            textAnchor="middle"
            fontFamily="JetBrains Mono"
            fontSize={9}
            fill="oklch(0.50 0.10 60)"
          >
            SEISMIC
          </text>
        </svg>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${N}, 56px)`,
            gridTemplateRows: `repeat(${N}, 56px)`,
            gap: 2,
            position: 'relative',
          }}
        >
          {Array.from({ length: N * N }, (_, i) => {
            const x = i % N;
            const y = Math.floor(i / N);
            const key = `${x},${y}`;
            const cell = placed[key];
            const dist = Math.abs(x - 4) + Math.abs(y - 4);
            const onRim = dist > 5;
            const isHover = hoverCell === key;
            return (
              <Cell
                key={key}
                x={x}
                y={y}
                cell={cell}
                onRim={onRim}
                isHover={isHover}
                selected={selected}
                onEnter={() => onHover(key)}
                onLeave={() => onHover(null)}
              />
            );
          })}
        </div>

        {/* Coord overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--fg-40)',
          }}
        >
          GRID 9×9 · ORIGIN [0,0] · LAYERED EXTRACTION ENABLED
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
   Cell
   ============================================================ */
function Cell({
  x,
  y,
  cell,
  onRim,
  isHover,
  selected,
  onEnter,
  onLeave,
}: {
  x: number;
  y: number;
  cell?: { kind: string; damaged?: boolean; constructing?: boolean; progress?: number };
  onRim: boolean;
  isHover: boolean;
  selected: (typeof BUILDINGS)[number] | null;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const def = cell ? BUILDINGS.find((b) => b.id === cell.kind) : null;
  const canPlace = !cell && !onRim;

  let bg: string = 'transparent';
  let border: string = onRim ? 'transparent' : '1px solid oklch(0.26 0.014 240)';
  let color: string = 'var(--fg-60)';
  let glow: string = 'none';

  if (cell) {
    bg = cell.damaged ? 'var(--crit-bg)' : 'var(--bg-elev)';
    border = cell.damaged
      ? '1px solid var(--crit-dim)'
      : cell.constructing
      ? '1px dashed var(--warn-dim)'
      : '1px solid var(--line)';
    color = cell.constructing ? 'var(--warn)' : 'var(--fg-100)';
  }
  if (isHover && canPlace) {
    bg = 'var(--warn-bg)';
    border = '1px solid var(--warn)';
    glow = '0 0 8px var(--warn-dim)';
  }
  if (isHover && cell) {
    border = '1px solid var(--signal)';
  }

  if (onRim) return <div style={{ background: 'transparent' }} />;

  return (
    <button
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        background: bg,
        border,
        cursor: cell ? 'pointer' : canPlace ? 'crosshair' : 'not-allowed',
        padding: 0,
        position: 'relative',
        boxShadow: glow,
        transition: 'all 80ms',
      }}
    >
      {def && (
        <>
          <div
            style={{
              color,
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BuildingGlyph id={def.id} size={32} />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 2,
              left: 3,
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              color: 'var(--fg-40)',
              letterSpacing: '0.06em',
            }}
          >
            {def.id.slice(0, 3).toUpperCase()}
          </div>
          {cell?.constructing && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'var(--bg-input)',
              }}
            >
              <div
                style={{
                  width: `${(cell.progress ?? 0) * 100}%`,
                  height: '100%',
                  background: 'var(--warn)',
                }}
              />
            </div>
          )}
          {cell?.damaged && (
            <div
              style={{
                position: 'absolute',
                top: 2,
                right: 3,
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--crit)',
              }}
            >
              !
            </div>
          )}
        </>
      )}
      {canPlace && isHover && selected && (
        <div
          style={{
            color: 'var(--warn)',
            opacity: 0.6,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <BuildingGlyph id={selected.id} size={32} />
        </div>
      )}
      {!cell && !onRim && (
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: 7,
            color: 'var(--fg-20)',
          }}
        >
          {x}
          {y}
        </div>
      )}
    </button>
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
