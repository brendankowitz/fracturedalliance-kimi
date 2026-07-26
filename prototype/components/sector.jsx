// sector.jsx — sector map / asteroid belt overview
// Two-pane layout: left = belt visualization, right = selected asteroid detail
//
// Fog-of-war: only asteroids with revealed===true are drawn. revealed-but-not-
// scouted bodies show as dim "unknown" markers with no deposit/owner info until
// a scout reaches them. Scouts are dispatched from the nearest Helion asteroid.

// Pick the nearest Helion-owned asteroid to act as a scout's launch point.
function nearestHelionAsteroid(targetId) {
  const store = window.GameStore;
  const helion = store.helionAsteroids();
  if (!helion.length) return null;
  let best = helion[0];
  let bestDist = store.asteroidDistance(best.id, targetId);
  for (let i = 1; i < helion.length; i++) {
    const d = store.asteroidDistance(helion[i].id, targetId);
    if (d < bestDist) { best = helion[i]; bestDist = d; }
  }
  return best;
}

function scoutTravelEstimate(targetId) {
  const store = window.GameStore;
  const from = nearestHelionAsteroid(targetId);
  if (!from) return null;
  return Math.max(3, Math.min(20, Math.ceil(store.asteroidDistance(from.id, targetId) / 5)));
}

function SectorMap({ onJumpToColony, setScreen }) {
  const store = window.GameStore;
  const gs = store.state;
  const all = Object.keys(gs.asteroids).map(k => gs.asteroids[k]);
  const revealed = all.filter(a => a.revealed);
  const unrevealedCount = all.filter(a => !a.revealed).length;
  const selectedId = gs.selectedAsteroidId;
  const selected = gs.asteroids[selectedId];
  // Only surface owner identity once the body is scouted.
  const owner = (selected && selected.scouted)
    ? window.GameData.RACES.find(r => r.id === selected.ownerId)
    : null;
  const onSelect = (id) => store.dispatch({ type: 'selectAsteroid', payload: { asteroidId: id } });

  const launchScout = (targetId) => {
    const from = nearestHelionAsteroid(targetId);
    if (!from) return;
    store.dispatch({ type: 'launchScout', payload: { fromAsteroidId: from.id, targetAsteroidId: targetId } });
  };

  return (
    <div className="screen screen-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', height: '100%' }}>
      <SectorCanvas
        asteroids={revealed}
        scouts={gs.scouts}
        unrevealedCount={unrevealedCount}
        selectedId={selectedId}
        onSelect={onSelect}
        setScreen={setScreen}
        onLaunchScout={launchScout}
        gallowEta={typeof gs.gallowEtaDays === 'number' ? Math.ceil(gs.gallowEtaDays) : 0}
      />
      <SectorInspector
        asteroid={selected}
        owner={owner}
        credits={gs.credits}
        onJumpToColony={onJumpToColony}
        onColonize={() => store.dispatch({ type: 'colonize', payload: { asteroidId: selectedId } })}
        onManage={() => { store.dispatch({ type: 'selectAsteroid', payload: { asteroidId: selectedId } }); onJumpToColony(); }}
        onLaunchScout={() => launchScout(selectedId)}
        scoutEta={selected ? scoutTravelEstimate(selected.id) : null}
        scouting={gs.scouts.some(s => s.targetAsteroidId === selectedId)}
        gallowEta={typeof gs.gallowEtaDays === 'number' ? Math.ceil(gs.gallowEtaDays) : 0}
      />
    </div>
  );
}

function SectorCanvas({ asteroids, scouts, unrevealedCount, selectedId, onSelect, setScreen, onLaunchScout, gallowEta }) {
  const store = window.GameStore;
  const charted = asteroids.length;
  const helionCount = asteroids.filter(a => a.ownerId === 'helion').length;
  // Owner/unclaimed counts only consider scouted bodies; the rest are "unknown".
  const scoutedKnown = asteroids.filter(a => a.scouted);
  const unclaimedCount = scoutedKnown.filter(a => !a.ownerId).length;
  const foreignCount = scoutedKnown.filter(a => a.ownerId && a.ownerId !== 'helion').length;
  const unknownBlips = asteroids.filter(a => !a.scouted).length;

  const selected = store.state.asteroids[selectedId];
  const selectedScoutable = selected && selected.revealed && !selected.scouted;
  const activeScouts = scouts.length;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRight: '1px solid var(--line-soft)' }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: 12, left: 16, right: 16, zIndex: 5, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>[ SECTOR 7-DELTA / FRAGMENTED SECTORS ]</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 6, letterSpacing: '-0.02em' }}>Belt Overview</div>
          <div className="t-meta" style={{ marginTop: 4 }}>
            {charted} charted · {helionCount} Helion · {foreignCount} foreign · {unclaimedCount} unclaimed · {unrevealedCount + unknownBlips}? unknown bodies
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn sm ghost">FILTER</button>
          <button className="btn sm ghost">PROBE</button>
          <button
            className="btn sm"
            onClick={() => {
              if (selectedScoutable) onLaunchScout(selectedId);
            }}
            title={selectedScoutable ? 'Dispatch a scout to the selected uncharted body' : 'Select an uncharted body first'}
            style={activeScouts > 0 ? { color: 'var(--warn)' } : null}
          >
            {activeScouts > 0 ? `SCOUTING… ${activeScouts} ACTIVE` : 'LAUNCH SCOUT'}
          </button>
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

        {/* ramming trajectory: GALLOW -> FORGE-3 (only once threat is active) */}
        {gallowEta > 0 && (
          <>
            <line x1="78" y1="38" x2="22" y2="56" stroke="var(--crit)" strokeWidth="0.25" strokeDasharray="1.2,0.6" />
            <text x="50" y="46" fontFamily="JetBrains Mono" fontSize="1.4" fill="var(--crit)" textAnchor="middle">
              ⚠ TRAJ: GALLOW → FORGE-3 · ETA {gallowEta}d
            </text>
          </>
        )}

        {/* active scouts: faint trajectory line + scout ship silhouette pointing toward target */}
        {scouts.map(s => {
          const from = store.state.asteroids[s.fromAsteroidId];
          const to = store.state.asteroids[s.targetAsteroidId];
          if (!from || !to) return null;
          const pct = 1 - (s.daysRemaining / s.totalDays);
          const cx = from.x + (to.x - from.x) * pct;
          const cy = from.y + (to.y - from.y) * pct;
          // Rotate ship to face its destination. The polygon is drawn nose-up (toward y=0),
          // so we add 90° to align with the atan2 convention (0° = east).
          const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI + 90;
          return (
            <g key={s.id}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="var(--warn)" strokeWidth="0.1" strokeDasharray="0.4,0.4" opacity="0.35" />
              {/* Ship body — polygon data matches ShipGlyph 'scout' (32×32 internal space).
                  Scale 0.09 → ~2.9 units wide in the 100-unit viewBox. Centered on cx,cy. */}
              <g transform={`translate(${cx},${cy}) rotate(${angle}) scale(0.09) translate(-16,-13)`}
                 fill="var(--warn)" stroke="var(--warn)" strokeWidth="0.4" strokeLinejoin="miter">
                {/* Main hull */}
                <polygon points="16,4 18,22 14,22" />
                {/* Wing fins */}
                <polygon points="11,18 16,22 21,18 16,21" fillOpacity="0.55" />
                {/* Engine exhaust — pulses */}
                <ellipse cx="16" cy="25" rx="1.2" ry="2.2" stroke="none" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;0.15;0.8" dur="0.85s" repeatCount="indefinite" />
                  <animate attributeName="ry" values="2.2;1.2;2.2" dur="0.85s" repeatCount="indefinite" />
                </ellipse>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Asteroid markers (DOM layer for interactivity) */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {asteroids.map(a => (
          <AsteroidMarker
            key={a.id}
            asteroid={a}
            selected={a.id === selectedId}
            onClick={() => {
              onSelect(a.id);
              // Only jump straight into colony management for our own scouted bases.
              if (a.scouted && a.ownerId === 'helion' && setScreen) setScreen('colony');
            }}
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
        <LegendDot color="var(--fg-20)" label="UNCHARTED" />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 14 }}>
          <span style={{ color: 'var(--fg-60)' }}>ZOOM 1.4×</span>
          <span style={{ color: 'var(--fg-40)' }}>click select · scout to survey</span>
        </div>
      </div>
    </div>
  );
}

function AsteroidMarker({ asteroid, selected, onClick }) {
  const unknown = !asteroid.scouted;
  const ownerRace = window.GameData.RACES.find(r => r.id === asteroid.ownerId);

  // Unscouted bodies render as dim mystery diamonds with no ownership tint.
  if (unknown) {
    const size = 16; // assume M-class footprint until surveyed
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
          opacity: 0.35,
          zIndex: selected ? 10 : 1,
        }}
      >
        {selected && (
          <div style={{
            position: 'absolute',
            width: size + 16,
            height: size + 16,
            border: '1px dashed var(--fg-40)',
            borderRadius: '50%',
            animation: 'pulse 1.6s infinite',
          }} />
        )}
        <div style={{
          width: size,
          height: size,
          background: 'var(--fg-20)',
          clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
          border: '1px dashed var(--fg-30)',
          display: 'grid', placeItems: 'center',
        }} />
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.12em',
          color: selected ? 'var(--warn)' : 'var(--fg-40)',
          textShadow: '0 0 4px oklch(0.14 0.012 240)',
          whiteSpace: 'nowrap',
          marginTop: 2,
        }}>
          ??? <span style={{ color: 'var(--fg-30)', marginLeft: 4 }}>?</span>
        </div>
      </button>
    );
  }

  const size = { S: 12, M: 16, L: 22, XL: 30 }[asteroid.size];
  const color = !ownerRace ? 'var(--fg-40)'
    : asteroid.ownerId === 'helion' ? 'var(--warn)'
    : asteroid.ownerId === 'mauna' ? 'var(--illegal)'
    : ['kryll','motkaj'].includes(asteroid.ownerId) ? 'var(--crit)'
    : 'var(--ally)';

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
      {asteroid.threat === 'ramming' && (
        <div style={{
          position: 'absolute', top: -6, right: -6,
          width: 6, height: 6, background: 'var(--crit)',
          animation: 'pulse 0.6s infinite',
        }} />
      )}
      {asteroid.threat === 'fleet' && (
        <div style={{
          position: 'absolute', top: -4, right: -4,
          width: 4, height: 4, background: 'var(--crit)',
        }} />
      )}
      {asteroid.threat === 'engines' && (
        <div style={{
          position: 'absolute', bottom: -3, left: -3,
          fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--warn)',
        }}>◀◀</div>
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
        {asteroid.name.toUpperCase()}
        <span style={{ color: 'var(--fg-40)', marginLeft: 4 }}>{asteroid.size}</span>
      </div>
    </button>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--fg-80)' }}>
      <span style={{ width: 8, height: 8, background: color }} />
      {label}
    </span>
  );
}

function SectorInspector({ asteroid, owner, credits, onJumpToColony, onColonize, onManage, onLaunchScout, scoutEta, scouting, gallowEta }) {
  if (!asteroid) return null;
  const ores = window.GameData.ORES;
  const isScouted = !!asteroid.scouted;

  // --- Uncharted (revealed but not scouted) body: survey-first view ---------
  if (!isScouted) {
    const canScout = credits >= 800;
    return (
      <aside style={{ background: 'var(--bg-base)', overflowY: 'auto' }}>
        <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
          <div className="t-eyebrow">SECTOR DOSSIER</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em' }}>Unknown Body</div>
            <div className="tag" style={{ color: 'var(--fg-40)', borderColor: 'var(--fg-30)' }}>?-class</div>
          </div>
          <div className="t-meta" style={{ marginTop: 4 }}>
            coord ({asteroid.x.toString().padStart(2,'0')}.{asteroid.y.toString().padStart(2,'0')}) · ? — survey required
          </div>
        </div>

        <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
          <div className="t-eyebrow">OWNERSHIP</div>
          <div style={{ marginTop: 10, color: 'var(--fg-40)' }}>— Uncharted —</div>
        </div>

        <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
          <div className="t-eyebrow">DEPOSITS · GEO SURVEY</div>
          <div style={{ marginTop: 12, color: 'var(--fg-40)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em' }}>
            — GEO SURVEY REQUIRED —
          </div>
        </div>

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="t-eyebrow">ACTIONS</div>
          {scoutEta != null && (
            <div className="t-meta" style={{ marginBottom: 2 }}>~{scoutEta} days from Arch-I</div>
          )}
          {scouting ? (
            <button className="btn" disabled style={{ opacity: 0.6, cursor: 'not-allowed', color: 'var(--warn)' }}>
              ◉ SCOUT EN ROUTE…
            </button>
          ) : (
            <button
              className="btn primary"
              onClick={canScout ? onLaunchScout : undefined}
              disabled={!canScout}
              style={!canScout ? { opacity: 0.5, cursor: 'not-allowed' } : null}
            >
              {canScout ? '◉ LAUNCH SCOUT — 800 cr' : '◉ INSUFFICIENT FUNDS — 800 cr'}
            </button>
          )}
        </div>
      </aside>
    );
  }

  // --- Scouted body: full dossier ------------------------------------------
  const ownerRace = owner;
  const isMine = asteroid.ownerId === 'helion';
  const isUnclaimed = !asteroid.ownerId;
  const canAfford = credits >= 14000;
  const depositList = Object.keys(asteroid.deposits || {});

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
          coord ({asteroid.x.toString().padStart(2,'0')}.{asteroid.y.toString().padStart(2,'0')}) · grid {asteroid.size === 'S' ? '5×5' : asteroid.size === 'M' ? '7×7' : asteroid.size === 'L' ? '9×9' : '11×11'}
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
              <div className="stat-value">{Math.round(asteroid.pop)}</div>
              <div className="stat-label">Population</div>
            </div>
            <div className="stat">
              <div className={'stat-value ' + (asteroid.happiness < 50 ? 'crit' : asteroid.happiness < 70 ? 'warn' : '')}>{Math.round(asteroid.happiness)}</div>
              <div className="stat-label">Happiness</div>
            </div>
            <div className="stat">
              <div className={'stat-value ' + (asteroid.rad > 30 ? 'crit' : asteroid.rad > 10 ? 'warn' : '')}>{Math.round(asteroid.rad)}</div>
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
          {depositList.length === 0 && (
            <div className="t-meta">No surveyed deposits.</div>
          )}
          {depositList.map(d => {
            const ore = ores.find(o => o.id === d);
            if (!ore) return null;
            const yieldVal = Math.round(asteroid.deposits[d]);
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, background: ore.color }} />
                <div style={{ flex: 1, fontSize: 12 }}>{ore.name}</div>
                <div className="t-data" style={{ fontSize: 11, color: 'var(--fg-60)' }}>T{ore.tier}</div>
                <div className="t-data" style={{ fontSize: 11, color: 'var(--fg-80)' }}>{yieldVal}t</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Threat warning */}
      {asteroid.threat !== 'none' && (
        <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)', background: 'var(--crit-bg)' }}>
          <div className="t-eyebrow" style={{ color: 'var(--crit)' }}>⚠ THREAT INTEL</div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--fg-100)' }}>
            {asteroid.threat === 'ramming' && `Incoming asteroid trajectory. ETA ${gallowEta} sim-days. Build Gravity Nullifier or intercept engines.`}
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
            <button className="btn primary" onClick={onManage}>◴ MANAGE COLONY ▸</button>
            <button className="btn">LAUNCH FLEET</button>
            <button className="btn ghost">REASSIGN SUPERVISOR</button>
          </>
        )}
        {isUnclaimed && (
          <>
            <button
              className="btn primary"
              onClick={canAfford ? onColonize : undefined}
              disabled={!canAfford}
              style={!canAfford ? { opacity: 0.5, cursor: 'not-allowed' } : null}
            >
              {canAfford ? '⊕ COLONISE — 14,000 cr' : '⊕ INSUFFICIENT FUNDS — 14,000 cr'}
            </button>
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

Object.assign(window, { SectorMap });
