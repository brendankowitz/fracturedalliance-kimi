import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { RACES, ORES } from '../../data/gameData';
import { byId } from '../../data/gameData';
import type { AsteroidState } from '../../sim/types';
import type { MarketState } from '../../sim/market';
import type { RaceDef } from '../../types';
import { BeltCanvas } from './BeltCanvas';

export function SectorMap() {
  const selectedId = useGameStore((s) => s.selectedAsteroid);
  const setSelectedAsteroid = useGameStore((s) => s.setSelectedAsteroid);
  const setScreen = useGameStore((s) => s.setScreen);
  const asteroids = useGameStore((s) => s.asteroids);
  const market = useGameStore((s) => s.market);

  const selected = asteroids.find((a) => a.id === selectedId);
  const owner = selected?.ownerId ? byId(RACES, selected.ownerId) : undefined;

  return (
    <div className="screen screen-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', height: '100%' }}>
      <SectorCanvas
        asteroids={asteroids}
        market={market}
        selectedId={selectedId}
        onSelect={(id: string) => setSelectedAsteroid(id)}
        onJumpToColony={(id: string) => {
          setSelectedAsteroid(id);
          setScreen('colony');
        }}
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
  market,
  selectedId,
  onSelect,
  onJumpToColony,
}: {
  asteroids: AsteroidState[];
  market: MarketState;
  selectedId: string;
  onSelect: (id: string) => void;
  onJumpToColony: (id: string) => void;
}) {
  const [zoom, setZoom] = useState(1);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRight: '1px solid var(--line-soft)' }}>
      {/* Rendered belt: starfield + rock sprites + ship lanes */}
      <BeltCanvas
        asteroids={asteroids}
        market={market}
        selectedId={selectedId}
        onSelect={onSelect}
        onJumpToColony={onJumpToColony}
        onZoomChange={setZoom}
      />

      {/* Header */}
      <div style={{ position: 'absolute', top: 12, left: 16, right: 16, zIndex: 5, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div>
          <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>[ SECTOR 7-DELTA / FRAGMENTED SECTORS ]</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em' }}>Belt Overview</div>
          <div className="t-meta" style={{ marginTop: 4 }}>{asteroids.length} charted bodies</div>
        </div>
        <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
          <button className="btn sm ghost">FILTER</button>
          <button className="btn sm ghost">PROBE</button>
          <button className="btn sm">LAUNCH SCOUT</button>
        </div>
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
          <span style={{ color: 'var(--fg-60)' }}>ZOOM {zoom.toFixed(1)}×</span>
          <span style={{ color: 'var(--fg-40)' }}>drag pan · scroll zoom · click select · dbl-click colony</span>
        </div>
      </div>
    </div>
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
            const yieldVal = 400; // deterministic mock
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
