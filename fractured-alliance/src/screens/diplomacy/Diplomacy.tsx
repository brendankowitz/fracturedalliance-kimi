import { useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { RACES } from '../../data/gameData';
import type { RaceDef, TreatyKind } from '../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function abbreviateTreaty(t: TreatyKind): string {
  const map: Record<TreatyKind, string> = {
    nonAggression: 'NAP',
    noCovert: 'N-COV',
    trade: 'TRADE',
    openBorders: 'BORDER',
    defensivePact: 'DEF',
    jointWar: 'WAR',
    peace: 'PEACE',
  };
  return map[t] ?? t.toUpperCase();
}

function treatyLabel(kind: TreatyKind): string {
  const map: Record<TreatyKind, string> = {
    nonAggression: 'Non-Aggression Pact',
    noCovert: 'No-Covert-Action Pact',
    trade: 'Trade Agreement',
    openBorders: 'Open Borders',
    defensivePact: 'Defensive Pact',
    jointWar: 'Joint War',
    peace: 'Peace Treaty',
  };
  return map[kind] ?? kind;
}

function repColor(reputation: number): string {
  if (reputation >= 20) return 'var(--ally)';
  if (reputation <= -20) return 'var(--crit)';
  return 'var(--warn)';
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function RaceListItem({
  race,
  selected,
  onClick,
  reputation,
  standing,
  treaties,
}: {
  race: RaceDef;
  selected: boolean;
  onClick: () => void;
  reputation: number;
  standing: string;
  treaties: TreatyKind[];
}) {
  const color = repColor(reputation);

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
      <div className="race-token" style={{ width: 28, height: 28, fontSize: 11 }}>
        {race.short}
      </div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--fg-100)' }}>{race.name}</div>
        <div className="t-meta">{race.title}</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {treaties.length === 0 && (
            <span className="t-meta" style={{ color: 'var(--fg-40)' }}>
              — no treaties —
            </span>
          )}
          {treaties.map((t) => (
            <span key={t} className="tag" style={{ fontSize: 8, padding: '1px 5px' }}>
              {abbreviateTreaty(t)}
            </span>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="t-data" style={{ fontSize: 16, color: color }}>
          {reputation > 0 ? '+' : ''}
          {reputation}
        </div>
        <div className="t-meta">{standing}</div>
      </div>
    </button>
  );
}

function RaceRoster({
  races,
  selected,
  onSelect,
  relations,
  federationStanding,
}: {
  races: RaceDef[];
  selected: string;
  onSelect: (id: string) => void;
  relations: Record<string, import('../../sim/diplomacy').RaceRelations>;
  federationStanding: number;
}) {
  const daysHeld = 28; // placeholder — could derive from save state later
  const daysToVictory = Math.max(0, 60 - daysHeld);

  return (
    <aside
      style={{
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--line-soft)',
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>
          DIPLOMATIC AFFAIRS
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 500,
            marginTop: 4,
            letterSpacing: '-0.02em',
          }}
        >
          Federation Council
        </div>
        <div className="t-meta" style={{ marginTop: 6 }}>
          6 charted races · 5 Federation · 1 outlaw
        </div>
      </div>

      <div style={{ padding: 14 }}>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>
          RACES
        </div>
        {races.map((r) => {
          const rel = relations[r.id];
          return (
            <RaceListItem
              key={r.id}
              race={r}
              selected={selected === r.id}
              onClick={() => onSelect(r.id)}
              reputation={rel?.reputation ?? 0}
              standing={rel?.standing ?? 'neutral'}
              treaties={rel?.treaties ?? []}
            />
          );
        })}
      </div>

      <div style={{ padding: 14, borderTop: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow">YOUR STANDING</div>
        <div style={{ marginTop: 10 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
            }}
          >
            <span style={{ color: 'var(--fg-60)' }}>Corporate Federation</span>
            <span className="t-data" style={{ color: 'var(--ally)' }}>
              +{federationStanding}
            </span>
          </div>
          <div className="meter ally" style={{ marginTop: 6 }}>
            <div style={{ width: `${Math.min(100, Math.max(0, federationStanding))}%` }} />
          </div>
          <div className="t-meta" style={{ marginTop: 6 }}>
            +{federationStanding} / +100 · Holding for {daysHeld} days. Corporate
            victory in{' '}
            <span style={{ color: 'var(--warn)' }}>{daysToVictory} days</span> if
            held.
          </div>
        </div>
      </div>
    </aside>
  );
}

function TreatyRow({
  kind,
  race,
  onBreak,
}: {
  kind: TreatyKind;
  race: RaceDef;
  onBreak: () => void;
}) {
  return (
    <div
      className={`race-${race.id}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        background: 'var(--bg-raised)',
        border: '1px solid var(--line-soft)',
        borderLeft: '2px solid var(--race-color)',
      }}
    >
      <div>
        <div style={{ fontSize: 13, color: 'var(--fg-100)' }}>
          {treatyLabel(kind)}
        </div>
        <div className="t-meta">
          Signed T+0218 · 124 days active · Penalty on break: 8,000 cr
        </div>
      </div>
      <div className="tag ally">ACTIVE</div>
      <button className="btn sm ghost" onClick={onBreak}>
        BREAK
      </button>
    </div>
  );
}

const AVAILABLE_TREATIES: { kind: TreatyKind; label: string; threshold: number }[] = [
  { kind: 'nonAggression', label: 'NAP', threshold: 0 },
  { kind: 'trade', label: 'Trade', threshold: 20 },
  { kind: 'defensivePact', label: 'Defensive', threshold: 40 },
];

function AmbassadorPanel({
  race,
  relations,
  onPropose,
  onBreak,
}: {
  race: RaceDef | undefined;
  relations: Record<string, import('../../sim/diplomacy').RaceRelations>;
  onPropose: (raceId: string, treaty: TreatyKind) => void;
  onBreak: (raceId: string, treaty: TreatyKind) => void;
}) {
  const updateReputation = useGameStore((s) => s.updateReputation);

  const handleSendGift = useCallback(() => {
    if (race) updateReputation(race.id, 5);
  }, [race, updateReputation]);

  const handleDemandTribute = useCallback(() => {
    if (race) updateReputation(race.id, -8);
  }, [race, updateReputation]);

  const handleDeclareWar = useCallback(() => {
    if (race) updateReputation(race.id, -40);
  }, [race, updateReputation]);

  if (!race) return <section />;

  const rel = relations[race.id];
  const reputation = rel?.reputation ?? 0;
  const standing = rel?.standing ?? 'neutral';
  const activeTreaties = rel?.treaties ?? [];
  const color = repColor(reputation);

  return (
    <section
      className={`race-${race.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 22,
          borderBottom: '1px solid var(--line-soft)',
          background:
            'linear-gradient(180deg, var(--race-bg) 0%, transparent 100%)',
        }}
      >
        <div className="t-eyebrow">[ AMBASSADORIAL CHANNEL ]</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 14,
            marginTop: 10,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: '-0.025em',
              color: 'var(--race-color)',
            }}
          >
            {race.name}
          </div>
          <div style={{ fontSize: 14, color: 'var(--fg-60)' }}>·</div>
          <div style={{ fontSize: 14, color: 'var(--fg-80)' }}>
            {race.title}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 18,
            marginTop: 14,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="t-label">ambassador</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--fg-100)',
              }}
            >
              {race.ambassador}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="t-label">disposition</span>
            <span
              className="tag"
              style={{
                color: 'var(--race-color)',
                borderColor: 'var(--race-color)',
              }}
            >
              {race.disposition.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="t-label">standing</span>
            <span
              className="tag"
              style={{
                color: color,
                borderColor: color,
              }}
            >
              {standing.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: 0,
          }}
        >
          {/* Ambassador "portrait" - placeholder */}
          <div style={{ padding: 22, borderRight: '1px solid var(--line-soft)' }}>
            <div className="t-eyebrow">VIDEO LINK</div>
            <div
              style={{
                marginTop: 12,
                aspectRatio: '4 / 5',
                border: '1px solid var(--line)',
                background: 'var(--bg-input)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Placeholder portrait — diagonal stripes + diegetic frame */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'repeating-linear-gradient(135deg, transparent 0, transparent 10px, oklch(0.22 0.014 240) 10px, oklch(0.22 0.014 240) 11px)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 16,
                  border: '1px solid var(--race-color)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <div style={{ textAlign: 'center', color: 'var(--race-color)' }}>
                  <div
                    style={{
                      fontSize: 64,
                      fontWeight: 200,
                      letterSpacing: '0.02em',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {race.short}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.18em',
                      color: 'var(--fg-60)',
                      marginTop: 8,
                    }}
                  >
                    [ AMBASSADOR PORTRAIT ]
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.12em',
                      color: 'var(--fg-40)',
                      marginTop: 4,
                    }}
                  >
                    placeholder · video link
                  </div>
                </div>
              </div>
              {/* signal indicators */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: 'var(--crit)',
                    animation: 'pulse 1s infinite',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8,
                    color: 'var(--crit)',
                    letterSpacing: '0.18em',
                  }}
                >
                  ● REC
                </span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: 'var(--fg-60)',
                }}
              >
                CH.{race.id.toUpperCase().slice(0, 3)}
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  right: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: 'var(--fg-60)',
                }}
              >
                <span>{race.ambassador}</span>
                <span>00:01:47</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button className="btn sm" style={{ flex: 1 }}>
                OPEN CHANNEL
              </button>
              <button className="btn sm ghost">MUTE</button>
            </div>
            <div className="t-meta" style={{ marginTop: 10, lineHeight: 1.45 }}>
              {race.desc}
            </div>
          </div>

          {/* Treaties + reputation */}
          <div
            style={{
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div>
              <div className="t-eyebrow">REPUTATION</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 12,
                  marginTop: 10,
                }}
              >
                <div className="t-data" style={{ fontSize: 36, color: color }}>
                  {reputation > 0 ? '+' : ''}
                  {reputation}
                </div>
                <div className="t-meta">/ 100</div>
              </div>
              {/* Reputation bar (-100 to +100) */}
              <div
                style={{
                  marginTop: 12,
                  position: 'relative',
                  height: 18,
                  background: 'var(--bg-input)',
                  border: '1px solid var(--line-soft)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: 'var(--fg-40)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    ...(reputation >= 0
                      ? {
                          left: '50%',
                          width: `${(reputation / 100) * 50}%`,
                        }
                      : {
                          right: '50%',
                          width: `${(Math.abs(reputation) / 100) * 50}%`,
                        }),
                    top: 0,
                    bottom: 0,
                    background: color,
                    opacity: 0.7,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 6,
                    top: 3,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: 'var(--fg-40)',
                  }}
                >
                  −100
                </div>
                <div
                  style={{
                    position: 'absolute',
                    right: 6,
                    top: 3,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: 'var(--fg-40)',
                  }}
                >
                  +100
                </div>
              </div>
              <div className="t-meta" style={{ marginTop: 8 }}>
                Recent:{' '}
                <span style={{ color: 'var(--crit)' }}>
                  −5 council accusation
                </span>{' '}
                ·{' '}
                <span style={{ color: 'var(--ally)' }}>
                  +2 NAP honoured (3 mo.)
                </span>{' '}
                ·{' '}
                <span style={{ color: 'var(--crit)' }}>
                  −12 traded with Mauna
                </span>
              </div>
            </div>

            <div>
              <div className="t-eyebrow">ACTIVE TREATIES</div>
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {activeTreaties.length === 0 && (
                  <div
                    style={{
                      padding: 12,
                      border: '1px dashed var(--line)',
                      color: 'var(--fg-40)',
                      fontSize: 12,
                      textAlign: 'center',
                    }}
                  >
                    — no active treaties —
                  </div>
                )}
                {activeTreaties.map((t) => (
                  <TreatyRow
                    key={t}
                    kind={t}
                    race={race}
                    onBreak={() => onBreak(race.id, t)}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="t-eyebrow">AVAILABLE TREATIES</div>
              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                {AVAILABLE_TREATIES.map(({ kind, threshold }) => {
                  const signed = activeTreaties.includes(kind);
                  const canPropose = reputation >= threshold && !signed;
                  return (
                    <div
                      key={kind}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 12px',
                        background: 'var(--bg-raised)',
                        border: '1px solid var(--line-soft)',
                        borderLeft: '2px solid var(--race-color)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--fg-100)' }}>
                          {treatyLabel(kind)}
                        </div>
                        <div className="t-meta">
                          Requires reputation ≥ {threshold}
                        </div>
                      </div>
                      {signed ? (
                        <div className="tag ally">SIGNED</div>
                      ) : (
                        <div className="tag warn">NOT SIGNED</div>
                      )}
                      <button
                        className="btn sm"
                        disabled={!canPropose}
                        onClick={() => onPropose(race.id, kind)}
                        style={{
                          opacity: canPropose ? 1 : 0.4,
                          cursor: canPropose ? 'pointer' : 'not-allowed',
                        }}
                      >
                        PROPOSE
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="t-eyebrow">AVAILABLE ACTIONS</div>
              <div
                style={{
                  marginTop: 10,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                }}
              >
                <button className="btn sm" onClick={handleSendGift}>
                  SEND GIFT (1,000 cr)
                </button>
                <button className="btn sm ghost" onClick={handleDemandTribute}>
                  DEMAND TRIBUTE
                </button>
                <button className="btn sm crit" onClick={handleDeclareWar}>
                  DECLARE WAR
                </button>
                <button className="btn sm illegal">
                  {race.id === 'mauna' ? 'TRADE ILLEGAL' : 'SABOTAGE'}
                </button>
              </div>
              {race.id === 'mauna' && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 10,
                    background: 'var(--illegal-bg)',
                    border: '1px solid var(--illegal-dim)',
                    color: 'var(--illegal)',
                    fontSize: 11,
                    lineHeight: 1.45,
                  }}
                >
                  ⛧ Any direct trade with Mauna is a Federation Article-12
                  offence. Suspicion accumulates per transaction.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CouncilLog({ events }: { events: import('../../sim/types').SimEvent[] }) {
  const diploEvents = events.filter(
    (e) => e.kind === 'ally' || e.kind === 'warn' || e.kind === 'crit'
  );

  return (
    <aside
      style={{
        background: 'var(--bg-base)',
        borderLeft: '1px solid var(--line-soft)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 16, borderBottom: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow">[ COUNCIL LOG ]</div>
        <div className="t-meta" style={{ marginTop: 4 }}>
          Rolling 24-month event memory
        </div>
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {diploEvents.length === 0 && (
          <div
            style={{
              padding: 16,
              color: 'var(--fg-40)',
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            — no diplomatic events —
          </div>
        )}
        {diploEvents.map((e, i) => (
          <div
            key={e.id ?? i}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--line-soft)',
              display: 'grid',
              gridTemplateColumns: '60px 1fr',
              gap: 10,
              fontSize: 11,
            }}
          >
            <div className="t-meta" style={{ paddingTop: 2 }}>
              {e.t}
            </div>
            <div
              style={{
                color:
                  e.kind === 'crit'
                    ? 'var(--crit)'
                    : e.kind === 'warn'
                      ? 'var(--warn)'
                      : e.kind === 'ally'
                        ? 'var(--ally)'
                        : 'var(--fg-80)',
                lineHeight: 1.4,
              }}
            >
              {e.text}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export function Diplomacy() {
  const races = RACES.filter((r) => r.id !== 'helion');
  const [selected, setSelected] = useState('kryll');
  const sel = races.find((r) => r.id === selected);

  const relations = useGameStore((s) => s.relations);
  const proposeTreaty = useGameStore((s) => s.proposeTreaty);
  const breakTreaty = useGameStore((s) => s.breakTreaty);
  const events = useGameStore((s) => s.events);
  const federationStanding = useGameStore((s) => s.federationStanding);

  return (
    <div
      className="screen screen-enter"
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 360px',
        height: '100%',
      }}
    >
      <RaceRoster
        races={races}
        selected={selected}
        onSelect={setSelected}
        relations={relations}
        federationStanding={federationStanding}
      />
      <AmbassadorPanel
        race={sel}
        relations={relations}
        onPropose={proposeTreaty}
        onBreak={breakTreaty}
      />
      <CouncilLog events={events} />
    </div>
  );
}
