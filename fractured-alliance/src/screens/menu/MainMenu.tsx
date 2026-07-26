import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ACHIEVEMENTS } from '../../sim/achievements';
import { SCENARIOS as SCENARIO_DEFS, DEFAULT_SCENARIO_ID, BASE_TREASURY } from '../../sim/worldFactory';
import { simDate } from '../../utils/simDate';

interface Scenario {
  id: string;
  name: string;
  diff: string;
  len: string;
  desc: string;
}

const SCENARIOS: Scenario[] = [
  { id: 'expedition', name: 'Fragmented Sectors', diff: 'Manager', len: '60–120 min', desc: 'Standard match. Six AI rivals, full belt, all victory paths enabled.' },
  { id: 'rich', name: 'Outer Veins', diff: 'Intern', len: '45–90 min', desc: 'Resource-rich start. Forgiving Federation. Good for first run.' },
  { id: 'siege', name: 'The Mauna Question', diff: 'Director', len: '90–180 min', desc: 'Mauna are active hostiles from Day 1. Two starting asteroids.' },
  { id: 'rush', name: 'Lunch-Break Belt', diff: 'Manager', len: '25–35 min', desc: 'Compressed timeline. Three rivals. Single victory condition.' },
  { id: 'ironman', name: 'Board Review', diff: 'Board', len: '120–240 min', desc: 'Ironman. Single save slot. No quickloads. Mauna aggro from start.' },
];

export function MainMenu() {
  const [selectedScenario, setSelectedScenario] = useState(DEFAULT_SCENARIO_ID);
  const setScreen = useGameStore((s) => s.setScreen);
  const newMatch = useGameStore((s) => s.newMatch);
  const saves = useGameStore((s) => s.saves);
  const loadSave = useGameStore((s) => s.loadSave);
  const achievements = useGameStore((s) => s.achievements);

  const handleEnter = () => {
    newMatch(selectedScenario);
  };

  const handleContinue = () => {
    const first = saves.find((sv) => sv.day !== null && sv.day !== undefined);
    if (first) {
      loadSave(first.slot);
    } else {
      setScreen('sector');
    }
  };

  return (
    <div className="screen screen-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100%', position: 'relative' }}>
      {/* Background "starscape" decorative panel */}
      <div style={{
        position: 'absolute', inset: 0,
        background:
          'radial-gradient(ellipse at 70% 30%, oklch(0.28 0.06 70 / 0.45) 0%, transparent 50%),' +
          'radial-gradient(ellipse at 20% 80%, oklch(0.22 0.07 240 / 0.45) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* LEFT: wordmark + corporate boot text */}
      <div style={{ padding: '60px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div>
          <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>HELION INDUSTRIES — CONFIDENTIAL</div>
          <div style={{ marginTop: 32 }}>
            <Wordmark />
          </div>
          <div style={{ marginTop: 28, maxWidth: 460, color: 'var(--fg-60)', lineHeight: 1.55 }}>
            <p style={{ margin: 0, fontSize: 14 }}>
              A real-time strategy game about running a mining megacorp's frontier
              operations in a lawless asteroid belt — where your loyalty to corporate is
              as fragile as the vacuum-welded habitats you build.
            </p>
          </div>
          <div style={{ marginTop: 28, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div className="tag">v0.1 — alpha</div>
            <div className="tag">ops date {simDate(0)}</div>
            <div className="tag warn">tutorial available</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <pre style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-40)',
            lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap',
          }}>{
`> HELION INDUSTRIES · OPS TERMINAL 7-C · BELT DIVISION
> session date ................ ${simDate(0)}
> operator .................... FOREMAN-GRADE / PROVISIONAL
> mount /dev/belt0 ............ [ OK ]
> link comlink ................ [ OK ]
> verify save-blob ............ [ OK ]
> sci-tek index ............... [ 24/40 ]
> warning: 1 incoming asteroid trajectory unresolved
> last command: ASTEROID ARCH-I :: queue mk2-mine`
          }</pre>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn primary" onClick={handleContinue}>▶ CONTINUE</button>
            <button className="btn" onClick={handleEnter}>+ NEW MATCH</button>
            <button className="btn ghost">TUTORIAL</button>
            <button className="btn ghost">SETTINGS</button>
          </div>
        </div>
      </div>

      {/* RIGHT: scenario + saves */}
      <div style={{ padding: '60px 56px', borderLeft: '1px solid var(--line-soft)', display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 24, position: 'relative', zIndex: 1 }}>
        <div>
          <div className="t-eyebrow">[ SCENARIO ]</div>
          <div style={{ display: 'grid', gap: 6, marginTop: 12 }}>
            {SCENARIOS.map((s) => {
              const def = SCENARIO_DEFS[s.id];
              const selected = selectedScenario === s.id;
              return (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 14px',
                  textAlign: 'left',
                  background: selected ? 'var(--bg-elev)' : 'transparent',
                  border: '1px solid ' + (selected ? 'var(--warn-dim)' : 'var(--line-soft)'),
                  borderLeftWidth: 3,
                  borderLeftColor: selected ? 'var(--warn)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, color: 'var(--fg-100)' }}>{s.name}</div>
                  {selected && (
                    <div className="t-meta" style={{ marginTop: 4 }}>
                      {s.desc}
                      {def && (
                        <span style={{ color: 'var(--fg-40)' }}>
                          {' '}— start ₡ {Math.round(BASE_TREASURY * def.treasuryModifier).toLocaleString('en-US')} (×{def.treasuryModifier})
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="tag warn">{s.diff}</div>
                <div className="t-meta">{s.len}</div>
              </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="t-eyebrow" style={{ marginTop: 8 }}>[ SAVE SLOTS ]</div>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 8,
          }}>
            <thead>
              <tr style={{ color: 'var(--fg-40)' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--line-soft)' }}>SLOT</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--line-soft)' }}>NAME</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid var(--line-soft)' }}>DAY</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--line-soft)' }}>VERDICT</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid var(--line-soft)' }}></th>
              </tr>
            </thead>
            <tbody>
              {saves.map((sv) => (
                <tr
                  key={sv.slot}
                  style={{ color: sv.name === '— empty —' ? 'var(--fg-40)' : 'var(--fg-80)', cursor: 'pointer' }}
                  onClick={() => sv.day !== null && sv.day !== undefined && loadSave(sv.slot)}
                >
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--line-soft)' }}>{String(sv.slot).padStart(2, '0')}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--line-soft)' }}>{sv.name}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--line-soft)', textAlign: 'right' }}>{sv.day ?? '—'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--line-soft)' }}>
                    {sv.verdict && (
                      <span style={{
                        color: sv.verdict.startsWith('Won') ? 'var(--ally)'
                          : sv.verdict.startsWith('Lost') ? 'var(--crit)' : 'var(--signal)',
                      }}>{sv.verdict}</span>
                    )}
                  </td>
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--line-soft)', textAlign: 'right' }}>
                    {sv.stamp && (
                      <span className="t-meta">{sv.stamp}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="t-eyebrow" style={{ marginTop: 8 }}>[ ACHIEVEMENTS ]</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = achievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  style={{
                    padding: '8px 10px',
                    border: '1px solid ' + (unlocked ? 'var(--warn-dim)' : 'var(--line-soft)'),
                    background: unlocked ? 'var(--bg-elev)' : 'transparent',
                    opacity: unlocked ? 1 : 0.45,
                  }}
                >
                  <div style={{ fontSize: 12, color: unlocked ? 'var(--warn)' : 'var(--fg-60)' }}>{ach.name}</div>
                  <div className="t-meta" style={{ marginTop: 2 }}>{ach.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="t-meta" style={{ color: 'var(--fg-40)' }}>
            Original spiritual successor to Fragile Allegiance (1996). All names &amp; assets original.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost sm">CREDITS</button>
            <button className="btn ghost sm">QUIT</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wordmark — "FRACTURED // ALLIANCE" with literal fracture treatment
function Wordmark() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 78,
        fontWeight: 600,
        letterSpacing: '-0.045em',
        lineHeight: 0.9,
        color: 'var(--fg-100)',
        display: 'flex',
        alignItems: 'baseline',
        gap: 14,
      }}>
        <span style={{
          display: 'inline-block',
          clipPath: 'polygon(0 0, 100% 0, 100% 38%, 96% 42%, 100% 46%, 100% 100%, 0 100%)',
        }}>FRACTURED</span>
        <span style={{ color: 'var(--warn)', fontSize: 60, transform: 'skewX(-12deg)', display: 'inline-block' }}>//</span>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 78,
        fontWeight: 300,
        letterSpacing: '0.02em',
        lineHeight: 0.9,
        color: 'var(--fg-80)',
        marginLeft: 92,
      }}>
        ALLIANCE
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.32em',
        color: 'var(--fg-40)',
        marginTop: 10,
      }}>
        ─ ─ ─ A BELT-SIM IN ONE SESSION ─ ─ ─
      </div>
    </div>
  );
}
