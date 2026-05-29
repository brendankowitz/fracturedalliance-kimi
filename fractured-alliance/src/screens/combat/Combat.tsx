import React from 'react';
import { ShipGlyph } from '../../assets/ShipGlyph';
import { MissileGlyph } from '../../assets/MissileGlyph';
import { BombardmentGlyph } from '../../assets/BombardmentGlyph';

interface FleetShip {
  kind: string;
  name: string;
  hp: number;
  count: number;
}

interface Fleet {
  id: string;
  name: string;
  loc: string;
  status: string;
  ships: FleetShip[];
}

const FLEETS: Fleet[] = [
  {
    id: 'strike-1', name: 'Strike-1', loc: 'Forge-3 orbit', status: 'engaging',
    ships: [
      { kind: 'battleship', name: 'Asunder', hp: 78, count: 1 },
      { kind: 'eagle', name: 'Eagle wing-α', hp: 92, count: 4 },
      { kind: 'assault', name: 'Hammer-pack', hp: 64, count: 6 },
    ],
  },
  {
    id: 'patrol-2', name: 'Patrol-2', loc: 'Arch-I orbit', status: 'defend',
    ships: [
      { kind: 'eagle', name: 'Eagle wing-β', hp: 100, count: 3 },
      { kind: 'assault', name: 'Picket', hp: 100, count: 4 },
    ],
  },
  {
    id: 'scout-3', name: 'Scout-3', loc: 'Sector γ-7', status: 'transit',
    ships: [
      { kind: 'scout', name: 'Probe-α', hp: 100, count: 3 },
    ],
  },
  {
    id: 'reserve', name: 'Reserve', loc: 'Forge-3 dock', status: 'docked',
    ships: [
      { kind: 'cruiser', name: 'Iron Mandate', hp: 100, count: 1 },
      { kind: 'destructor', name: 'Vex', hp: 100, count: 2 },
    ],
  },
];

function ShipChip({ ship }: { ship: FleetShip }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '3px 6px',
      background: 'var(--bg-input)',
      border: '1px solid var(--line-soft)',
      fontFamily: 'var(--font-mono)', fontSize: 10,
      color: ship.hp < 50 ? 'var(--crit)' : ship.hp < 80 ? 'var(--warn)' : 'var(--fg-80)',
    }}>
      <span style={{ color: 'var(--fg-100)', display: 'inline-flex' }}>
        <ShipGlyph kind={ship.kind} size={14} />
      </span>
      <span>×{ship.count}</span>
      <span style={{ color: 'var(--fg-40)' }}>·</span>
      <span>{ship.hp}%</span>
    </div>
  );
}

function FleetRoster({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return (
    <aside style={{ background: 'var(--bg-base)', borderRight: '1px solid var(--line-soft)', overflowY: 'auto' }}>
      <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>TACTICAL COMMAND</div>
        <div style={{ fontSize: 20, fontWeight: 500, marginTop: 4, letterSpacing: '-0.02em' }}>Fleet Roster</div>
        <div className="t-meta" style={{ marginTop: 6 }}>4 fleets · 24 hulls · 1 engagement</div>
      </div>

      {FLEETS.map(f => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: selected === f.id ? 'var(--bg-elev)' : 'transparent',
            borderBottom: '1px solid var(--line-soft)',
            borderLeft: selected === f.id ? '3px solid var(--warn)' : '3px solid transparent',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 14, color: 'var(--fg-100)' }}>{f.name}</div>
            <span className={'tag ' + (f.status === 'engaging' ? 'crit' : f.status === 'defend' ? 'signal' : f.status === 'transit' ? 'warn' : '')}
              style={{ fontSize: 8 }}>
              {f.status.toUpperCase()}
            </span>
          </div>
          <div className="t-meta" style={{ marginTop: 4 }}>{f.loc}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {f.ships.map((s, i) => (
              <ShipChip key={i} ship={s} />
            ))}
          </div>
        </button>
      ))}
    </aside>
  );
}

function TacticalViewport() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: 'oklch(0.10 0.014 240)' }}>
      {/* Top status bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 5, background: 'linear-gradient(180deg, var(--bg-base) 0%, transparent 100%)' }}>
        <div>
          <div className="t-eyebrow" style={{ color: 'var(--crit)' }}>● LIVE ENGAGEMENT · STRIKE-1 vs KRYLL PICKET</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em' }}>Engagement Grid · Pyre Approach</div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
          <div>
            <div className="t-meta">elapsed</div>
            <div className="t-data" style={{ fontSize: 16, color: 'var(--warn)' }}>02:14</div>
          </div>
          <div>
            <div className="t-meta">our losses</div>
            <div className="t-data" style={{ fontSize: 16, color: 'var(--crit)' }}>1</div>
          </div>
          <div>
            <div className="t-meta">enemy losses</div>
            <div className="t-data" style={{ fontSize: 16, color: 'var(--ally)' }}>4</div>
          </div>
        </div>
      </div>

      {/* Tactical grid — top-down radar */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <radialGradient id="radar" cx="50%" cy="50%">
            <stop offset="0%" stopColor="oklch(0.22 0.06 200 / 0.3)" />
            <stop offset="60%" stopColor="oklch(0.18 0.04 200 / 0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <pattern id="grid2" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="oklch(0.28 0.014 240)" strokeWidth="0.08" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid2)" />
        <circle cx="50" cy="50" r="48" fill="url(#radar)" />
        <circle cx="50" cy="50" r="48" fill="none" stroke="oklch(0.36 0.06 200)" strokeWidth="0.12" />
        <circle cx="50" cy="50" r="32" fill="none" stroke="oklch(0.30 0.06 200)" strokeWidth="0.08" strokeDasharray="0.4,0.4" />
        <circle cx="50" cy="50" r="16" fill="none" stroke="oklch(0.30 0.06 200)" strokeWidth="0.08" strokeDasharray="0.4,0.4" />
        {/* range labels */}
        <text x="50" y="3" fontFamily="JetBrains Mono" fontSize="1.4" fill="oklch(0.46 0.012 240)" textAnchor="middle">N</text>
        <text x="97" y="51" fontFamily="JetBrains Mono" fontSize="1.4" fill="oklch(0.46 0.012 240)">E</text>
        <text x="50" y="99" fontFamily="JetBrains Mono" fontSize="1.4" fill="oklch(0.46 0.012 240)" textAnchor="middle">S</text>
        <text x="3"  y="51" fontFamily="JetBrains Mono" fontSize="1.4" fill="oklch(0.46 0.012 240)">W</text>

        {/* Pyre asteroid — target */}
        <g transform="translate(75, 38)">
          <polygon points="-6,-3 -3,-6 3,-6 6,-3 6,3 3,6 -3,6 -6,3" fill="oklch(0.30 0.10 290 / 0.6)" stroke="var(--crit)" strokeWidth="0.2" />
          <text y="11" fontFamily="JetBrains Mono" fontSize="1.6" fill="var(--crit)" textAnchor="middle">PYRE</text>
          <text y="13.5" fontFamily="JetBrains Mono" fontSize="1.2" fill="oklch(0.55 0.012 240)" textAnchor="middle">enemy capital</text>
        </g>

        {/* Friendly fleet — strike-1, using ShipGlyph as embedded foreign objects */}
        <g>
          {/* Capital battleship */}
          <g transform="translate(28, 58)">
            <foreignObject x="-3.5" y="-3.5" width="7" height="7">
              <div style={{ color: 'var(--warn)', display: 'flex' }}>
                <ShipGlyph kind="battleship" size={7} />
              </div>
            </foreignObject>
            <circle r="4" fill="none" stroke="var(--warn)" strokeWidth="0.15" strokeDasharray="0.4,0.4" />
            <text y="-5" fontFamily="JetBrains Mono" fontSize="1.2" fill="var(--warn)" textAnchor="middle">ASUNDER</text>
          </g>
          {/* Eagle wing */}
          {[[34,52],[38,55],[35,49],[40,50]].map(([x,y], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              <foreignObject x="-2" y="-2" width="4" height="4">
                <div style={{ color: 'var(--warn)', display: 'flex' }}>
                  <ShipGlyph kind="eagle" size={4} />
                </div>
              </foreignObject>
            </g>
          ))}
          {/* Hammer-pack assault */}
          {[[44,46],[47,44],[50,42],[43,42],[46,40],[49,38]].map(([x,y], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              <foreignObject x="-1.5" y="-1.5" width="3" height="3">
                <div style={{ color: 'var(--warn)', opacity: 0.85, display: 'flex' }}>
                  <ShipGlyph kind="assault" size={3} />
                </div>
              </foreignObject>
            </g>
          ))}
        </g>

        {/* Enemy fleet */}
        <g>
          {/* Kryll capital */}
          <g transform="translate(68, 42)">
            <foreignObject x="-3.5" y="-3.5" width="7" height="7" transform="rotate(180)">
              <div style={{ color: 'var(--crit)', display: 'flex' }}>
                <ShipGlyph kind="destructor" size={7} />
              </div>
            </foreignObject>
            <circle r="4" fill="none" stroke="var(--crit)" strokeWidth="0.15" strokeDasharray="0.4,0.4" />
            <text y="-5" fontFamily="JetBrains Mono" fontSize="1.2" fill="var(--crit)" textAnchor="middle">KRYLL CAPITAL</text>
          </g>
          {/* picket */}
          {[[62,40],[60,44],[64,46],[58,42]].map(([x,y], i) => (
            <g key={i} transform={`translate(${x}, ${y})`}>
              <foreignObject x="-2" y="-2" width="4" height="4" transform="rotate(180)">
                <div style={{ color: 'var(--crit)', opacity: 0.9, display: 'flex' }}>
                  <ShipGlyph kind="eagle" size={4} />
                </div>
              </foreignObject>
            </g>
          ))}
        </g>

        {/* Tracers */}
        <line x1="50" y1="42" x2="60" y2="44" stroke="var(--warn)" strokeWidth="0.18" opacity="0.7" />
        <line x1="47" y1="44" x2="62" y2="40" stroke="var(--warn)" strokeWidth="0.18" opacity="0.5" />
        <line x1="64" y1="46" x2="44" y2="46" stroke="var(--crit)" strokeWidth="0.22" opacity="0.6" />
        <line x1="60" y1="44" x2="38" y2="55" stroke="var(--crit)" strokeWidth="0.18" opacity="0.45" />

        {/* Wreckage marker */}
        <g transform="translate(53, 48)">
          <text fontFamily="JetBrains Mono" fontSize="1.8" fill="oklch(0.55 0.04 30)" textAnchor="middle">✕</text>
          <text y="2.5" fontFamily="JetBrains Mono" fontSize="0.9" fill="oklch(0.46 0.012 240)" textAnchor="middle">wreck</text>
        </g>

        {/* engagement range ring */}
        <circle cx="50" cy="44" r="14" fill="none" stroke="var(--signal-dim)" strokeWidth="0.1" strokeDasharray="0.2,0.4" />
        <text x="50" y="32" fontFamily="JetBrains Mono" fontSize="1.2" fill="oklch(0.55 0.10 200)" textAnchor="middle">↻ ENGAGEMENT ZONE</text>
      </svg>

      {/* Bottom info — engagement summary */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '14px 22px',
        background: 'linear-gradient(0deg, var(--bg-base) 0%, transparent 100%)',
        zIndex: 5,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <div className="panel" style={{ background: 'var(--bg-raised)' }}>
            <div style={{ padding: 10 }}>
              <div className="t-meta">OUR FLEET</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div className="t-data" style={{ fontSize: 20, color: 'var(--warn)' }}>10</div>
                <div className="t-meta">of 11 hulls</div>
              </div>
              <div className="meter warn" style={{ marginTop: 6 }}><div style={{ width: '91%' }} /></div>
            </div>
          </div>
          <div className="panel" style={{ background: 'var(--bg-raised)' }}>
            <div style={{ padding: 10 }}>
              <div className="t-meta">ENEMY FLEET</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div className="t-data" style={{ fontSize: 20, color: 'var(--crit)' }}>5</div>
                <div className="t-meta">of 9 hulls</div>
              </div>
              <div className="meter crit" style={{ marginTop: 6 }}><div style={{ width: '55%' }} /></div>
            </div>
          </div>
          <div className="panel" style={{ background: 'var(--bg-raised)' }}>
            <div style={{ padding: 10 }}>
              <div className="t-meta">PREDICTED OUTCOME</div>
              <div className="t-data" style={{ fontSize: 20, color: 'var(--ally)' }}>WIN 78%</div>
              <div className="t-meta" style={{ color: 'var(--fg-60)' }}>est. 2 more hulls lost</div>
            </div>
          </div>
          <div className="panel" style={{ background: 'var(--bg-raised)' }}>
            <div style={{ padding: 10 }}>
              <div className="t-meta">FED. SCRUTINY</div>
              <div className="t-data" style={{ fontSize: 20, color: 'var(--signal)' }}>SANCTIONED</div>
              <div className="t-meta">CB filed · response to NAP break</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrderPanel() {
  const orders = [
    { id: 'engage', label: 'Engage at will', desc: 'Pick best target per ship', active: true },
    { id: 'focus', label: 'Focus fire', desc: 'All ships → flagged target' },
    { id: 'hold', label: 'Hold position', desc: 'No advance · return fire only' },
    { id: 'evade', label: 'Evasive', desc: '+40% defence · −60% damage' },
    { id: 'retreat', label: 'Retreat to Arch-I', desc: '−1 morale on completion' },
  ];

  const targets = [
    { name: 'Kryll Capital', kind: 'battleship', hp: 62, threat: 'high' },
    { name: 'Kryll Eagle ×4', kind: 'eagle',    hp: 84, threat: 'mid' },
    { name: 'Pyre LASER turret', kind: 'turret', hp: 100, threat: 'low' },
    { name: 'Pyre MISSILE silo', kind: 'silo',   hp: 100, threat: 'high' },
  ];

  return (
    <aside style={{ background: 'var(--bg-base)', borderLeft: '1px solid var(--line-soft)', overflowY: 'auto' }}>
      <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow">ORDERS · STRIKE-1</div>
        <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>Active engagement</div>
      </div>

      <div style={{ padding: 14 }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>STANCE</div>
        {orders.map(o => (
          <button
            key={o.id}
            style={{
              width: '100%', textAlign: 'left',
              padding: '10px 12px',
              background: o.active ? 'var(--warn-bg)' : 'transparent',
              border: '1px solid ' + (o.active ? 'var(--warn-dim)' : 'var(--line-soft)'),
              borderLeftWidth: 2,
              borderLeftColor: o.active ? 'var(--warn)' : 'transparent',
              marginBottom: 4,
              color: o.active ? 'var(--warn)' : 'var(--fg-80)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12 }}>{o.label}</span>
              {o.active && <span className="t-meta" style={{ color: 'var(--warn)' }}>● ACTIVE</span>}
            </div>
            <div className="t-meta" style={{ marginTop: 3 }}>{o.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ padding: 14, borderTop: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>TARGETS · HIGH → LOW</div>
        {targets.map(t => (
          <div key={t.name} style={{
            padding: '8px 10px',
            border: '1px solid var(--line-soft)',
            marginBottom: 4,
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 8,
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--fg-100)' }}>{t.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div className="meter" style={{ width: 80, height: 3 }}>
                  <div style={{ width: `${t.hp}%`, background: t.hp < 50 ? 'var(--crit)' : 'var(--ally)' }} />
                </div>
                <span className="t-meta">{t.hp}%</span>
              </div>
            </div>
            <span className={'tag ' + (t.threat === 'high' ? 'crit' : t.threat === 'mid' ? 'warn' : '')} style={{ fontSize: 8 }}>
              {t.threat.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      <div style={{ padding: 14, borderTop: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>ORBITAL BOMBARDMENT</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button className="btn sm" style={{ justifyContent: 'flex-start', gap: 10 }}>
            <BombardmentGlyph kind="napalm" size={16} />
            <span>Napalm Orb</span>
            <span style={{ marginLeft: 'auto' }} className="t-meta">× 2</span>
          </button>
          <button className="btn sm" style={{ justifyContent: 'flex-start', gap: 10 }}>
            <BombardmentGlyph kind="vortex" size={16} />
            <span>Vortex</span>
            <span style={{ marginLeft: 'auto' }} className="t-meta">× 1</span>
          </button>
          <button className="btn sm crit" style={{ justifyContent: 'flex-start', gap: 10, opacity: 0.7 }}>
            <BombardmentGlyph kind="chaos" size={16} />
            <span>Chaos Bomb</span>
            <span style={{ marginLeft: 'auto' }} className="t-meta">none</span>
          </button>
        </div>
        <div className="t-eyebrow" style={{ marginTop: 16, marginBottom: 8 }}>MISSILE ARSENAL</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {[
            { id: 'basic', n: 12 },
            { id: 'nuke', n: 2 },
            { id: 'stasis', n: 1 },
            { id: 'virus', n: 0 },
            { id: 'mega', n: 0 },
          ].map(m => (
            <div key={m.id} style={{
              width: 56, padding: '8px 6px',
              border: '1px solid var(--line-soft)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              opacity: m.n === 0 ? 0.4 : 1,
              color: m.id === 'virus' ? 'var(--crit)' : 'var(--warn)',
            }}>
              <MissileGlyph kind={m.id} size={20} />
              <span className="t-data" style={{ fontSize: 10, color: m.n > 0 ? 'var(--fg-100)' : 'var(--fg-40)' }}>× {m.n}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function Combat() {
  const [selectedFleet, setSelectedFleet] = React.useState('strike-1');

  return (
    <div className="screen screen-enter" style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', height: '100%' }}>
      <FleetRoster selected={selectedFleet} onSelect={setSelectedFleet} />
      <TacticalViewport />
      <OrderPanel />
    </div>
  );
}
