import { useState, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ORES, BLACK_MARKET } from '../../data/gameData';
import type { OreDef, BlackMarketItem } from '../../types';
import type { AsteroidState } from '../../sim/types';
import type { MarketState } from '../../sim/market';
import type { OreKind } from '../../types';

export function Trade() {
  const [channel, setChannel] = useState<'federal' | 'merchant' | 'black'>('federal');

  const market = useGameStore((s) => s.market);
  const asteroid = useGameStore((s) => s.asteroids.find((a) => a.id === s.selectedAsteroid));
  const treasury = useGameStore((s) => s.treasury);
  const buyOre = useGameStore((s) => s.buyOre);
  const sellOre = useGameStore((s) => s.sellOre);

  return (
    <div className="screen screen-enter" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', height: '100%' }}>
      <section style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--line-soft)' }}>
        {/* Channel tabs */}
        <div style={{ padding: '20px 22px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--warn)' }}>COMMERCE &amp; LOGISTICS</div>
            <div style={{ fontSize: 26, fontWeight: 500, marginTop: 4, letterSpacing: '-0.02em' }}>Ore Markets</div>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
            <div className="t-meta">treasury</div>
            <TreasuryDisplay />
            <div className="stat-delta up">▲ LIVE</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 0, marginTop: 22, padding: '0 22px', borderBottom: '1px solid var(--line-soft)' }}>
          <ChannelTab id="federal" current={channel} onClick={() => setChannel('federal')}
            label="FEDERAL ORE TRANSPORTER" sub="0.7× / safe" color="signal" />
          <ChannelTab id="merchant" current={channel} onClick={() => setChannel('merchant')}
            label="INDEPENDENT MERCHANTS" sub="1.0× / docked" color="warn" />
          <ChannelTab id="black" current={channel} onClick={() => setChannel('black')}
            label="BLACK MARKET" sub="1.6× / risk 35%" color="illegal" />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          {channel === 'federal' && (
            <FederalChannel
              ores={ORES}
              market={market}
              asteroid={asteroid}
              treasury={treasury}
              buyOre={buyOre}
              sellOre={sellOre}
            />
          )}
          {channel === 'merchant' && <MerchantChannel market={market} />}
          {channel === 'black' && <BlackMarketChannel />}
        </div>
      </section>

      <aside style={{ background: 'var(--bg-base)', overflowY: 'auto' }}>
        <CargoStockpile ores={ORES} asteroid={asteroid} market={market} />
        <MarketStatus market={market} />
      </aside>
    </div>
  );
}

function TreasuryDisplay() {
  const treasury = useGameStore((s) => s.treasury);
  return (
    <div className="t-data" style={{ fontSize: 22, color: 'var(--warn)' }}>
      {treasury.toLocaleString()} cr
    </div>
  );
}

function ChannelTab({
  id,
  current,
  onClick,
  label,
  sub,
  color,
}: {
  id: string;
  current: string;
  onClick: () => void;
  label: string;
  sub: string;
  color: 'signal' | 'warn' | 'illegal';
}) {
  const active = current === id;
  const activeBorderColor =
    color === 'illegal'
      ? 'var(--illegal-dim)'
      : color === 'warn'
        ? 'var(--warn-dim)'
        : 'var(--signal-dim)';
  const activeTextColor =
    color === 'illegal'
      ? 'var(--illegal)'
      : color === 'warn'
        ? 'var(--warn)'
        : 'var(--signal)';

  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 18px',
        background: active ? 'var(--bg-base)' : 'transparent',
        borderTop: '1px solid ' + (active ? activeBorderColor : 'var(--line-soft)'),
        borderLeft: '1px solid ' + (active ? 'var(--line-soft)' : 'transparent'),
        borderRight: '1px solid ' + (active ? 'var(--line-soft)' : 'transparent'),
        borderBottom: '1px solid ' + (active ? 'transparent' : 'var(--line-soft)'),
        position: 'relative',
        top: 1,
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div
        className="t-eyebrow"
        style={{
          color: active ? activeTextColor : 'var(--fg-40)',
        }}
      >
        {label}
      </div>
      <div className="t-meta" style={{ marginTop: 4 }}>
        {sub}
      </div>
    </button>
  );
}

function FederalChannel({
  ores,
  market,
  asteroid,
  treasury,
  buyOre,
  sellOre,
}: {
  ores: OreDef[];
  market: MarketState;
  asteroid: AsteroidState | undefined;
  treasury: number;
  buyOre: (ore: OreKind, qty: number) => void;
  sellOre: (ore: OreKind, qty: number) => void;
}) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 22 }}>
        <div className="panel">
          <div className="panel-head">
            <span>NEXT TRANSPORTER</span>
            <span className="head-meta">monthly</span>
          </div>
          <div className="panel-body">
            <div className="stat">
              <div className="stat-value signal">14 days</div>
              <div className="stat-label">until docking · ARCH-I bay</div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 16 }}>
              <div>
                <span className="t-meta">capacity</span>{' '}
                <div className="t-data" style={{ color: 'var(--fg-100)' }}>2,400 t</div>
              </div>
              <div>
                <span className="t-meta">pre-booked</span>{' '}
                <div className="t-data" style={{ color: 'var(--fg-100)' }}>1,180 t</div>
              </div>
              <div>
                <span className="t-meta">your queue</span>{' '}
                <div className="t-data" style={{ color: 'var(--warn)' }}>640 t</div>
              </div>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <span>PRICE FORECAST · 30d</span>
            <span className="head-meta">universe avg</span>
          </div>
          <div className="panel-body">
            <PriceSparkline />
            <div className="t-meta" style={{ marginTop: 4 }}>
              Crystalite rising · Dragonium peaking · Korellium soft
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span>ORE LEDGER</span>
          <span className="head-meta">priced at Federal 0.7× · per tonne</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          <thead>
            <tr style={{ color: 'var(--fg-40)', background: 'var(--bg-raised)' }}>
              <th style={th}>ORE</th>
              <th style={th}>TIER</th>
              <th style={{ ...th, textAlign: 'right' }}>STOCKPILE</th>
              <th style={{ ...th, textAlign: 'right' }}>FED PRICE</th>
              <th style={{ ...th, textAlign: 'right' }}>30D</th>
              <th style={{ ...th, textAlign: 'right' }}>VALUE</th>
              <th style={{ ...th, textAlign: 'center' }}>BUY</th>
              <th style={{ ...th, textAlign: 'center' }}>SELL</th>
            </tr>
          </thead>
          <tbody>
            {ores.map((o) => {
              const stock = asteroid?.resources.ores[o.id] ?? 0;
              const livePrice = market.prices[o.id] ?? o.price;
              const fedPrice = Math.round(livePrice * 0.7);
              const demand = market.demand[o.id] ?? 1.0;
              const trend = demand > 1.02 ? 'up' : demand < 0.98 ? 'down' : 'flat';
              const value = stock * fedPrice;
              const canBuy1 = treasury >= fedPrice * 1;
              const canBuy10 = treasury >= fedPrice * 10;
              const canSell1 = stock >= 1;
              const canSell10 = stock >= 10;
              return (
                <tr key={o.id} style={{ borderTop: '1px solid var(--line-soft)' }}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, background: o.color }} />
                      <span style={{ color: 'var(--fg-100)' }}>{o.name}</span>
                    </div>
                  </td>
                  <td style={td}>T{o.tier}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{stock} t</td>
                  <td style={{ ...td, textAlign: 'right', color: 'var(--fg-100)' }}>{fedPrice} cr</td>
                  <td
                    style={{
                      ...td,
                      textAlign: 'right',
                      color:
                        trend === 'up'
                          ? 'var(--ally)'
                          : trend === 'down'
                            ? 'var(--crit)'
                            : 'var(--fg-60)',
                    }}
                  >
                    {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
                  </td>
                  <td style={{ ...td, textAlign: 'right', color: 'var(--warn)' }}>
                    {value.toLocaleString()}
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button
                        className="btn sm"
                        disabled={!canBuy1}
                        onClick={() => buyOre(o.id, 1)}
                        style={{ opacity: canBuy1 ? 1 : 0.4 }}
                      >
                        BUY 1
                      </button>
                      <button
                        className="btn sm"
                        disabled={!canBuy10}
                        onClick={() => buyOre(o.id, 10)}
                        style={{ opacity: canBuy10 ? 1 : 0.4 }}
                      >
                        BUY 10
                      </button>
                    </div>
                  </td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button
                        className="btn sm"
                        disabled={!canSell1}
                        onClick={() => sellOre(o.id, 1)}
                        style={{ opacity: canSell1 ? 1 : 0.4 }}
                      >
                        SELL 1
                      </button>
                      <button
                        className="btn sm"
                        disabled={!canSell10}
                        onClick={() => sellOre(o.id, 10)}
                        style={{ opacity: canSell10 ? 1 : 0.4 }}
                      >
                        SELL 10
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MerchantChannel({ market }: { market: MarketState }) {
  const handleBuy = useCallback((itemName: string, price: number) => {
    const state = useGameStore.getState();
    if (state.treasury < price) return;
    const stock = state.market.merchantStock[itemName] ?? 0;
    if (stock <= 0) {
      alert('Item out of stock');
      return;
    }
    useGameStore.setState({
      treasury: state.treasury - price,
      market: {
        ...state.market,
        merchantStock: {
          ...state.market.merchantStock,
          [itemName]: stock - 1,
        },
      },
    });
  }, []);

  const merchantStockEntries = Object.entries(market.merchantStock);
  const arrivalTick = market.merchantArrivalTick;
  const cycleLength = 150;
  const daysSinceArrival = market.merchantActive ? 0 : Math.max(0, (useGameStore.getState().tick - arrivalTick));
  const daysUntilNext = cycleLength - (daysSinceArrival % cycleLength);

  return (
    <div>
      <div className="panel" style={{ marginBottom: 22 }}>
        <div className="panel-head">
          <span>{market.merchantActive ? 'CONVOY DOCKED · ARCH-I' : 'NO CONVOY DOCKED'}</span>
          <span className="head-meta">{market.merchantActive ? 'departs in 6 days' : `next arrival ~${daysUntilNext} days`}</span>
        </div>
        <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 22, alignItems: 'center' }}>
          <div
            style={{
              aspectRatio: '16/9',
              background: 'var(--bg-input)',
              border: '1px solid var(--line)',
              position: 'relative',
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent 0px, transparent 6px, oklch(0.22 0.014 240) 6px, oklch(0.22 0.014 240) 7px)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 12,
                border: '1px solid var(--warn-dim)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <div style={{ textAlign: 'center', color: 'var(--warn)' }}>
                <div style={{ fontSize: 28 }}>⊳⊳⊳</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', marginTop: 6 }}>
                  MERCHANT CONVOY
                </div>
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>
              {market.merchantActive ? 'Captain Aviv-7 Reska' : 'Merchant Away'}
            </div>
            <div className="t-meta">
              {market.merchantActive
                ? 'Achar-flagged independent · reputation neutral · 4 holds'
                : 'No merchant docked. Next arrival estimated in ' + daysUntilNext + ' days.'}
            </div>
            {market.merchantActive && (
              <p style={{ fontSize: 12, color: 'var(--fg-80)', marginTop: 10, lineHeight: 1.55 }}>
                "We don't pick sides. We pick prices. Two days fuel reserve. What are you buying?"
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn sm">BARTER</button>
              <button className="btn sm ghost">REPUTATION CHECK</button>
              <button className="btn sm ghost crit">REQUEST DEPARTURE</button>
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span>INVENTORY</span>
          <span className="head-meta">no re-dock refill</span>
        </div>
        {market.merchantActive && merchantStockEntries.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            <thead>
              <tr style={{ color: 'var(--fg-40)', background: 'var(--bg-raised)' }}>
                <th style={th}>ITEM</th>
                <th style={{ ...th, textAlign: 'right' }}>QTY</th>
                <th style={{ ...th, textAlign: 'right' }}>PRICE</th>
                <th style={{ ...th, textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {merchantStockEntries.map(([name, qty]: [string, number]) => {
                const pricePerUnit = name === 'luxury' ? 1100 : name === 'tools' ? 320 : name === 'medkit' ? 240 : name === 'antiv' ? 4800 : 500;
                return (
                  <tr key={name} style={{ borderTop: '1px solid var(--line-soft)' }}>
                    <td style={td}>
                      <span style={{ color: 'var(--fg-100)' }}>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>{qty}</td>
                    <td style={{ ...td, textAlign: 'right', color: 'var(--warn)' }}>{pricePerUnit.toLocaleString()} cr</td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <button className="btn sm" onClick={() => handleBuy(name, pricePerUnit)}>
                        BUY · 1
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="panel-body">
            <div className="t-meta">No items available.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function BlackMarketChannel() {
  const stock = BLACK_MARKET;
  const suspicion = useGameStore((s) => s.suspicion);
  const addSuspicion = useGameStore((s) => s.addSuspicion);

  const handleBuy = useCallback(
    (item: BlackMarketItem) => {
      const state = useGameStore.getState();
      if (state.treasury < item.price) return;
      const stock = item.qty ?? 0;
      if (stock <= 0) {
        alert('Item out of stock');
        return;
      }
      useGameStore.setState({ treasury: state.treasury - item.price });
      addSuspicion(item.risk);
      item.qty = stock - 1;
    },
    [addSuspicion]
  );

  return (
    <div>
      <div
        style={{
          padding: 16,
          background: 'var(--illegal-bg)',
          border: '1px solid var(--illegal-dim)',
          marginBottom: 22,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 22,
          alignItems: 'center',
        }}
      >
        <div>
          <div className="t-eyebrow" style={{ color: 'var(--illegal)' }}>
            ⛧ FEDERATION SUSPICION
          </div>
          <div
            style={{
              marginTop: 8,
              position: 'relative',
              height: 16,
              background: 'var(--bg-input)',
              border: '1px solid var(--line-soft)',
            }}
          >
            <div style={{ width: `${suspicion}%`, height: '100%', background: 'var(--illegal)', opacity: 0.6 }} />
            <div
              style={{
                position: 'absolute',
                left: '70%',
                top: -2,
                bottom: -2,
                width: 1,
                background: 'var(--crit)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 'calc(70% + 4px)',
                top: -16,
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--crit)',
              }}
            >
              INVESTIGATION ▾
            </div>
          </div>
          <div className="t-meta" style={{ marginTop: 10 }}>
            <span style={{ color: 'var(--illegal)' }}>{suspicion} / 100</span> · Each sale +5–18 · Decays at −0.4/day ·
            Investigation triggers at 70
          </div>
        </div>
        <div className="t-data" style={{ fontSize: 32, color: 'var(--illegal)' }}>
          {suspicion}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span style={{ color: 'var(--illegal)' }}>BROKER OFFERINGS</span>
          <span className="head-meta">contact +12C · expires when convoy departs</span>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stock.map((i) => (
            <div
              key={i.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: 14,
                alignItems: 'center',
                padding: 14,
                background: 'var(--bg-raised)',
                border: '1px solid var(--illegal-dim)',
                borderLeft: '3px solid var(--illegal)',
              }}
            >
              <div>
                <div style={{ fontSize: 14, color: 'var(--fg-100)' }}>{i.name}</div>
                <div className="t-meta" style={{ marginTop: 4 }}>
                  Qty {i.qty} · Risk-on-detection +{i.risk}% suspicion
                </div>
              </div>
              <div className="tag illegal">ILLEGAL</div>
              <div style={{ textAlign: 'right' }}>
                <div className="t-data" style={{ fontSize: 18, color: 'var(--illegal)' }}>
                  {i.price.toLocaleString()}
                </div>
                <div className="t-meta">cr</div>
              </div>
              <button className="btn illegal sm" onClick={() => handleBuy(i)}>
                BUY ▸
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PriceSparkline() {
  const pts = [40, 38, 44, 42, 50, 56, 54, 60, 62, 68, 72, 80];
  const max = 90;
  const w = 320;
  const h = 70;
  const xStep = w / (pts.length - 1);
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${i * xStep},${h - (p / max) * h}`).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.14 200 / 0.4)" />
          <stop offset="100%" stopColor="oklch(0.78 0.14 200 / 0)" />
        </linearGradient>
      </defs>
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="url(#g1)" />
      <path d={path} fill="none" stroke="var(--signal)" strokeWidth="1.5" />
      {pts.map((p, i) => (
        <circle key={i} cx={i * xStep} cy={h - (p / max) * h} r="1.5" fill="var(--signal)" />
      ))}
    </svg>
  );
}

function CargoStockpile({
  ores,
  asteroid,
  market,
}: {
  ores: OreDef[];
  asteroid: AsteroidState | undefined;
  market: MarketState;
}) {
  return (
    <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
      <div className="t-eyebrow">STOCKPILE · ALL ASTEROIDS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
        {ores.slice(0, 7).map((o) => {
          const stock = asteroid?.resources.ores[o.id] ?? 0;
          const cap = 1000;
          const price = market.prices[o.id] ?? o.price;
          return (
            <div key={o.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, background: o.color }} />
                  <span style={{ color: 'var(--fg-80)' }}>{o.name}</span>
                </span>
                <span className="t-data" style={{ color: 'var(--fg-100)' }}>
                  {stock}
                  <span style={{ color: 'var(--fg-40)' }}>/{cap}t</span>
                  <span style={{ color: 'var(--fg-40)', marginLeft: 6 }}>@ {price} cr</span>
                </span>
              </div>
              <div className="meter" style={{ marginTop: 4, height: 3 }}>
                <div style={{ width: `${Math.min(100, (stock / cap) * 100)}%`, background: o.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MarketStatus({ market }: { market: MarketState }) {
  const keyOres = ['crystalite', 'dragonium', 'korellium', 'barium'] as OreKind[];
  return (
    <div style={{ padding: 18 }}>
      <div className="t-eyebrow">MARKET TICK</div>
      <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {keyOres.map((ore) => {
          const price = market.prices[ore] ?? 0;
          const demand = market.demand[ore] ?? 1.0;
          const arrow = demand > 1.0 ? '▲' : demand < 1.0 ? '▼' : '—';
          const color = demand > 1.0 ? 'var(--ally)' : demand < 1.0 ? 'var(--crit)' : 'var(--fg-60)';
          return (
            <div
              key={ore}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 10,
                padding: '8px 0',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div style={{ color: 'var(--fg-100)', textTransform: 'capitalize' }}>{ore}</div>
              <div style={{ color: 'var(--warn)' }}>{price.toLocaleString()} cr</div>
              <div style={{ color, fontWeight: 500 }}>{arrow}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  fontWeight: 500,
};

const td: React.CSSProperties = {
  padding: '10px 14px',
  fontFamily: 'var(--font-mono)',
  color: 'var(--fg-80)',
};
