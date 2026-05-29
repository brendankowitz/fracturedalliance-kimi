// espionage.jsx — Black Cell / espionage panel
// Diegetic frame: this is "off-the-books" so the whole screen takes an illegal/magenta tint.

function Espionage() {
  const agents = window.GameData.AGENTS;
  const [selectedAgent, setSelectedAgent] = React.useState('mira');
  const sel = agents.find(a => a.id === selectedAgent);

  const missionTypes = [
    { id: 'recon',   label: 'Recon',           cost: '0.5× fee', success: 78, gain: 'reveal grid' },
    { id: 'tech',    label: 'Tech-Steal',      cost: '1.0× fee', success: 52, gain: '50% blueprint discount' },
    { id: 'sabo-ls', label: 'Sabotage · Life-Support', cost: '1.4× fee', success: 38, gain: 'destroys colony', danger: true },
    { id: 'sabo-pw', label: 'Sabotage · Power',cost: '1.2× fee', success: 56, gain: 'disables grid 12 days' },
    { id: 'sabo-df', label: 'Sabotage · Defence', cost: '1.2× fee', success: 48, gain: 'disables turrets 8 days' },
    { id: 'sabo-sh', label: 'Sabotage · Ship Yard', cost: '1.3× fee', success: 42, gain: 'halts production 16 days' },
    { id: 'black',   label: 'Blackmail',       cost: '1.8× fee', success: 32, gain: 'tribute 6,000–18,000 cr', danger: true },
    { id: 'flip',    label: 'Liberate colony', cost: '2.0× fee', success: 26, gain: 'flips colony to Helion', danger: true },
  ];

  return (
    <div className="screen screen-enter" style={{
      display: 'grid', gridTemplateColumns: '320px 1fr 360px',
      height: '100%',
      position: 'relative',
    }}>
      {/* Tint overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 30%, oklch(0.18 0.04 330 / 0.20) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <AgentRoster agents={agents} selected={selectedAgent} onSelect={setSelectedAgent} />
      <OperationsCenter agent={sel} missions={missionTypes} />
      <CounterIntelLog />
    </div>
  );
}

function AgentRoster({ agents, selected, onSelect }) {
  return (
    <aside style={{ background: 'var(--bg-base)', borderRight: '1px solid var(--illegal-dim)', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
      <div style={{ padding: 18, borderBottom: '1px solid var(--illegal-dim)' }}>
        <div className="t-eyebrow" style={{ color: 'var(--illegal)' }}>⛧ BLACK CELL</div>
        <div style={{ fontSize: 20, fontWeight: 500, marginTop: 4, letterSpacing: '-0.02em' }}>Office of Covert Action</div>
        <div className="t-meta" style={{ marginTop: 6 }}>
          <span style={{ color: 'var(--illegal)' }}>OFF-BOOKS</span> · this screen does not exist
        </div>
      </div>

      <div style={{ padding: 14, borderBottom: '1px solid var(--line-soft)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="t-meta">Agents</span>
          <span className="t-meta" style={{ color: 'var(--fg-100)' }}>{agents.length} on payroll</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="t-meta">Idle</span>
          <span className="t-meta" style={{ color: 'var(--ally)' }}>{agents.filter(a => a.status === 'idle').length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="t-meta">On mission</span>
          <span className="t-meta" style={{ color: 'var(--warn)' }}>{agents.filter(a => a.status === 'mission').length}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="t-meta">Captured</span>
          <span className="t-meta" style={{ color: 'var(--crit)' }}>{agents.filter(a => a.status === 'captured').length}</span>
        </div>
      </div>

      <div>
        {agents.map(a => (
          <AgentRow
            key={a.id}
            agent={a}
            selected={selected === a.id}
            onClick={() => onSelect(a.id)}
          />
        ))}
      </div>

      <div style={{ padding: 14, borderTop: '1px solid var(--line-soft)' }}>
        <button className="btn illegal sm" style={{ width: '100%' }}>+ RECRUIT NEW AGENT — 12,000 cr</button>
      </div>
    </aside>
  );
}

function AgentRow({ agent, selected, onClick }) {
  const statusColor = {
    idle: 'var(--ally)',
    mission: 'var(--warn)',
    cooldown: 'var(--signal)',
    captured: 'var(--crit)',
  }[agent.status];

  return (
    <button
      onClick={onClick}
      disabled={agent.status === 'captured'}
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '32px 1fr auto',
        gap: 12,
        padding: '12px 14px',
        background: selected ? 'oklch(0.22 0.06 330 / 0.5)' : 'transparent',
        borderBottom: '1px solid var(--line-soft)',
        borderLeft: selected ? '2px solid var(--illegal)' : '2px solid transparent',
        textAlign: 'left',
        opacity: agent.status === 'captured' ? 0.4 : 1,
      }}
    >
      <div style={{
        width: 28, height: 28,
        background: 'var(--illegal-bg)',
        border: '1px solid var(--illegal-dim)',
        display: 'grid', placeItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--illegal)',
      }}>
        {agent.name.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--fg-100)' }}>{agent.name}</div>
        <div className="t-meta">{agent.loc} · {agent.fee} cr/op</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 9, fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--fg-40)' }}>STH</span><span style={{ color: 'var(--fg-100)' }}>{agent.stealth}</span>
          <span style={{ color: 'var(--fg-40)' }}>SAB</span><span style={{ color: 'var(--fg-100)' }}>{agent.sab}</span>
          <span style={{ color: 'var(--fg-40)' }}>INT</span><span style={{ color: 'var(--fg-100)' }}>{agent.intel}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <span style={{ width: 6, height: 6, background: statusColor, boxShadow: `0 0 4px ${statusColor}` }} />
        <span className="t-meta" style={{ fontSize: 8, color: statusColor }}>{agent.status.toUpperCase()}</span>
      </div>
    </button>
  );
}

function OperationsCenter({ agent, missions }) {
  if (!agent) return <section />;
  const [target, setTarget] = React.useState('kryll');
  const [selectedMission, setSelectedMission] = React.useState('recon');
  const races = window.GameData.RACES.filter(r => r.id !== 'helion');

  const mission = missions.find(m => m.id === selectedMission);

  return (
    <section style={{ position: 'relative', zIndex: 1, padding: 24, overflowY: 'auto' }}>
      {/* Agent header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22, paddingBottom: 22, borderBottom: '1px solid var(--illegal-dim)' }}>
        <div style={{
          width: 96, height: 96,
          background: 'var(--bg-input)',
          border: '1px solid var(--illegal-dim)',
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent 0px, transparent 4px, oklch(0.22 0.014 240) 4px, oklch(0.22 0.014 240) 5px)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: 6, border: '1px solid var(--illegal)', display: 'grid', placeItems: 'center' }}>
            <div style={{ fontSize: 28, color: 'var(--illegal)', fontFamily: 'var(--font-mono)' }}>{agent.name.split(' ').map(n => n[0]).join('')}</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow" style={{ color: 'var(--illegal)' }}>OPERATIVE PROFILE [REDACTED]</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 6 }}>
            <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em' }}>{agent.name}</div>
            <span className="tag illegal">CLEARANCE 7</span>
          </div>
          <div className="t-meta" style={{ marginTop: 6 }}>
            Last loc: {agent.loc} · Joined Helion: 14 days ago · Languages: 4 · Cover: Achar trader
          </div>
          {/* skill bars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 14 }}>
            <SkillBar label="STEALTH"  value={agent.stealth} />
            <SkillBar label="SABOTAGE" value={agent.sab} />
            <SkillBar label="INTEL"    value={agent.intel} />
          </div>
        </div>
        <div>
          <button className="btn illegal sm">DISMISS</button>
        </div>
      </div>

      {/* Mission planner */}
      <div style={{ paddingTop: 22 }}>
        <div className="t-eyebrow" style={{ color: 'var(--illegal)' }}>MISSION PLANNER</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginTop: 14 }}>
          {/* Target */}
          <div>
            <div className="t-label" style={{ marginBottom: 8 }}>TARGET RACE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {races.map(r => (
                <button
                  key={r.id}
                  onClick={() => setTarget(r.id)}
                  className={`race-${r.id}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '24px 1fr',
                    alignItems: 'center', gap: 8,
                    padding: '8px 10px',
                    background: target === r.id ? 'var(--race-bg)' : 'transparent',
                    border: '1px solid ' + (target === r.id ? 'var(--race-color)' : 'var(--line-soft)'),
                    textAlign: 'left',
                  }}
                >
                  <div className="race-token" style={{ width: 22, height: 22, fontSize: 9 }}>{r.short}</div>
                  <span style={{ fontSize: 11, color: 'var(--fg-100)' }}>{r.name}</span>
                </button>
              ))}
            </div>
            <div className="t-meta" style={{ marginTop: 10, padding: 10, background: 'var(--bg-elev)', border: '1px solid var(--line-soft)' }}>
              {target === 'mauna' && 'Mauna: no Federation penalty for action — they are outlaws.'}
              {target !== 'mauna' && 'Federation member: getting caught = −20 standing + treaty breach.'}
            </div>
          </div>

          {/* Mission */}
          <div>
            <div className="t-label" style={{ marginBottom: 8 }}>MISSION TYPE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {missions.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMission(m.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: 10,
                    padding: '7px 10px',
                    background: selectedMission === m.id ? 'oklch(0.22 0.06 330 / 0.6)' : 'transparent',
                    border: '1px solid ' + (selectedMission === m.id ? 'var(--illegal)' : 'var(--line-soft)'),
                    color: m.danger ? 'var(--crit)' : 'var(--fg-100)',
                    textAlign: 'left',
                    alignItems: 'center',
                    fontSize: 11,
                  }}
                >
                  <span>{m.label}</span>
                  <span className="t-meta">{m.cost}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: m.success > 60 ? 'var(--ally)' : m.success > 40 ? 'var(--warn)' : 'var(--crit)' }}>
                    {m.success}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mission summary card */}
        <div style={{ marginTop: 22, padding: 18, background: 'var(--illegal-bg)', border: '1px solid var(--illegal-dim)', borderLeft: '3px solid var(--illegal)' }}>
          <div className="t-eyebrow" style={{ color: 'var(--illegal)' }}>OPERATION ORDER · DRAFT</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 14 }}>
            <div className="stat">
              <div className="stat-value" style={{ color: 'var(--illegal)' }}>{mission.success}%</div>
              <div className="stat-label">SUCCESS</div>
            </div>
            <div className="stat">
              <div className="stat-value" style={{ color: 'var(--warn)' }}>{Math.round((100 - agent.stealth))}%</div>
              <div className="stat-label">DETECTION</div>
            </div>
            <div className="stat">
              <div className="stat-value warn">{(agent.fee * (mission.cost === '0.5× fee' ? 0.5 : mission.cost === '1.0× fee' ? 1 : mission.cost === '1.2× fee' ? 1.2 : 1.4)).toFixed(0)} cr</div>
              <div className="stat-label">FEE</div>
            </div>
            <div className="stat">
              <div className="stat-value">14 days</div>
              <div className="stat-label">DURATION</div>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--fg-80)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--illegal)' }}>OBJECTIVE:</span> {mission.gain}.{' '}
            <span style={{ color: 'var(--illegal)' }}>FALLBACK:</span> If detected and captured (p = {Math.round((100 - agent.stealth) * 0.4)}%), agent reveals Helion as employer.{' '}
            <span style={{ color: 'var(--illegal)' }}>FED. PENALTY:</span> {target === 'mauna' ? 'none' : '−20 standing, treaty breach fine 8,000 cr'}.
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn illegal" style={{ flex: 1 }}>▶ EXECUTE OPERATION</button>
            <button className="btn ghost">SAVE AS DRAFT</button>
            <button className="btn ghost">CANCEL</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SkillBar({ label, value }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
        <span className="t-meta">{label}</span>
        <span className="t-data" style={{ color: 'var(--fg-100)' }}>{value}</span>
      </div>
      <div className="meter" style={{ marginTop: 4, height: 4 }}>
        <div style={{ width: `${value}%`, background: 'var(--illegal)' }} />
      </div>
    </div>
  );
}

function CounterIntelLog() {
  const intel = [
    { t: '0341.04', kind: 'crit',   text: 'Kryll counter-agent detected probing Arch-II. Hostile clearance failed.' },
    { t: '0339.40', kind: 'illegal',text: 'Mira Vell completed RECON · Pyre. Grid revealed: 18 buildings, 4 turrets.' },
    { t: '0337.18', kind: 'warn',   text: 'Wren Ash mission in progress: SAB-POWER · MOL. Day 6 of 12.' },
    { t: '0334.02', kind: 'crit',   text: 'Sable Korr CAPTURED on Gallow. Revealed Helion. −20 Kryll standing.' },
    { t: '0331.55', kind: 'illegal',text: 'Borek Tym intercepted Motkaj courier. Sci-Tek discount unlocked: Plasma Cannon.' },
    { t: '0328.30', kind: 'signal', text: 'Spy satellite over Pyre destroyed by point-defence. Replace from Arch-I.' },
    { t: '0325.10', kind: 'warn',   text: 'Foreign agent suspected on Forge-3. Run sweep. (1,200 cr)' },
  ];
  return (
    <aside style={{ background: 'var(--bg-base)', borderLeft: '1px solid var(--illegal-dim)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
      <div style={{ padding: 16, borderBottom: '1px solid var(--illegal-dim)' }}>
        <div className="t-eyebrow" style={{ color: 'var(--illegal)' }}>COUNTER-INTEL</div>
        <div className="t-meta" style={{ marginTop: 4 }}>Inbound and outbound operations</div>
      </div>

      <div style={{ padding: 14, borderBottom: '1px solid var(--line-soft)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="stat">
          <div className="stat-value" style={{ color: 'var(--illegal)', fontSize: 18 }}>+12</div>
          <div className="stat-label">CIPHER LEVEL</div>
        </div>
        <div className="stat">
          <div className="stat-value crit" style={{ fontSize: 18 }}>3</div>
          <div className="stat-label">SUSPECTED MOLES</div>
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {intel.map((e, i) => (
          <div key={i} style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--line-soft)',
            display: 'grid', gridTemplateColumns: '56px 1fr',
            gap: 10, fontSize: 11,
            background: e.kind === 'crit' ? 'oklch(0.20 0.04 18 / 0.30)'
              : e.kind === 'illegal' ? 'oklch(0.20 0.04 330 / 0.20)' : 'transparent',
          }}>
            <div className="t-meta" style={{ paddingTop: 2 }}>T+{e.t}</div>
            <div style={{
              color: e.kind === 'crit' ? 'var(--crit)'
                : e.kind === 'warn' ? 'var(--warn)'
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

Object.assign(window, { Espionage });
