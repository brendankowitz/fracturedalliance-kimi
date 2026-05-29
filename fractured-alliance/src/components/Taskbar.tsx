import type { ScreenId } from '../types';

const SCREENS: { id: ScreenId; label: string; key: string; hidden?: boolean; illegal?: boolean }[] = [
  { id: 'menu', label: 'Main', key: 'F1', hidden: true },
  { id: 'sector', label: 'Sector', key: 'F2' },
  { id: 'colony', label: 'Colony', key: 'F3' },
  { id: 'scitek', label: 'Sci-Tek', key: 'F4' },
  { id: 'trade', label: 'Commerce', key: 'F5' },
  { id: 'diplomacy', label: 'Diplomacy', key: 'F6' },
  { id: 'combat', label: 'Tactical', key: 'F7' },
  { id: 'espionage', label: 'Black Cell', key: 'F8', illegal: true },
];

export function Taskbar({ screen, setScreen, treasury, time, tick, alerts }: {
  screen: ScreenId;
  setScreen: (s: ScreenId) => void;
  treasury: number;
  time: string;
  tick: string;
  alerts: number;
}) {
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
            style={s.illegal ? { color: screen === s.id ? 'var(--illegal)' : undefined } : undefined}
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
