import { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BLUEPRINTS } from '../../data/gameData';
import { BlueprintSchematic } from '../../assets/BlueprintSchematic';
import type { BlueprintDef } from '../../types';

type DisciplineId = 'all' | 'Extraction' | 'Power' | 'Defence' | 'Offence' | 'Logistics';

function CheckboxLine({ label, checked }: { label: string; checked?: boolean }) {
  const [on, setOn] = useState(!!checked);
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        fontSize: 11,
        color: 'var(--fg-80)',
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          border: '1px solid var(--line)',
          background: on ? 'var(--warn)' : 'transparent',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--bg-void)',
        }}
        onClick={() => setOn(!on)}
      >
        {on ? '✓' : ''}
      </span>
      {label}
    </label>
  );
}

function BlueprintCard({
  bp,
  selected,
  onClick,
}: {
  bp: BlueprintDef;
  selected: boolean;
  onClick: () => void;
}) {
  const status = bp.bought ? 'owned' : bp.trap ? 'trap' : 'available';
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: 14,
        background: selected ? 'var(--bg-elev)' : 'var(--bg-raised)',
        border: '1px solid ' + (selected ? 'var(--warn)' : 'var(--line-soft)'),
        color: 'var(--fg-100)',
        cursor: 'pointer',
        position: 'relative',
        opacity: status === 'owned' ? 0.55 : 1,
        transition: 'all 100ms',
      }}
    >
      {/* corner mark */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '4px 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.18em',
          color:
            status === 'owned'
              ? 'var(--ally)'
              : status === 'trap'
              ? 'var(--crit)'
              : 'var(--fg-40)',
          background:
            status === 'owned'
              ? 'var(--ally-bg)'
              : status === 'trap'
              ? 'var(--crit-bg)'
              : 'transparent',
        }}
      >
        {status === 'owned' ? '◉ OWNED' : status === 'trap' ? '✕ TRAP' : `T${bp.tier}`}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.16em',
          color: 'var(--fg-40)',
          textTransform: 'uppercase',
        }}
      >
        {bp.disc} · TIER {bp.tier}
      </div>
      <div style={{ fontSize: 16, fontWeight: 500, marginTop: 8, letterSpacing: '-0.01em' }}>
        {bp.name}
      </div>
      <div
        className="t-meta"
        style={{ marginTop: 8, minHeight: 32, lineHeight: 1.35, color: 'var(--fg-60)' }}
      >
        {bp.desc}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px solid var(--line-soft)',
        }}
      >
        <div>
          <div
            className="t-data"
            style={{
              fontSize: 17,
              color: status === 'owned' ? 'var(--fg-40)' : 'var(--warn)',
            }}
          >
            {bp.cost.toLocaleString()}
          </div>
          <div className="t-meta">cr</div>
        </div>
        {!bp.bought && bp.must && <div className="tag warn">MUST-BUY</div>}
        {!bp.bought && bp.special && <div className="tag illegal">SECESSION</div>}
      </div>
    </button>
  );
}

function BlueprintDetail({ bp }: { bp: BlueprintDef | undefined }) {
  const purchaseBlueprint = useGameStore((s) => s.purchaseBlueprint);
  const blueprintsOwned = useGameStore((s) => s.blueprintsOwned);
  const treasury = useGameStore((s) => s.treasury);

  const canPurchase = useMemo(() => {
    if (!bp || bp.bought) return false;
    if (treasury < bp.cost) return false;
    if (bp.tier >= 2) {
      const hasLowerTier = blueprintsOwned.some((id) => {
        const b = BLUEPRINTS.find((x) => x.id === id);
        return b && b.disc === bp.disc && b.tier === bp.tier - 1;
      });
      if (!hasLowerTier) return false;
    }
    return true;
  }, [bp, treasury, blueprintsOwned]);

  if (!bp)
    return (
      <aside
        style={{
          background: 'var(--bg-base)',
          borderLeft: '1px solid var(--line-soft)',
        }}
      />
    );

  return (
    <aside
      style={{
        background: 'var(--bg-base)',
        borderLeft: '1px solid var(--line-soft)',
        overflowY: 'auto',
      }}
    >
      <div style={{ padding: 20 }}>
        <div className="t-eyebrow">DETAILED SPEC · {bp.disc.toUpperCase()}</div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: '-0.025em',
            marginTop: 6,
          }}
        >
          {bp.name}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <div className="tag warn">TIER {bp.tier}</div>
          {bp.bought && <div className="tag ally">OWNED</div>}
          {bp.must && <div className="tag">MUST-BUY</div>}
          {bp.trap && <div className="tag crit">TRAP-TIER</div>}
          {bp.special && <div className="tag illegal">SECESSION</div>}
        </div>
      </div>

      {/* Schematic illustration */}
      <div
        style={{
          margin: '0 20px',
          background: 'var(--bg-input)',
          border: '1px solid var(--line-soft)',
        }}
      >
        <BlueprintSchematic bpId={bp.id} />
      </div>

      <div style={{ padding: 20 }}>
        <div className="t-eyebrow">SPECIFICATION</div>
        <table
          style={{
            width: '100%',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            marginTop: 10,
            borderCollapse: 'collapse',
          }}
        >
          {[
            ['Discipline', bp.disc],
            ['Tier', `T${bp.tier} of 4`],
            ['Cost (one-off)', `${bp.cost.toLocaleString()} cr`],
            ['Prerequisites', bp.tier > 1 ? `1 × ${bp.disc} T${bp.tier - 1}` : '—'],
            [
              'Federation impact',
              bp.special
                ? '−100 standing on activation'
                : bp.disc === 'Offence' && bp.tier >= 3
                ? 'Triggers alert'
                : '—',
            ],
            [
              'Build-time impact',
              bp.disc === 'Logistics' ? 'Reduces construction time' : '—',
            ],
          ].map(([k, v]) => (
            <tr key={k}>
              <td
                style={{
                  padding: '6px 0',
                  color: 'var(--fg-40)',
                  borderBottom: '1px solid var(--line-soft)',
                }}
              >
                {k}
              </td>
              <td
                style={{
                  padding: '6px 0',
                  color: 'var(--fg-100)',
                  textAlign: 'right',
                  borderBottom: '1px solid var(--line-soft)',
                }}
              >
                {v}
              </td>
            </tr>
          ))}
        </table>
      </div>

      <div style={{ padding: 20, borderTop: '1px solid var(--line-soft)' }}>
        <div className="t-eyebrow">DESCRIPTION</div>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            color: 'var(--fg-80)',
            marginTop: 10,
          }}
        >
          {bp.desc}
        </p>
        {bp.trap && (
          <div
            style={{
              marginTop: 12,
              padding: 10,
              background: 'var(--crit-bg)',
              border: '1px solid var(--crit-dim)',
              color: 'var(--crit)',
              fontSize: 11,
            }}
          >
            ⚠ Community guidance: marked as trap-tier. AI counters dominate this branch within 18
            sim-days.
          </div>
        )}
        {bp.special && (
          <div
            style={{
              marginTop: 12,
              padding: 10,
              background: 'var(--illegal-bg)',
              border: '1px solid var(--illegal-dim)',
              color: 'var(--illegal)',
              fontSize: 11,
              lineHeight: 1.45,
            }}
          >
            ⛧ Once purchased and ratified, you may Declare Independence from the Federation. The
            Federation will dispatch a 90-day punitive expedition. Win conditions shift to{' '}
            <strong>Independence</strong> path.
          </div>
        )}
      </div>

      <div
        style={{
          padding: 20,
          borderTop: '1px solid var(--line-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {bp.bought ? (
          <button className="btn" disabled>
            ◉ ACQUIRED
          </button>
        ) : (
          <>
            <button
              className="btn primary"
              disabled={!canPurchase}
              onClick={() => {
                purchaseBlueprint(bp.id, bp.cost);
              }}
            >
              PURCHASE — {bp.cost.toLocaleString()} cr
            </button>
            <button className="btn ghost">QUEUE FOR LATER</button>
          </>
        )}
      </div>
    </aside>
  );
}

export function SciTek() {
  const [discipline, setDiscipline] = useState<DisciplineId>('all');
  const [selected, setSelected] = useState<string>('photon');
  const blueprintsOwned = useGameStore((s) => s.blueprintsOwned);
  const treasury = useGameStore((s) => s.treasury);

  const blueprints = useMemo(() => {
    return BLUEPRINTS.map((bp) => ({
      ...bp,
      bought: blueprintsOwned.includes(bp.id),
    }));
  }, [blueprintsOwned]);

  const disciplines = useMemo(
    () => [
      { id: 'all' as DisciplineId, label: 'All', count: blueprints.length },
      {
        id: 'Extraction' as DisciplineId,
        label: 'Extraction',
        count: blueprints.filter((b) => b.disc === 'Extraction').length,
      },
      {
        id: 'Power' as DisciplineId,
        label: 'Power',
        count: blueprints.filter((b) => b.disc === 'Power').length,
      },
      {
        id: 'Defence' as DisciplineId,
        label: 'Defence',
        count: blueprints.filter((b) => b.disc === 'Defence').length,
      },
      {
        id: 'Offence' as DisciplineId,
        label: 'Offence',
        count: blueprints.filter((b) => b.disc === 'Offence').length,
      },
      {
        id: 'Logistics' as DisciplineId,
        label: 'Logistics',
        count: blueprints.filter((b) => b.disc === 'Logistics').length,
      },
    ],
    [blueprints]
  );

  const filtered = blueprints.filter(
    (b) => discipline === 'all' || b.disc === discipline
  );
  const sel = blueprints.find((b) => b.id === selected);

  const owned = blueprints.filter((b) => b.bought).length;

  return (
    <div
      className="screen screen-enter"
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr 380px',
        height: '100%',
      }}
    >
      {/* Left rail */}
      <aside
        style={{
          background: 'var(--bg-base)',
          borderRight: '1px solid var(--line-soft)',
          overflowY: 'auto',
        }}
      >
        <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
          <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>
            SCI-TEK
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              marginTop: 4,
              letterSpacing: '-0.02em',
            }}
          >
            Blueprint Vault
          </div>
          <div className="t-meta" style={{ marginTop: 6 }}>
            {owned} of {blueprints.length} acquired
          </div>

          <div className="meter warn" style={{ marginTop: 10 }}>
            <div style={{ width: `${(owned / blueprints.length) * 100}%` }} />
          </div>
        </div>

        <div style={{ padding: 14 }}>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>
            DISCIPLINES
          </div>
          {disciplines.map((d) => (
            <button
              key={d.id}
              onClick={() => setDiscipline(d.id)}
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                padding: '8px 10px',
                background: discipline === d.id ? 'var(--bg-elev)' : 'transparent',
                borderLeft:
                  discipline === d.id
                    ? '2px solid var(--warn)'
                    : '2px solid transparent',
                color: discipline === d.id ? 'var(--fg-100)' : 'var(--fg-60)',
                marginBottom: 2,
                fontSize: 12,
                textAlign: 'left',
              }}
            >
              <span>{d.label}</span>
              <span
                className="t-data"
                style={{ fontSize: 10, color: 'var(--fg-40)' }}
              >
                {d.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ padding: 14, borderTop: '1px solid var(--line-soft)' }}>
          <div className="t-eyebrow">FILTER</div>
          <div
            style={{
              marginTop: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <CheckboxLine label="Affordable only" />
            <CheckboxLine label="Unowned only" checked />
            <CheckboxLine label="Hide trap-tier" />
            <CheckboxLine label="Show prerequisites" checked />
          </div>
        </div>

        <div style={{ padding: 14, borderTop: '1px solid var(--line-soft)' }}>
          <div className="t-eyebrow">TREASURY</div>
          <div className="stat" style={{ marginTop: 8 }}>
            <div className="stat-value warn">{treasury.toLocaleString()} cr</div>
            <div className="stat-label">+1,820 /day · 7-day avg</div>
          </div>
        </div>
      </aside>

      {/* Grid of blueprints */}
      <section style={{ padding: 18, overflowY: 'auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <div className="t-eyebrow">
              {discipline === 'all' ? 'ALL DISCIPLINES' : discipline.toUpperCase()}
            </div>
            <div className="t-meta" style={{ marginTop: 2 }}>
              No dependencies between tiers within different disciplines · Tier-2+ requires
              same-discipline Tier-1
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn sm ghost">SORT: PRICE ▾</button>
            <button className="btn sm ghost">VIEW: GRID</button>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 10,
          }}
        >
          {filtered.map((b) => (
            <BlueprintCard
              key={b.id}
              bp={b}
              selected={selected === b.id}
              onClick={() => setSelected(b.id)}
            />
          ))}
        </div>
      </section>

      {/* Detail panel */}
      <BlueprintDetail bp={sel} />
    </div>
  );
}
