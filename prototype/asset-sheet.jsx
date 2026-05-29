// asset-sheet.jsx — Catalog page showing every designed asset

function AssetSheet() {
  return (
    <div style={{
      maxWidth: 1440,
      margin: '0 auto',
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
    }}>
        <header style={{
          padding: '28px 40px 22px',
          borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        }}>
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>HELION INDUSTRIES · INTERNAL DOC F/A-A-001</div>
            <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em', marginTop: 6 }}>
              Asset Library — <span style={{ color: 'var(--warn)' }}>v0.1</span>
            </div>
            <div className="t-meta" style={{ marginTop: 6, maxWidth: 720, lineHeight: 1.55 }}>
              Schematic top-down icon set covering colony structures, hull classes, and ordnance.
              All assets are line-art SVG, inherit color, and are designed at native pixel sizes for the in-game UI.
              No bitmaps. Intended for direct use in build grids, fleet rosters, and Sci-Tek diagrams.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <div className="t-meta">REV</div>
              <div className="t-data" style={{ fontSize: 22, color: 'var(--warn)' }}>04</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="t-meta">SHEETS</div>
              <div className="t-data" style={{ fontSize: 22, color: 'var(--fg-100)' }}>5/5</div>
            </div>
            <a className="btn ghost" href="Fractured Alliance.html">← BACK TO PROTOTYPE</a>
          </div>
        </header>

        <main style={{ padding: '32px 40px' }}>
          {/* COLONY ASSETS — buildings */}
          <Section
            sheet="01"
            title="Colony · Structures (Schematic)"
            subtitle="Top-down schematic glyphs · 24×24 viewBox · used in build grids and palette"
            count="23 icons"
          >
            <BuildingGrid />
          </Section>

          {/* COLONY ASSETS — isometric tiles */}
          <Section
            sheet="01b"
            title="Colony · Structures (Isometric &amp; Animated)"
            subtitle="3/4-perspective building tiles · 48×48 viewBox · three-tone shading with warm interior glow · CSS ambient animations (fan spin, conveyor scroll, plume rise, warn-light blink, vibration, anti-grav waves)"
            count="23 tiles · animated"
          >
            <BuildingTileGrid />
          </Section>

          {/* TACTICAL ASSETS — ships */}
          <Section
            sheet="02"
            title="Tactical · Hull Classes (Animated)"
            subtitle="Top-down silhouettes · 32×32 viewBox · engine plumes pulse out-of-phase, bridge windows + hardpoint cores glow, weapon turrets blink"
            count="7 hulls · animated"
          >
            <ShipGrid />
          </Section>

          {/* TACTICAL ASSETS — ordnance */}
          <Section
            sheet="03"
            title="Tactical · Missile &amp; Bombardment Ordnance (Animated)"
            subtitle="Single-cell ordnance icons · 24×24 viewBox · warhead bursts, rotating crystals and trefoils, dashed exhaust trails, spinning vortex"
            count="9 ordnance · animated"
          >
            <OrdnanceGrid />
          </Section>

          {/* TECH ASSETS — blueprint schematics */}
          <Section
            sheet="04"
            title="Sci-Tek · Blueprint Schematics"
            subtitle="Detail-panel illustrations · 280×200 schematic frames · used on Sci-Tek detail panel"
            count="6 hero panels shown · 24 total in library"
          >
            <SchematicGrid />
          </Section>

          {/* COLOR / TYPE swatches */}
          <Section
            sheet="05"
            title="Tokens · Color &amp; Type"
            subtitle="Signal colors and type ramp used across all assets"
            count=""
          >
            <Tokens />
          </Section>
        </main>

        <footer style={{
          padding: '14px 40px',
          borderTop: '1px solid var(--line)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.14em',
          color: 'var(--fg-40)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>HELION INDUSTRIES · F/A-A-001 · CLEAR — 7</span>
          <span>2026.05.27 · DRAWN BY: HELION SCI-TEK</span>
          <span style={{ color: 'var(--warn)' }}>● APPROVED FOR INTERNAL CIRCULATION</span>
        </footer>
    </div>
  );
}

function Section({ sheet, title, subtitle, count, children }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, paddingBottom: 14, borderBottom: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>SHEET {sheet}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}
               dangerouslySetInnerHTML={{ __html: title }} />
          <div className="t-meta" style={{ marginTop: 4 }}
               dangerouslySetInnerHTML={{ __html: subtitle }} />
        </div>
        <div className="tag warn">{count}</div>
      </div>
      <div style={{ marginTop: 22 }}>{children}</div>
    </section>
  );
}

function BuildingTileGrid() {
  const buildings = window.GameData.BUILDINGS;
  const ANIM_NOTES = {
    cpu:        'antenna pulse · window flicker',
    air:        'fan spin · top-vent exhaust',
    hydration:  'water level lines pulse',
    hydroponics:'plant-row glow pulse',
    living:     'window flicker (staggered)',
    resiblock:  '15 windows flicker independently',
    pleasure:   'center dome pulse + halo',
    medical:    'cross pulse · door flicker',
    security:   'radar dish rotation (14s)',
    radfilter:  'steam plume rises · base warn blink',
    mine1:      'conveyor scroll · headframe pulse',
    mine2:      'twin conveyors · synced winch lamps',
    deep:       'derrick beacon blink',
    seismic:    'whole-rig vibration · 3 red corner lamps',
    power1:     'lightning sigil pulse · chimney rise',
    power2:     'reactor core pulse · dome rings',
    storage:    '4 silo level rings throb',
    laser:      'barrel-tip charge ring · target beam pulse',
    silo:       '4 perimeter warn lights · missile-tip pulse',
    gravnull:   '3 anti-grav waves expand (staggered)',
    shipyard:   'bay door interior glow · roof lights blink',
    dock:       'ring lights blink alternately',
    engine:     '3 thruster plumes pulse out of phase',
  };
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: 1,
      background: 'var(--line-soft)',
      border: '1px solid var(--line-soft)',
    }}>
      {buildings.map(b => (
        <div key={b.id} style={{
          background: 'radial-gradient(ellipse at 35% 60%, oklch(0.22 0.018 240) 0%, var(--bg-base) 75%)',
          padding: '14px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          position: 'relative',
          minHeight: 190,
        }}>
          <BuildingTile id={b.id} size={88} />
          <div style={{ width: '100%', textAlign: 'center', marginTop: 4 }}>
            <div style={{ fontSize: 12, color: 'var(--fg-100)' }}>{b.name}</div>
            <div className="t-meta" style={{ marginTop: 4, color: 'var(--fg-40)' }}>{b.id}</div>
          </div>
          <div style={{
            width: '100%', padding: '6px 8px',
            background: 'oklch(0.16 0.012 240)',
            border: '1px solid var(--line-soft)',
            borderLeft: '2px solid var(--warn)',
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--warn)', letterSpacing: '0.04em',
            textAlign: 'left',
          }}>
            <div style={{ color: 'var(--fg-40)', fontSize: 8, letterSpacing: '0.18em', marginBottom: 2 }}>● ANIM</div>
            {ANIM_NOTES[b.id] || '—'}
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className="tag" style={{ fontSize: 8 }}>{b.cat.toUpperCase()}</span>
            {b.cost > 0 && <span className="tag warn" style={{ fontSize: 8 }}>{b.cost} cr</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function BuildingGrid() {
  const buildings = window.GameData.BUILDINGS;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: 1,
      background: 'var(--line-soft)',
      border: '1px solid var(--line-soft)',
    }}>
      {buildings.map(b => (
        <div key={b.id} style={{
          background: 'var(--bg-base)',
          padding: '18px 14px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <div style={{ color: 'var(--warn)' }}>
            <BuildingGlyph id={b.id} size={56} />
          </div>
          <div style={{ width: '100%', textAlign: 'center', marginTop: 6 }}>
            <div style={{ fontSize: 12, color: 'var(--fg-100)', textAlign: 'center' }}>{b.name}</div>
            <div className="t-meta" style={{ marginTop: 4, color: 'var(--fg-40)' }}>{b.id}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 4, flexWrap: 'wrap' }}>
            <span className="tag" style={{ fontSize: 8 }}>{b.cat.toUpperCase()}</span>
            {b.cost > 0 && <span className="tag warn" style={{ fontSize: 8 }}>{b.cost} cr</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ShipGrid() {
  const ships = window.GameData.SHIP_CLASSES;
  const ANIM = {
    scout:      'single tail thruster pulse · agile drift',
    assault:    'twin engine plumes out of phase',
    eagle:      'bridge cockpit glow · 2 engine plumes',
    battleship: '3 staggered engines · 2 hardpoint warn blinks · bridge glow',
    destructor: '2 engines + side-gun charge cores · alt-blink hardpoints',
    terminator: 'central spine running-light · single heavy thrust',
    cruiser:    '3 engines (center largest) · bridge + 3 turret cores glow',
  };
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 1,
      background: 'var(--line-soft)',
      border: '1px solid var(--line-soft)',
    }}>
      {ships.map(s => (
        <div key={s.id} style={{
          background: 'radial-gradient(ellipse at 50% 40%, oklch(0.20 0.018 240) 0%, var(--bg-base) 80%)',
          padding: 18,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          minHeight: 280,
        }}>
          <div style={{ color: 'var(--warn)' }}>
            <ShipGlyph kind={s.id} size={64} />
          </div>
          <div style={{ width: '100%', textAlign: 'center', marginTop: 6 }}>
            <div style={{ fontSize: 12, color: 'var(--fg-100)' }}>{s.name}</div>
            <div className="t-meta" style={{ marginTop: 4 }}>{s.id}</div>
          </div>
          <table style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-60)', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td>HP</td><td style={{ textAlign: 'right', color: 'var(--fg-100)' }}>{s.hp}</td></tr>
              <tr><td>SHD</td><td style={{ textAlign: 'right', color: 'var(--fg-100)' }}>{s.shield}</td></tr>
              <tr><td>SPD</td><td style={{ textAlign: 'right', color: 'var(--fg-100)' }}>{s.speed}</td></tr>
              <tr><td>DMG</td><td style={{ textAlign: 'right', color: 'var(--warn)' }}>{s.dmg}</td></tr>
            </tbody>
          </table>
          <div style={{
            width: '100%', padding: '6px 8px',
            background: 'oklch(0.16 0.012 240)',
            border: '1px solid var(--line-soft)',
            borderLeft: '2px solid var(--warn)',
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--warn)', textAlign: 'left',
            marginTop: 'auto',
          }}>
            <div style={{ color: 'var(--fg-40)', fontSize: 8, letterSpacing: '0.18em', marginBottom: 2 }}>● ANIM</div>
            {ANIM[s.id]}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrdnanceGrid() {
  const missiles = [
    { id: 'basic', name: 'Basic Missile', kind: 'missile', tag: 'standard',  anim: 'dashed exhaust trail' },
    { id: 'nuke',  name: 'Nuclear',       kind: 'missile', tag: 'fed-alert', anim: 'warhead burst pulse + thick trail' },
    { id: 'mega',  name: 'Mega',          kind: 'missile', tag: 'heavy',     anim: '2-stage flame plume' },
    { id: 'stasis',name: 'Stasis',        kind: 'missile', tag: 'control',   anim: 'crystal cross spins · core throb' },
    { id: 'virus', name: 'Virus',         kind: 'missile', tag: 'trap-tier', anim: 'biohazard trefoil rotates slowly' },
    { id: 'nexos', name: 'Nexos Warhead', kind: 'missile', tag: 'apocalypse',anim: 'aura pulse + warhead burst' },
    { id: 'napalm',name: 'Napalm Orb',    kind: 'bomb',    tag: 'orbital',   anim: 'flame body pulses · halo dashes' },
    { id: 'vortex',name: 'Vortex',        kind: 'bomb',    tag: 'orbital',   anim: 'spiral spins (1.2s, fast)' },
    { id: 'chaos', name: 'Chaos Bomb',    kind: 'bomb',    tag: 'orbital',   anim: 'star flickers · core throb' },
  ];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(9, 1fr)',
      gap: 1,
      background: 'var(--line-soft)',
      border: '1px solid var(--line-soft)',
    }}>
      {missiles.map(m => (
        <div key={m.id} style={{
          background: 'radial-gradient(ellipse at 50% 40%, oklch(0.20 0.018 240) 0%, var(--bg-base) 80%)',
          padding: '16px 10px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          minHeight: 230,
        }}>
          <div style={{
            color: m.tag === 'trap-tier' ? 'var(--crit)'
              : m.tag === 'apocalypse' ? 'var(--illegal)'
              : 'var(--warn)',
            paddingTop: 6,
          }}>
            {m.kind === 'missile' ? <MissileGlyph kind={m.id} size={48} /> : <BombardmentGlyph kind={m.id} size={48} />}
          </div>
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--fg-100)' }}>{m.name}</div>
            <div className="t-meta" style={{ marginTop: 4, fontSize: 9 }}>{m.tag}</div>
          </div>
          <div style={{
            width: '100%', padding: '6px 7px',
            background: 'oklch(0.16 0.012 240)',
            border: '1px solid var(--line-soft)',
            borderLeft: '2px solid var(--warn)',
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--warn)', textAlign: 'left',
            marginTop: 'auto',
          }}>
            <div style={{ color: 'var(--fg-40)', fontSize: 8, letterSpacing: '0.16em', marginBottom: 2 }}>● ANIM</div>
            {m.anim}
          </div>
        </div>
      ))}
    </div>
  );
}

function SchematicGrid() {
  const heroes = [
    { id: 'mk2mine',   name: 'Mine Mk2',             disc: 'Extraction', tier: 1 },
    { id: 'seismic',   name: 'Seismic Penetrator',   disc: 'Extraction', tier: 2 },
    { id: 'hep',       name: 'High-Energy Power',    disc: 'Power',      tier: 2 },
    { id: 'engine',    name: 'Asteroid Engine',      disc: 'Offence',    tier: 4 },
    { id: 'nuke',      name: 'Nuclear Missile',      disc: 'Offence',    tier: 2 },
    { id: 'gravnull',  name: 'Gravity Nullifier',    disc: 'Defence',    tier: 3 },
  ];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 14,
    }}>
      {heroes.map(h => (
        <div key={h.id} style={{ background: 'var(--bg-base)', border: '1px solid var(--line-soft)' }}>
          <BlueprintSchematic bpId={h.id} />
          <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 14, color: 'var(--fg-100)' }}>{h.name}</div>
              <div className="t-meta" style={{ marginTop: 4 }}>{h.disc} · Tier {h.tier}</div>
            </div>
            <span className="tag warn">T{h.tier}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Tokens() {
  const palette = [
    { name: 'bg-void',    var: '--bg-void',    note: 'deep space' },
    { name: 'bg-base',    var: '--bg-base',    note: 'main panel' },
    { name: 'bg-raised',  var: '--bg-raised',  note: 'card' },
    { name: 'fg-100',     var: '--fg-100',     note: 'warm off-white' },
    { name: 'fg-60',      var: '--fg-60',      note: 'secondary' },
    { name: 'fg-40',      var: '--fg-40',      note: 'meta' },
    { name: 'warn',       var: '--warn',       note: 'Helion brand' },
    { name: 'signal',     var: '--signal',     note: 'info / interactive' },
    { name: 'ally',       var: '--ally',       note: 'green / treaty' },
    { name: 'crit',       var: '--crit',       note: 'red / hostile' },
    { name: 'illegal',    var: '--illegal',    note: 'magenta / off-books' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
      <div>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>PALETTE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, background: 'var(--line-soft)', border: '1px solid var(--line-soft)' }}>
          {palette.map(p => (
            <div key={p.name} style={{
              background: 'var(--bg-base)',
              padding: 12,
              display: 'grid', gridTemplateColumns: '36px 1fr',
              gap: 12, alignItems: 'center',
            }}>
              <div style={{ width: 36, height: 36, background: `var(${p.var})`, border: '1px solid var(--line)' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-100)' }}>{p.name}</div>
                <div className="t-meta" style={{ marginTop: 3 }}>{p.note} · {p.var}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="t-eyebrow" style={{ marginBottom: 14 }}>TYPE</div>
        <div style={{ background: 'var(--bg-base)', border: '1px solid var(--line-soft)', padding: 22 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1 }}>
            FRACTURED // ALLIANCE
          </div>
          <div className="t-meta" style={{ marginTop: 4 }}>Space Grotesk 600 · 48px · -2.5% tracking</div>

          <div style={{ marginTop: 24, fontFamily: 'Space Grotesk', fontSize: 24, letterSpacing: '-0.02em' }}>
            Belt Overview
          </div>
          <div className="t-meta" style={{ marginTop: 4 }}>Space Grotesk 500 · 24px · screen titles</div>

          <div style={{ marginTop: 24, fontFamily: 'Space Grotesk', fontSize: 13, color: 'var(--fg-80)' }}>
            Mining megacorp. Federation member. You report to the Board.
          </div>
          <div className="t-meta" style={{ marginTop: 4 }}>Space Grotesk 400 · 13px · body</div>

          <div style={{ marginTop: 24, fontFamily: 'JetBrains Mono', fontSize: 14, color: 'var(--warn)' }}>
            142,840 cr · T+0341
          </div>
          <div className="t-meta" style={{ marginTop: 4 }}>JetBrains Mono 500 · data &amp; numerics</div>

          <div style={{ marginTop: 24, fontFamily: 'JetBrains Mono', fontSize: 10, letterSpacing: '0.16em', color: 'var(--fg-40)' }}>
            [ EYEBROW / LABEL ]
          </div>
          <div className="t-meta" style={{ marginTop: 4 }}>JetBrains Mono 500 · 10px · +16% tracking · uppercase</div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AssetSheet />);
