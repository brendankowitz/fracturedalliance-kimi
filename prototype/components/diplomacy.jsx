// diplomacy.jsx — Diplomatic Affairs screen
// Left: race roster. Center: selected race "ambassador" detail + treaty controls. Right: federation council log.

function Diplomacy() {
  const races = window.GameData.RACES.filter(r => r.id !== 'helion');
  const [selected, setSelected] = React.useState('kryll');
  const sel = races.find(r => r.id === selected);

  return (
    <div className="screen screen-enter" style={{ display: 'grid', gridTemplateColumns: '320px 1fr 360px', height: '100%' }}>
      <RaceRoster races={races} selected={selected} onSelect={setSelected} />
      <AmbassadorPanel race={sel} />
      <CouncilLog />
    </div>
  );
}

function RaceRoster({ races, selected, onSelect }) {
  return (
    <aside style={{ background: 'var(--bg-base)', borderRight: '1px solid var(--line-soft)', overflowY: 'auto' }}>
      <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>DIPLOMATIC AFFAIRS</div>
        <div style={{ fontSize: 20, fontWeight: 500, marginTop: 4, letterSpacing: '-0.02em' }}>Federation Council</div>
        <div className="t-meta" style={{ marginTop: 6 }}>6 charted races · 5 Federation · 1 outlaw</div>
      </div>

      <div style={{ padding: 14 }}>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>RACES</div>
        {races.map(r => (
          <RaceListItem
            key={r.id}
            race={r}
            selected={selected === r.id}
            onClick={() => onSelect(r.id)}
          />
        ))}
      </div>

      <div style={{ padding: 14, borderTop: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow">YOUR STANDING</div>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span style={{ color: 'var(--fg-60)' }}>Corporate Federation</span>
            <span className="t-data" style={{ color: 'var(--ally)' }}>+62</span>
          </div>
          <div className="meter ally" style={{ marginTop: 6 }}>
            <div style={{ width: '81%' }} />
          </div>
          <div className="t-meta" style={{ marginTop: 6 }}>
            +62 / +100 · Holding for 28 days. Corporate victory in <span style={{ color: 'var(--warn)' }}>32 days</span> if held.
          </div>
        </div>
      </div>
    </aside>
  );
}

function RaceListItem({ race, selected, onClick }) {
  const repColor = race.reputation > 30 ? 'var(--ally)'
    : race.reputation < -30 ? 'var(--crit)'
    : race.reputation < 0 ? 'var(--warn)'
    : 'var(--signal)';
  return (
    <button
      onClick={onClick}
      className={`race-${race.id}`}
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '32px 1fr auto',
        alignItems: 'center',
        gap: 12,
        padding: '12px 12px',
        background: selected ? 'var(--bg-elev)' : 'transparent',
        borderLeft: selected ? '2px solid var(--race-color)' : '2px solid transparent',
        textAlign: 'left',
        marginBottom: 4,
      }}
    >
      <div className="race-token" style={{ width: 28, height: 28, fontSize: 11 }}>{race.short}</div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--fg-100)' }}>{race.name}</div>
        <div className="t-meta">{race.title}</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {race.treaties.length === 0 && <span className="t-meta" style={{ color: 'var(--fg-40)' }}>— no treaties —</span>}
          {race.treaties.map(t => (
            <span key={t} className="tag" style={{ fontSize: 8, padding: '1px 5px' }}>{abbreviateTreaty(t)}</span>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="t-data" style={{ fontSize: 16, color: repColor }}>{race.reputation > 0 ? '+' : ''}{race.reputation}</div>
        <div className="t-meta">rep</div>
      </div>
    </button>
  );
}

function abbreviateTreaty(t) {
  return {
    nonAggression: 'NAP',
    noCovert: 'N-COV',
    trade: 'TRADE',
    openBorders: 'BORDER',
    defensivePact: 'DEF',
    jointWar: 'WAR',
    peace: 'PEACE',
  }[t] || t.toUpperCase();
}

function AmbassadorPanel({ race }) {
  if (!race) return <section />;

  const repColor = race.reputation > 30 ? 'var(--ally)'
    : race.reputation < -30 ? 'var(--crit)'
    : race.reputation < 0 ? 'var(--warn)'
    : 'var(--signal)';

  return (
    <section className={`race-${race.id}`} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: 22,
        borderBottom: '1px solid var(--line-soft)',
        background: 'linear-gradient(180deg, var(--race-bg) 0%, transparent 100%)',
      }}>
        <div className="t-eyebrow">[ AMBASSADORIAL CHANNEL ]</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 10 }}>
          <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.025em', color: 'var(--race-color)' }}>{race.name}</div>
          <div style={{ fontSize: 14, color: 'var(--fg-60)' }}>·</div>
          <div style={{ fontSize: 14, color: 'var(--fg-80)' }}>{race.title}</div>
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="t-label">ambassador</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-100)' }}>{race.ambassador}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="t-label">disposition</span>
            <span className="tag" style={{ color: 'var(--race-color)', borderColor: 'var(--race-color)' }}>{race.disposition.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="t-label">federation</span>
            <span className="tag" style={{
              color: race.id === 'mauna' ? 'var(--crit)' : 'var(--ally)',
              borderColor: race.id === 'mauna' ? 'var(--crit-dim)' : 'var(--ally-dim)',
            }}>
              {race.id === 'mauna' ? '✕ OUTLAW' : '◉ MEMBER'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 0 }}>
          {/* Ambassador "portrait" - placeholder */}
          <div style={{ padding: 22, borderRight: '1px solid var(--line-soft)' }}>
            <div className="t-eyebrow">VIDEO LINK</div>
            <div style={{
              marginTop: 12,
              aspectRatio: '4 / 5',
              border: '1px solid var(--line)',
              background: 'var(--bg-input)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Placeholder portrait — diagonal stripes + diegetic frame */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(135deg, transparent 0, transparent 10px, oklch(0.22 0.014 240) 10px, oklch(0.22 0.014 240) 11px)',
              }} />
              <div style={{
                position: 'absolute', inset: 16,
                border: '1px solid var(--race-color)',
                display: 'grid', placeItems: 'center',
              }}>
                <div style={{ textAlign: 'center', color: 'var(--race-color)' }}>
                  <div style={{
                    fontSize: 64,
                    fontWeight: 200,
                    letterSpacing: '0.02em',
                    fontFamily: 'var(--font-display)',
                  }}>{race.short}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--fg-60)', marginTop: 8 }}>
                    [ AMBASSADOR PORTRAIT ]
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--fg-40)', marginTop: 4 }}>
                    placeholder · video link
                  </div>
                </div>
              </div>
              {/* signal indicators */}
              <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ width: 6, height: 6, background: 'var(--crit)', animation: 'pulse 1s infinite' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--crit)', letterSpacing: '0.18em' }}>● REC</span>
              </div>
              <div style={{ position: 'absolute', top: 10, right: 10, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-60)' }}>
                CH.{race.id.toUpperCase().slice(0,3)}
              </div>
              <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-60)' }}>
                <span>{race.ambassador}</span>
                <span>00:01:47</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button className="btn sm" style={{ flex: 1 }}>OPEN CHANNEL</button>
              <button className="btn sm ghost">MUTE</button>
            </div>
            <div className="t-meta" style={{ marginTop: 10, lineHeight: 1.45 }}>
              {race.desc}
            </div>
          </div>

          {/* Treaties + reputation */}
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div className="t-eyebrow">REPUTATION</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 10 }}>
                <div className="t-data" style={{ fontSize: 36, color: repColor }}>{race.reputation > 0 ? '+' : ''}{race.reputation}</div>
                <div className="t-meta">/ 100</div>
              </div>
              {/* Reputation bar (-100 to +100) */}
              <div style={{ marginTop: 12, position: 'relative', height: 18, background: 'var(--bg-input)', border: '1px solid var(--line-soft)' }}>
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--fg-40)' }} />
                <div style={{
                  position: 'absolute',
                  ...(race.reputation >= 0
                    ? { left: '50%', width: `${(race.reputation / 100) * 50}%` }
                    : { right: '50%', width: `${(Math.abs(race.reputation) / 100) * 50}%` }),
                  top: 0, bottom: 0,
                  background: repColor,
                  opacity: 0.7,
                }} />
                <div style={{ position: 'absolute', left: 6, top: 3, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-40)' }}>−100</div>
                <div style={{ position: 'absolute', right: 6, top: 3, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fg-40)' }}>+100</div>
              </div>
              <div className="t-meta" style={{ marginTop: 8 }}>
                Recent: <span style={{ color: 'var(--crit)' }}>−5 council accusation</span> · <span style={{ color: 'var(--ally)' }}>+2 NAP honoured (3 mo.)</span> · <span style={{ color: 'var(--crit)' }}>−12 traded with Mauna</span>
              </div>
            </div>

            <div>
              <div className="t-eyebrow">ACTIVE TREATIES</div>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {race.treaties.length === 0 && (
                  <div style={{ padding: 12, border: '1px dashed var(--line)', color: 'var(--fg-40)', fontSize: 12, textAlign: 'center' }}>
                    — no active treaties —
                  </div>
                )}
                {race.treaties.map(t => (
                  <TreatyRow key={t} kind={t} race={race} />
                ))}
              </div>
            </div>

            <div>
              <div className="t-eyebrow">AVAILABLE ACTIONS</div>
              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <button className="btn sm">PROPOSE TREATY</button>
                <button className="btn sm">SEND GIFT (1,000 cr)</button>
                <button className="btn sm ghost">DEMAND TRIBUTE</button>
                <button className="btn sm ghost">REPORT TO FED</button>
                <button className="btn sm crit">DECLARE WAR</button>
                <button className="btn sm illegal">{race.id === 'mauna' ? 'TRADE ILLEGAL' : 'SABOTAGE'}</button>
              </div>
              {race.id === 'mauna' && (
                <div style={{ marginTop: 10, padding: 10, background: 'var(--illegal-bg)', border: '1px solid var(--illegal-dim)', color: 'var(--illegal)', fontSize: 11, lineHeight: 1.45 }}>
                  ⛧ Any direct trade with Mauna is a Federation Article-12 offence. Suspicion accumulates per transaction.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TreatyRow({ kind, race }) {
  const label = {
    nonAggression: 'Non-Aggression Pact',
    noCovert:      'No-Covert-Action Pact',
    trade:         'Trade Agreement',
    openBorders:   'Open Borders',
    defensivePact: 'Defensive Pact',
    jointWar:      'Joint War',
    peace:         'Peace Treaty',
  }[kind];

  return (
    <div className={`race-${race.id}`} style={{
      display: 'grid', gridTemplateColumns: '1fr auto auto',
      alignItems: 'center', gap: 12,
      padding: '10px 12px',
      background: 'var(--bg-raised)',
      border: '1px solid var(--line-soft)',
      borderLeft: '2px solid var(--race-color)',
    }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--fg-100)' }}>{label}</div>
        <div className="t-meta">Signed T+0218 · 124 days active · Penalty on break: 8,000 cr</div>
      </div>
      <div className="tag ally">ACTIVE</div>
      <button className="btn sm ghost">▸</button>
    </div>
  );
}

function CouncilLog() {
  const log = [
    { t: '0341.06', kind: 'crit',    text: 'Kryll Collective: "Helion radiation pollution violates the Mining Pact, Section 4." (−5 standing)' },
    { t: '0338.12', kind: 'signal',  text: 'Achar Gatherings ratified Trade Agreement. +3 reputation.' },
    { t: '0334.40', kind: 'ally',    text: 'Federation: Quarterly Compliance Review. Result: Pass.' },
    { t: '0331.18', kind: 'warn',    text: 'Motkaj Clans demanded 40t Korellium tribute. Refused. Reputation −8.' },
    { t: '0328.04', kind: 'crit',    text: 'Brakkat Dominion warned of "doubled retaliation" after border incident.' },
    { t: '0322.55', kind: 'illegal', text: 'Anonymous broker offered Mauna shipment route. Logged — no action taken.' },
    { t: '0318.30', kind: 'signal',  text: 'Rigal Conclave shared blueprint discount: Shield x40 (−50%).' },
    { t: '0312.00', kind: 'ally',    text: 'NAP renewed with Achar (+2/mo. retainer).' },
  ];
  return (
    <aside style={{ background: 'var(--bg-base)', borderLeft: '1px solid var(--line-soft)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow">[ COUNCIL LOG ]</div>
        <div className="t-meta" style={{ marginTop: 4 }}>Rolling 24-month event memory</div>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {log.map((e, i) => (
          <div key={i} style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--line-soft)',
            display: 'grid', gridTemplateColumns: '60px 1fr',
            gap: 10,
            fontSize: 11,
          }}>
            <div className="t-meta" style={{ paddingTop: 2 }}>T+{e.t}</div>
            <div style={{
              color: e.kind === 'crit' ? 'var(--crit)'
                : e.kind === 'warn' ? 'var(--warn)'
                : e.kind === 'ally' ? 'var(--ally)'
                : e.kind === 'illegal' ? 'var(--illegal)'
                : 'var(--fg-80)',
              lineHeight: 1.4,
            }}>{e.text}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

Object.assign(window, { Diplomacy });
