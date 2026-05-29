export function StatusBar({ message, speed, setSpeed, paused, setPaused }: {
  message: string;
  speed: number;
  setSpeed: (s: number) => void;
  paused: boolean;
  setPaused: (p: boolean) => void;
}) {
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
