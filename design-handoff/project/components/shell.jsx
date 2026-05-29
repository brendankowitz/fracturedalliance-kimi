// shell.jsx — top taskbar, footer status bar, navigation

const SCREENS = [
  { id: 'menu',      label: 'Main',        key: 'F1', hidden: true  },
  { id: 'sector',    label: 'Sector',      key: 'F2' },
  { id: 'colony',    label: 'Colony',      key: 'F3' },
  { id: 'scitek',    label: 'Sci-Tek',     key: 'F4' },
  { id: 'trade',     label: 'Commerce',    key: 'F5' },
  { id: 'diplomacy', label: 'Diplomacy',   key: 'F6' },
  { id: 'combat',    label: 'Tactical',    key: 'F7' },
  { id: 'espionage', label: 'Black Cell',  key: 'F8', illegal: true },
];

function Taskbar({ screen, setScreen, treasury, time, tick, alerts }) {
  return (
    <header className="taskbar">
      <div className="taskbar-brand" onClick={() => setScreen('menu')} style={{ cursor: 'pointer' }}>
        <div className="brand-mark" />
        <div className="brand-text">
          <div className="brand-name">FRACTURED // ALLIANCE</div>
          <div className="brand-sub">HELION CORP · OPS CONSOLE v2.4.1</div>
        </div>
      </div>

      <nav className="taskbar-nav">
        {SCREENS.filter(s => !s.hidden).map(s => (
          <button
            key={s.id}
            className={screen === s.id ? 'active' : ''}
            onClick={() => setScreen(s.id)}
            style={s.illegal ? { color: screen === s.id ? 'var(--illegal)' : undefined } : null}
          >
            <span>{s.label}</span>
            <span className="nav-key">{s.key}</span>
          </button>
        ))}
      </nav>

      <div className="taskbar-status">
        <div className="status-chip">
          <span className="dot" />
          <span>FED-STAND <span style={{ color: 'var(--fg-100)' }}>+62</span></span>
        </div>
        <div className="status-chip warn">
          <span className="dot" />
          <span>CR <span style={{ color: 'var(--fg-100)' }}>{treasury.toLocaleString()}</span></span>
        </div>
        <div className="status-chip crit">
          <span className="dot" />
          <span>ALERTS <span style={{ color: 'var(--fg-100)' }}>{alerts}</span></span>
        </div>
        <div style={{ color: 'var(--fg-60)' }}>
          <span style={{ color: 'var(--fg-40)' }}>SIM/</span>{time} <span style={{ color: 'var(--fg-40)' }}>T+</span>{tick}
        </div>
      </div>
    </header>
  );
}

function StatusBar({ message, speed, setSpeed, paused, setPaused }) {
  return (
    <footer className="statusbar">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ color: 'var(--signal)' }}>● READY</span>
        <span>{message}</span>
      </div>
      <div className="center">
        <button
          className="btn sm ghost"
          onClick={() => setPaused(!paused)}
          style={{ color: paused ? 'var(--warn)' : 'var(--fg-60)' }}
        >
          {paused ? '▶ RESUME' : '❚❚ PAUSE'}
        </button>
        {[0.5, 1, 2, 4, 8].map(s => (
          <button
            key={s}
            className="btn sm ghost"
            onClick={() => setSpeed(s)}
            style={{ color: speed === s ? 'var(--warn)' : 'var(--fg-40)' }}
          >
            {s}×
          </button>
        ))}
      </div>
      <div className="end">
        <span>SEED 0x8FA12C</span>
        <span>MATCH 03:42:18</span>
        <span>SAVE — AUTO</span>
        <span style={{ color: 'var(--ally)' }}>● SYNCED</span>
      </div>
    </footer>
  );
}

Object.assign(window, { SCREENS, Taskbar, StatusBar });
