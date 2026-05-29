// colony.jsx — asteroid colony detail view with build grid and queue
// Three-pane: left = build palette, center = grid + asteroid stats, right = queue + events

function ColonyView() {
  const [selectedBuilding, setSelectedBuilding] = React.useState('mine2');
  const [hoverCell, setHoverCell] = React.useState(null);
  const buildings = window.GameData.BUILDINGS;

  // Pre-placed grid for Arch-I (9×9). Each cell has either { kind, hp%, building? } or empty.
  const placed = React.useMemo(() => {
    const g = {};
    g['4,4'] = { kind: 'cpu' };
    g['3,4'] = { kind: 'air' };
    g['5,4'] = { kind: 'hydration' };
    g['4,3'] = { kind: 'living' };
    g['4,5'] = { kind: 'living' };
    g['3,3'] = { kind: 'power1' };
    g['5,5'] = { kind: 'power1' };
    g['2,4'] = { kind: 'mine1' };
    g['6,4'] = { kind: 'mine2' };
    g['3,5'] = { kind: 'hydroponics' };
    g['5,3'] = { kind: 'medical' };
    g['2,3'] = { kind: 'storage' };
    g['6,5'] = { kind: 'storage' };
    g['2,5'] = { kind: 'laser' };
    g['6,3'] = { kind: 'laser' };
    g['4,6'] = { kind: 'silo' };
    g['1,4'] = { kind: 'deep' };
    g['7,4'] = { kind: 'security' };
    g['4,2'] = { kind: 'resiblock' };
    g['3,6'] = { kind: 'pleasure', damaged: true };
    g['1,3'] = { kind: 'mine1', constructing: true, progress: 0.55 };
    g['1,5'] = { kind: 'mine1', constructing: true, progress: 0.32 };
    return g;
  }, []);

  const sel = buildings.find(b => b.id === selectedBuilding);

  return (
    <div className="screen screen-enter" style={{ display: 'grid', gridTemplateColumns: '260px 1fr 320px', height: '100%' }}>
      <ColonyPalette
        buildings={buildings}
        selected={selectedBuilding}
        onSelect={setSelectedBuilding}
      />
      <ColonyGrid
        placed={placed}
        selected={sel}
        hoverCell={hoverCell}
        onHover={setHoverCell}
      />
      <ColonySidebar />
    </div>
  );
}

function ColonyPalette({ buildings, selected, onSelect }) {
  const cats = [
    { id: 'core',  label: 'Core' },
    { id: 'life',  label: 'Life Support' },
    { id: 'pop',   label: 'Population' },
    { id: 'mine',  label: 'Extraction' },
    { id: 'power', label: 'Power' },
    { id: 'log',   label: 'Logistics' },
    { id: 'def',   label: 'Defence' },
    { id: 'prod',  label: 'Production' },
    { id: 'prop',  label: 'Propulsion' },
  ];

  return (
    <aside style={{
      borderRight: '1px solid var(--line-soft)',
      background: 'var(--bg-base)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
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
        {cats.map(cat => {
          const items = buildings.filter(b => b.cat === cat.id);
          if (!items.length) return null;
          return (
            <div key={cat.id}>
              <div style={{
                padding: '8px 14px 6px',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.18em',
                color: 'var(--fg-40)',
                textTransform: 'uppercase',
                background: 'var(--bg-void)',
                borderTop: '1px solid var(--line-soft)',
                borderBottom: '1px solid var(--line-soft)',
              }}>
                ─ {cat.label}
              </div>
              {items.map(b => (
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
                    background: selected === b.id ? 'var(--bg-elev)' : 'transparent',
                    borderLeft: selected === b.id ? '2px solid var(--warn)' : '2px solid transparent',
                    color: 'var(--fg-80)',
                    transition: 'background 100ms',
                  }}
                >
                  <div style={{
                    width: 24, height: 24,
                    display: 'grid', placeItems: 'center',
                    background: selected === b.id ? 'var(--warn-bg)' : 'var(--bg-elev)',
                    border: '1px solid ' + (selected === b.id ? 'var(--warn-dim)' : 'var(--line-soft)'),
                    color: selected === b.id ? 'var(--warn)' : 'var(--fg-80)',
                  }}><BuildingGlyph id={b.id} size={18} /></div>
                  <div style={{ fontSize: 12 }}>{b.name}</div>
                  <div className="t-data" style={{ fontSize: 10, color: 'var(--fg-40)' }}>
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

function ColonyGrid({ placed, selected, hoverCell, onHover }) {
  const N = 9;
  return (
    <section style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top stats bar */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>COLONY · ARCH-I · L-class · HOME</div>
            <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 4 }}>
              Arch-I Operations
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm ghost">‹ Forge-3</button>
            <button className="btn sm ghost">Kepler-7 ›</button>
            <button className="btn sm">SUPERVISORS</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 14 }}>
          <ResourceStat label="POPULATION" value="480 / 700"   bar={68} color="signal" />
          <ResourceStat label="HAPPINESS"  value="78"          bar={78} color="ally" />
          <ResourceStat label="POWER"      value="+12 / 84"    bar={86} color="warn" />
          <ResourceStat label="FOOD"       value="+8 / day"    bar={92} color="ally" />
          <ResourceStat label="WATER"      value="+12 / day"   bar={88} color="signal" />
          <ResourceStat label="AIR"        value="+4 / day"    bar={62} color="signal" />
          <ResourceStat label="RAD"        value="8 mSv"       bar={8}  color="ally" />
        </div>
      </div>

      {/* Build grid area */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background:
          'radial-gradient(ellipse at center, oklch(0.20 0.018 240) 0%, var(--bg-void) 100%)',
        display: 'grid',
        placeItems: 'center',
      }}>
        {/* Ore deposit faint backdrop */}
        <svg width="320" height="320" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.35, pointerEvents: 'none' }}>
          <circle cx="160" cy="160" r="140" fill="none" stroke="oklch(0.30 0.06 240)" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="100" fill="none" stroke="oklch(0.30 0.06 240)" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="60"  fill="none" stroke="oklch(0.40 0.06 60)"  strokeWidth="0.5" />
          <text x="160" y="306" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="oklch(0.40 0.012 240)">SURFACE</text>
          <text x="160" y="266" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="oklch(0.40 0.012 240)">DEEP</text>
          <text x="160" y="226" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill="oklch(0.50 0.10 60)">SEISMIC</text>
        </svg>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${N}, 56px)`,
          gridTemplateRows: `repeat(${N}, 56px)`,
          gap: 2,
          position: 'relative',
        }}>
          {Array.from({ length: N * N }, (_, i) => {
            const x = i % N;
            const y = Math.floor(i / N);
            const key = `${x},${y}`;
            const cell = placed[key];
            const dist = Math.abs(x - 4) + Math.abs(y - 4);
            const onRim = dist > 5; // outer corners are "off-asteroid"
            const isHover = hoverCell === key;
            return (
              <Cell
                key={key}
                x={x} y={y}
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
        <div style={{ position: 'absolute', bottom: 12, left: 14, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-40)' }}>
          GRID 9×9 · ORIGIN [0,0] · LAYERED EXTRACTION ENABLED
        </div>
        <div style={{ position: 'absolute', bottom: 12, right: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="t-meta">VIEW</span>
          <button className="btn sm ghost" style={{ color: 'var(--warn)' }}>SURFACE</button>
          <button className="btn sm ghost">DEEP</button>
          <button className="btn sm ghost">ORBITAL</button>
        </div>
      </div>
    </section>
  );
}

function Cell({ x, y, cell, onRim, isHover, selected, onEnter, onLeave }) {
  const def = cell ? window.GameData.BUILDINGS.find(b => b.id === cell.kind) : null;
  const canPlace = !cell && !onRim;

  let bg = 'transparent';
  let border = onRim ? 'transparent' : '1px solid oklch(0.26 0.014 240)';
  let color = 'var(--fg-60)';
  let glow = 'none';

  if (cell) {
    bg = cell.damaged ? 'var(--crit-bg)' : 'var(--bg-elev)';
    border = cell.damaged ? '1px solid var(--crit-dim)'
      : cell.constructing ? '1px dashed var(--warn-dim)'
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
        cursor: cell ? 'pointer' : (canPlace ? 'crosshair' : 'not-allowed'),
        padding: 0,
        position: 'relative',
        boxShadow: glow,
        transition: 'all 80ms',
      }}
    >
      {def && (
        <>
          <div style={{
            color,
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><BuildingGlyph id={def.id} size={32} /></div>
          <div style={{
            position: 'absolute', bottom: 2, left: 3,
            fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--fg-40)',
            letterSpacing: '0.06em',
          }}>{def.id.slice(0, 3).toUpperCase()}</div>
          {cell.constructing && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 3, background: 'var(--bg-input)',
            }}>
              <div style={{ width: `${cell.progress * 100}%`, height: '100%', background: 'var(--warn)' }} />
            </div>
          )}
          {cell.damaged && (
            <div style={{
              position: 'absolute', top: 2, right: 3,
              fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--crit)',
            }}>!</div>
          )}
        </>
      )}
      {canPlace && isHover && selected && (
        <div style={{
          color: 'var(--warn)', opacity: 0.6,
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        }}><BuildingGlyph id={selected.id} size={32} /></div>
      )}
      {!cell && !onRim && (
        <div style={{
          position: 'absolute', top: 3, left: 4,
          fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--fg-20)',
        }}>{x}{y}</div>
      )}
    </button>
  );
}

function ResourceStat({ label, value, bar, color }) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div className="t-data" style={{ fontSize: 14, color: 'var(--fg-100)', marginTop: 2 }}>{value}</div>
      <div className={'meter ' + color} style={{ marginTop: 6 }}>
        <div style={{ width: `${bar}%` }} />
      </div>
    </div>
  );
}

function ColonySidebar() {
  return (
    <aside style={{
      background: 'var(--bg-base)',
      borderLeft: '1px solid var(--line-soft)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Build Queue */}
      <div style={{ padding: 14, borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="t-eyebrow">BUILD QUEUE · ARCH-I</div>
          <div className="t-meta" style={{ color: 'var(--warn)' }}>3 active</div>
        </div>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: 280 }}>
        <QueueItem name="Mine Mk1" cell="[1,3]" pct={55}  eta="2d"  active />
        <QueueItem name="Mine Mk1" cell="[1,5]" pct={32}  eta="3d"  active />
        <QueueItem name="Storage Tower" cell="[7,5]" pct={0} eta="4d" />
        <QueueItem name="Laser Turret" cell="[3,2]" pct={0} eta="5d" />
        <QueueItem name="Mine Mk2" cell="[7,3]" pct={0} eta="7d" />
        <QueueItem name="Pleasure Dome" cell="—" pct={0} eta="8d" disabled note="awaiting medical clear" />
      </div>

      {/* Event Feed */}
      <div style={{ padding: 14, borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow">LIVE FEED</div>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {window.GameData.EVENT_FEED.slice(0, 6).map(e => (
          <div key={e.id} style={{
            padding: '8px 14px',
            borderBottom: '1px solid var(--line-soft)',
            display: 'grid', gridTemplateColumns: 'auto 1fr',
            gap: 10,
            fontSize: 11,
            background: e.kind === 'crit' ? 'oklch(0.20 0.04 18 / 0.30)'
              : e.kind === 'illegal' ? 'oklch(0.20 0.04 330 / 0.25)' : 'transparent',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <span style={{ width: 6, height: 6,
                background: e.kind === 'crit' ? 'var(--crit)'
                  : e.kind === 'warn' ? 'var(--warn)'
                  : e.kind === 'ally' ? 'var(--ally)'
                  : e.kind === 'illegal' ? 'var(--illegal)'
                  : 'var(--signal)',
                marginTop: 4,
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--fg-40)' }}>{e.t}</span>
            </div>
            <div style={{ color: 'var(--fg-80)', lineHeight: 1.4 }}>{e.text}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function QueueItem({ name, cell, pct, eta, active, disabled, note }) {
  return (
    <div style={{
      padding: '10px 14px',
      borderBottom: '1px solid var(--line-soft)',
      display: 'grid', gridTemplateColumns: '1fr auto auto',
      alignItems: 'center',
      gap: 10,
      opacity: disabled ? 0.5 : 1,
    }}>
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
      <div className="t-data" style={{ fontSize: 11, color: active ? 'var(--warn)' : 'var(--fg-40)' }}>{eta}</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <button className="btn ghost sm" style={{ padding: '2px 6px', fontSize: 9 }}>▲</button>
        <button className="btn ghost sm" style={{ padding: '2px 6px', fontSize: 9 }}>▼</button>
      </div>
    </div>
  );
}

Object.assign(window, { ColonyView });
