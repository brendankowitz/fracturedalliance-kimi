import { useGameStore } from '../store/gameStore';
import { simDay } from '../utils/simDate';
import { click } from '../audio/sfx';

export function StatusBar({ message, speed, setSpeed, paused, setPaused }: {
  message: string;
  speed: number;
  setSpeed: (s: number) => void;
  paused: boolean;
  setPaused: (p: boolean) => void;
}) {
  const tick = useGameStore((s) => s.tick);
  const savesUsed = useGameStore((s) => s.saves.filter((sv) => sv.day !== null && sv.day !== undefined).length);
  const savesTotal = useGameStore((s) => s.saves.length);

  return (
    <footer className="statusbar">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ color: 'var(--signal)' }}>● READY</span>
        <span>{message}</span>
      </div>
      <div className="center">
        <button
          className="btn sm ghost"
          onClick={() => { click(); setPaused(!paused); }}
          style={{ color: paused ? 'var(--warn)' : 'var(--fg-60)' }}
        >
          {paused ? '▶ RESUME' : '❚❚ PAUSE'}
        </button>
        {[0.5, 1, 2, 4, 8].map(s => (
          <button
            key={s}
            className="btn sm ghost"
            onClick={() => { click(); setSpeed(s); }}
            style={{ color: speed === s ? 'var(--warn)' : 'var(--fg-40)' }}
          >
            {s}×
          </button>
        ))}
      </div>
      <div className="end">
        <span>DAY {String(simDay(tick)).padStart(4, '0')}</span>
        <span>SPEED {speed}×</span>
        <span>SAVES {String(savesUsed).padStart(2, '0')}/{String(savesTotal).padStart(2, '0')}</span>
        <span style={{ color: 'var(--ally)' }}>● SYNCED</span>
      </div>
    </footer>
  );
}
