import { useGameStore } from '../../store/gameStore';
import { PLAYER_ID } from '../../sim/worldFactory';
import { simDate, simDay } from '../../utils/simDate';

export function Verdict() {
  const verdict = useGameStore((s) => s.verdict);
  const verdictCause = useGameStore((s) => s.verdictCause);
  const tick = useGameStore((s) => s.tick);
  const treasury = useGameStore((s) => s.treasury);
  const asteroids = useGameStore((s) => s.asteroids);
  const blueprintsOwned = useGameStore((s) => s.blueprintsOwned);
  const newMatch = useGameStore((s) => s.newMatch);
  const setScreen = useGameStore((s) => s.setScreen);

  const won = verdict === 'won';
  const held = asteroids.filter((a) => a.ownerId === PLAYER_ID).length;

  const stats: [string, string][] = [
    ['DAYS ELAPSED', String(simDay(tick))],
    ['OPS DATE', simDate(tick)],
    ['FINAL TREASURY', `₡ ${treasury.toLocaleString('en-US')}`],
    ['ASTEROIDS HELD', `${held} / ${asteroids.length}`],
    ['BLUEPRINTS OWNED', String(blueprintsOwned.length)],
  ];

  return (
    <div className="screen screen-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Background decorative glow, tinted by outcome */}
      <div style={{
        position: 'absolute', inset: 0,
        background: won
          ? 'radial-gradient(ellipse at 50% 20%, oklch(0.28 0.06 150 / 0.40) 0%, transparent 55%)'
          : 'radial-gradient(ellipse at 50% 20%, oklch(0.30 0.09 18 / 0.40) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', gap: 28, position: 'relative', zIndex: 1, padding: '0 56px',
      }}>
        <div className="t-eyebrow" style={{ color: 'var(--fg-40)' }}>
          HELION INDUSTRIES — MATCH TERMINATED · {simDate(tick)}
        </div>

        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 120,
          fontWeight: 600,
          letterSpacing: '-0.03em',
          lineHeight: 1,
          color: won ? 'var(--ally)' : 'var(--crit)',
        }}>
          {won ? 'VICTORY' : 'DEFEAT'}
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-80)' }}>
          {verdictCause ?? '—'}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, auto)', gap: 1,
          border: '1px solid var(--line-soft)', background: 'var(--line-soft)', marginTop: 12,
        }}>
          {stats.map(([label, value]) => (
            <div key={label} style={{ background: 'var(--bg-base)', padding: '14px 22px', minWidth: 130 }}>
              <div className="t-eyebrow" style={{ color: 'var(--fg-40)' }}>{label}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 18, marginTop: 6,
                color: 'var(--fg-100)',
              }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn primary" onClick={() => newMatch()}>+ NEW MATCH</button>
          <button className="btn" onClick={() => setScreen('menu')}>MAIN MENU</button>
        </div>
      </div>

      <div style={{
        padding: '18px 56px', borderTop: '1px solid var(--line-soft)',
        display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1,
      }}>
        <span className="t-meta" style={{ color: 'var(--fg-40)' }}>
          ops terminal 7-C · belt division · session closed
        </span>
        <span className={`tag ${won ? 'ally' : 'crit'}`}>{won ? 'Won' : 'Lost'}</span>
      </div>
    </div>
  );
}
