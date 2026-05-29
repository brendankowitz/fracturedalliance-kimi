import { useGameStore } from '../../store/gameStore';
import { RACES, ORES } from '../../data/gameData';
import { byId } from '../../data/gameData';
import type { AsteroidState } from '../../sim/types';
import type { RaceDef } from '../../types';

export function SectorMap() {
  const selectedId = useGameStore((s) => s.selectedAsteroid);
  const setSelectedAsteroid = useGameStore((s) => s.setSelectedAsteroid);
  const setScreen = useGameStore((s) => s.setScreen);
  const asteroids = useGameStore((s) => s.asteroids);

  const selected = asteroids.find((a) => a.id === selectedId);
  const owner = selected?.ownerId ? byId(RACES, selected.ownerId) : undefined;

  return (
    <div className="screen screen-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', height: '100%' }}>
      <SectorCanvas
        asteroids={asteroids}
        selectedId={selectedId}
        onSelect={(id: string) => setSelectedAsteroid(id)}
      />
      <SectorInspector
        asteroid={selected}
        owner={owner}
        onJumpToColony={() => {
          if (selected) {
            setSelectedAsteroid(selected.id);
          }
          setScreen('colony');
        }}
      />
    </div>
  );
}

function SectorCanvas({
  asteroids,
  selectedId,
  onSelect,
}: {
  asteroids: AsteroidState[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRight: '1px solid var(--line-soft)' }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 12, left: 16, right: 16, zIndex: 5, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>[ SECTOR 7-DELTA / FRAGMENTED SECTORS ]</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em' }}>Belt Overview</div>
          <div className="t-meta" style={{ marginTop: 4 }}>{asteroids.length} charted bodies</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn sm ghost">FILTER</button>
          <button className="btn sm ghost">PROBE</button>
          <button className="btn sm">LAUNCH SCOUT</button>
        </div>
      </div>

      {/* Grid backdrop */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="oklch(0.28 0.014 240)" strokeWidth="0.08" />
          </pattern>
          <pattern id="gridMajor" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="oklch(0.34 0.018 240)" strokeWidth="0.15" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        <rect width="100" height="100" fill="url(#gridMajor)" />

        {/* sector axes labels */}
        <text x="2" y="4" fontFamily="JetBrains Mono" fontSize="1.6" fill="oklch(0.40 0.012 240)">α</text>
        <text x="48" y="4" fontFamily="JetBrains Mono" fontSize="1.6" fill="oklch(0.40 0.012 240)">β</text>
        <text x="94" y="4" fontFamily="JetBrains Mono" fontSize="1.6" fill="oklch(0.40 0.012 240)">γ</text>

        {/* trade routes (decorative) */}
        <line x1="26" y1="38" x2="22" y2="56" stroke="var(--warn)" strokeWidth="0.15" strokeDasharray="0.6,0.6" opacity="0.45" />
        <line x1="26" y1="38" x2="34" y2="32" stroke="var(--warn)" strokeWidth="0.15" strokeDasharray="0.6,0.6" opacity="0.45" />
        <line x1="26" y1="38" x2="14" y2="28" stroke="var(--warn)" strokeWidth="0.15" strokeDasharray="0.6,0.6" opacity="0.45" />
        <line x1="26" y1="38" x2="60" y2="48" stroke="var(--ally)" strokeWidth="0.15" strokeDasharray="0.6,0.6" opacity="0.6" />

        {/* ramming trajectory: GALLOW -> FORGE-3 */}
        <line x1="78" y1="38" x2="22" y2="56" stroke="var(--crit)" strokeWidth="0.25" strokeDasharray="1.2,0.6" />
        <text x="50" y="46" fontFamily="JetBrains Mono" fontSize="1.4" fill="var(--crit)" textAnchor="middle">
          ⚠ TRAJ: GALLOW → FORGE-3 · ETA 42d
        </text>
      </svg>

      {/* Asteroid markers (DOM layer for interactivity) */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {asteroids.map((a) => (
          <AsteroidMarker
            key={a.id}
            asteroid={a}
            selected={a.id === selectedId}
            onClick={() => onSelect(a.id)}
          />
        ))}
      </div>

      {/* Bottom legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, right: 16,
        display: 'flex', gap: 16, alignItems: 'center',
        padding: '10px 14px',
        background: 'oklch(0.16 0.012 240 / 0.85)',
        border: '1px solid var(--line-soft)',
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
      }}>
        <span style={{ color: 'var(--fg-40)' }}>LEGEND</span>
        <LegendDot color="var(--warn)" label="HELION" />
        <LegendDot color="var(--ally)" label="ALLY" />
        <LegendDot color="var(--crit)" label="HOSTILE" />
        <LegendDot color="var(--illegal)" label="OUTLAW" />
        <LegendDot color="var(--fg-40)" label="UNCLAIMED" />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 14 }}>
          <span style={{ color: 'var(--fg-60)' }}>ZOOM 1.4×</span>
          <span style={{ color: 'var(--fg-40)' }}>WASD pan · scroll zoom · click select</span>
        </div>
      </div>
    </div>
  );
}

function AsteroidMarker({
  asteroid,
  selected,
  onClick,
}: {
  asteroid: AsteroidState;
  selected: boolean;
  onClick: () => void;
}) {
  const size = { S: 12, M: 16, L: 22, XL: 30 }[asteroid.size ?? 'M'];
  const color = !asteroid.ownerId
    ? 'var(--fg-40)'
    : asteroid.ownerId === 'helion'
      ? 'var(--warn)'
      : asteroid.ownerId === 'mauna'
        ? 'var(--crit)'
        : 'var(--signal)';

  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${asteroid.x}%`,
        top: `${asteroid.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        background: 'transparent',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        padding: 0,
        zIndex: selected ? 10 : 2,
      }}
    >
      {/* selection ring */}
      {selected && (
        <div style={{
          position: 'absolute',
          width: size + 16,
          height: size + 16,
          border: '1px solid var(--warn)',
          borderRadius: '50%',
          animation: 'pulse 1.6s infinite',
        }} />
      )}
      {/* asteroid body */}
      <div style={{
        width: size,
        height: size,
        background: asteroid.status === 'unclaimed' ? 'transparent' : color,
        opacity: asteroid.status === 'unclaimed' ? 0.5 : 1,
        clipPath: asteroid.size === 'XL'
          ? 'polygon(20% 0, 80% 0, 100% 30%, 100% 70%, 80% 100%, 20% 100%, 0 70%, 0 30%)'
          : asteroid.size === 'L'
            ? 'polygon(25% 0, 75% 0, 100% 40%, 75% 100%, 25% 100%, 0 40%)'
            : asteroid.size === 'M'
              ? 'polygon(30% 0, 70% 0, 100% 50%, 70% 100%, 30% 100%, 0 50%)'
              : 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
        border: asteroid.status === 'unclaimed' ? `1px dashed var(--fg-40)` : 'none',
        boxShadow: selected ? `0 0 12px ${color}` : 'none',
      }} />
      {/* threat indicator */}
      {asteroid.threat && asteroid.threat !== 'none' && (
        <div style={{
          position: 'absolute', top: -6, right: -6,
          width: 8, height: 8, background: 'var(--crit)',
          borderRadius: '50%',
          animation: 'pulse 0.8s infinite',
        }} />
      )}
      {/* name */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.12em',
        color: selected ? 'var(--warn)' : 'var(--fg-60)',
        textShadow: '0 0 4px oklch(0.14 0.012 240)',
        whiteSpace: 'nowrap',
        marginTop: 2,
      }}>
        {(asteroid.name ?? asteroid.id).toUpperCase()}
        <span style={{ color: 'var(--fg-40)', marginLeft: 4 }}>{asteroid.size}</span>
      </div>
    </button>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg-80)' }}>
      <span style={{ width: 8, height: 8, background: color }} />
      {label}
    </span>
  );
}

function SectorInspector({
  asteroid,
  owner,
  onJumpToColony,
}: {
  asteroid: AsteroidState | undefined;
  owner: RaceDef | undefined;
  onJumpToColony: () => void;
}) {
  if (!asteroid) return null;
  const ownerRace = owner;
  const isMine = asteroid.ownerId === 'helion';
  const isUnclaimed = !asteroid.ownerId;

  return (
    <aside style={{ background: 'var(--bg-base)', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow">SECTOR DOSSIER</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
          <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>{asteroid.name}</div>
          <div className="tag warn">{asteroid.size}-class</div>
        </div>
        <div className="t-meta" style={{ marginTop: 4 }}>
          coord ({(asteroid.x ?? 0).toString().padStart(2, '0')}.{(asteroid.y ?? 0).toString().padStart(2, '0')}) · grid {asteroid.size === 'S' ? '5×5' : asteroid.size === 'M' ? '7×7' : asteroid.size === 'L' ? '9×9' : '11×11'}
        </div>
      </div>

      {/* Owner */}
      <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow">OWNERSHIP</div>
        {ownerRace ? (
          <div className={`race-${ownerRace.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <div className="race-token">{ownerRace.short}</div>
            <div>
              <div style={{ fontSize: 14 }}>{ownerRace.name}</div>
              <div className="t-meta">{ownerRace.title}</div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 10, color: 'var(--fg-60)' }}>— UNCLAIMED · open for colonisation —</div>
        )}
      </div>

      {/* Stats grid */}
      {!isUnclaimed && (
        <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
          <div className="t-eyebrow">VITALS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 12 }}>
            <div className="stat">
              <div className="stat-value">{asteroid.resources.pop}</div>
              <div className="stat-label">Population</div>
            </div>
            <div className="stat">
              <div className={'stat-value ' + (asteroid.resources.happiness < 50 ? 'crit' : asteroid.resources.happiness < 70 ? 'warn' : '')}>{asteroid.resources.happiness}</div>
              <div className="stat-label">Happiness</div>
            </div>
            <div className="stat">
              <div className={'stat-value ' + (asteroid.resources.rad > 30 ? 'crit' : asteroid.resources.rad > 10 ? 'warn' : '')}>{asteroid.resources.rad}</div>
              <div className="stat-label">Radiation</div>
            </div>
            <div className="stat">
              <div className="stat-value">{asteroid.status === 'building' ? '▰▰▱▱' : '████'}</div>
              <div className="stat-label">Stability</div>
            </div>
          </div>
        </div>
      )}

      {/* Deposits */}
      <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow">DEPOSITS · GEO SURVEY</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
          {(asteroid.deposits ?? []).map((d) => {
            const ore = ORES.find((o) => o.id === d);
            const yieldVal = Math.round(Math.random() * 800 + 200); // mock
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, background: ore?.color }} />
                <div style={{ flex: 1, fontSize: 12 }}>{ore?.name}</div>
                <div className="t-data" style={{ fontSize: 11, color: 'var(--fg-60)' }}>T{ore?.tier}</div>
                <div className="t-data" style={{ fontSize: 11, color: 'var(--fg-80)' }}>{yieldVal}t</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Threat warning */}
      {asteroid.threat && asteroid.threat !== 'none' && (
        <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)', background: 'var(--crit-bg)' }}>
          <div className="t-eyebrow" style={{ color: 'var(--crit)' }}>⚠ THREAT INTEL</div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--fg-100)' }}>
            {asteroid.threat === 'ramming' && 'Incoming asteroid trajectory. ETA 42 sim-days. Build Gravity Nullifier or intercept engines.'}
            {asteroid.threat === 'fleet' && 'Hostile fleet sighted in adjacent sector. 6 hulls, mixed class.'}
            {asteroid.threat === 'engines' && 'Your asteroid has armed engines — ready to ram or relocate.'}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="t-eyebrow">ACTIONS</div>
        {isMine && (
          <>
            <button className="btn primary" onClick={onJumpToColony}>◴ MANAGE COLONY ▸</button>
            <button className="btn">LAUNCH FLEET</button>
            <button className="btn ghost">REASSIGN SUPERVISOR</button>
          </>
        )}
        {isUnclaimed && (
          <>
            <button className="btn primary">⊕ COLONISE — 14,000 cr</button>
            <button className="btn ghost">DETAILED GEO SURVEY — 800 cr</button>
          </>
        )}
        {!isMine && !isUnclaimed && (
          <>
            <button className="btn">OPEN DIPLOMACY</button>
            <button className="btn signal">LAUNCH SPY PROBE</button>
            <button className="btn crit">DECLARE ATTACK</button>
          </>
        )}
      </div>
    </aside>
  );
}
