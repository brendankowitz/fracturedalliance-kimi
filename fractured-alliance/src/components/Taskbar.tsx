import { useGameStore } from '../store/gameStore';
import { simDate, simDay } from '../utils/simDate';
import { click } from '../audio/sfx';

export function Taskbar({ dayFlash = false }: { dayFlash?: boolean }) {
  const setScreen = useGameStore((s) => s.setScreen);
  const treasury = useGameStore((s) => s.treasury);
  const alerts = useGameStore((s) => s.alerts);
  const tick = useGameStore((s) => s.tick);
  const federationStanding = useGameStore((s) => s.federationStanding);
  const selectedAsteroid = useGameStore((s) => s.selectedAsteroid);
  const asteroidName = useGameStore(
    (s) => s.asteroids.find((a) => a.id === s.selectedAsteroid)?.name
  );

  const dateStr = simDate(tick);
  const dayStr = String(simDay(tick)).padStart(4, '0');
  const tickStr = String(tick).padStart(4, '0');
  const astStr = selectedAsteroid && asteroidName ? asteroidName.toUpperCase() : '—';

  return (
    <header className="taskbar">
      <div className="taskbar-brand" onClick={() => { click(); setScreen('menu'); }} style={{ cursor: 'pointer' }}>
        <div className="brand-mark" />
        <div className="brand-text">
          <div className="brand-name">FRACTURED // ALLIANCE</div>
          <div className="brand-sub">HELION CORP · OPS CONSOLE v2.4.1</div>
        </div>
      </div>

      <div className="taskbar-mid">
        <div className={`taskbar-date${dayFlash ? ' day-flash' : ''}`}>
          <span className="date">{dateStr}</span>
          <span className="ticks">DAY {dayStr} · T+{tickStr}</span>
        </div>
        <div className="taskbar-ast">
          AST:<span className="name">{astStr}</span>
        </div>
      </div>

      <div className="taskbar-status">
        <div className="status-chip">
          <span className="dot" />
          <span>FED-STAND <span style={{ color: 'var(--fg-100)' }}>{federationStanding >= 0 ? '+' : ''}{federationStanding}</span></span>
        </div>
        <div className="status-chip warn">
          <span className="dot" />
          <span>CR <span style={{ color: 'var(--fg-100)' }}>{treasury.toLocaleString()}</span></span>
        </div>
        <div className="status-chip crit">
          <span className="dot" />
          <span>ALERTS <span style={{ color: 'var(--fg-100)' }}>{alerts}</span></span>
        </div>
      </div>
    </header>
  );
}
