// trade.jsx — Commerce & Logistics screen
// Three tabs: Federal Ore Transporter / Independent Merchants / Black Market

function Trade() {
  const [channel, setChannel] = React.useState('federal');
  const ores = window.GameData.ORES;

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
            <div className="t-data" style={{ fontSize: 22, color: 'var(--warn)' }}>142,840 cr</div>
            <div className="stat-delta up">▲ +1,820 / day</div>
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
          {channel === 'federal'  && <FederalChannel ores={ores} />}
          {channel === 'merchant' && <MerchantChannel />}
          {channel === 'black'    && <BlackMarketChannel />}
        </div>
      </section>

      <aside style={{ background: 'var(--bg-base)', overflowY: 'auto' }}>
        <CargoStockpile ores={ores} />
        <RecentTrades />
      </aside>
    </div>
  );
}

function ChannelTab({ id, current, onClick, label, sub, color }) {
  const active = current === id;
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 18px',
        background: active ? 'var(--bg-base)' : 'transparent',
        borderTop: '1px solid ' + (active ? `var(--${color === 'illegal' ? 'illegal-dim' : color === 'warn' ? 'warn-dim' : 'signal-dim'})` : 'var(--line-soft)'),
        borderLeft: '1px solid ' + (active ? 'var(--line-soft)' : 'transparent'),
        borderRight: '1px solid ' + (active ? 'var(--line-soft)' : 'transparent'),
        borderBottom: '1px solid ' + (active ? 'transparent' : 'var(--line-soft)'),
        position: 'relative', top: 1,
        textAlign: 'left',
      }}
    >
      <div className="t-eyebrow" style={{
        color: active
          ? (color === 'illegal' ? 'var(--illegal)' : color === 'warn' ? 'var(--warn)' : 'var(--signal)')
          : 'var(--fg-40)',
      }}>{label}</div>
      <div className="t-meta" style={{ marginTop: 4 }}>{sub}</div>
    </button>
  );
}

function FederalChannel({ ores }) {
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
              <div><span className="t-meta">capacity</span> <div className="t-data" style={{ color: 'var(--fg-100)' }}>2,400 t</div></div>
              <div><span className="t-meta">pre-booked</span> <div className="t-data" style={{ color: 'var(--fg-100)' }}>1,180 t</div></div>
              <div><span className="t-meta">your queue</span> <div className="t-data" style={{ color: 'var(--warn)' }}>640 t</div></div>
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
            <div className="t-meta" style={{ marginTop: 4 }}>Crystalite rising · Dragonium peaking · Korellium soft</div>
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
              <th style={{ ...th, textAlign: 'center' }}>SELL</th>
            </tr>
          </thead>
          <tbody>
            {ores.map(o => {
              const stock = [320, 180, 940, 412, 88, 240, 56, 28, 12, 2][o.tier - 1] + Math.floor(Math.random() * 300);
              const fedPrice = Math.round(o.price * 0.7);
              const trend = ['barium','crystalite','dragonium'].includes(o.id) ? 'up' : ['korellium'].includes(o.id) ? 'down' : 'flat';
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
                  <td style={{ ...td, textAlign: 'right', color: trend === 'up' ? 'var(--ally)' : trend === 'down' ? 'var(--crit)' : 'var(--fg-60)' }}>
                    {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
                  </td>
                  <td style={{ ...td, textAlign: 'right', color: 'var(--warn)' }}>{(stock * fedPrice).toLocaleString()}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <button className="btn sm">SELL ALL</button>
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

function MerchantChannel() {
  const stock = window.GameData.MERCHANT_STOCK;
  return (
    <div>
      <div className="panel" style={{ marginBottom: 22 }}>
        <div className="panel-head">
          <span>CONVOY DOCKED · ARCH-I</span>
          <span className="head-meta">departs in 6 days</span>
        </div>
        <div className="panel-body" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 22, alignItems: 'center' }}>
          <div style={{
            aspectRatio: '16/9',
            background: 'var(--bg-input)',
            border: '1px solid var(--line)',
            position: 'relative',
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent 0px, transparent 6px, oklch(0.22 0.014 240) 6px, oklch(0.22 0.014 240) 7px)',
          }}>
            <div style={{ position: 'absolute', inset: 12, border: '1px solid var(--warn-dim)', display: 'grid', placeItems: 'center' }}>
              <div style={{ textAlign: 'center', color: 'var(--warn)' }}>
                <div style={{ fontSize: 28 }}>⊳⊳⊳</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', marginTop: 6 }}>MERCHANT CONVOY</div>
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>Captain Aviv-7 Reska</div>
            <div className="t-meta">Achar-flagged independent · reputation neutral · 4 holds</div>
            <p style={{ fontSize: 12, color: 'var(--fg-80)', marginTop: 10, lineHeight: 1.55 }}>
              "We don't pick sides. We pick prices. Two days fuel reserve. What are you buying?"
            </p>
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
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          <thead>
            <tr style={{ color: 'var(--fg-40)', background: 'var(--bg-raised)' }}>
              <th style={th}>ITEM</th>
              <th style={{ ...th, textAlign: 'right' }}>QTY</th>
              <th style={{ ...th, textAlign: 'right' }}>PRICE</th>
              <th style={th}>TAGS</th>
              <th style={{ ...th, textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {stock.map(i => (
              <tr key={i.id} style={{ borderTop: '1px solid var(--line-soft)' }}>
                <td style={td}><span style={{ color: 'var(--fg-100)' }}>{i.name}</span></td>
                <td style={{ ...td, textAlign: 'right' }}>{i.qty}</td>
                <td style={{ ...td, textAlign: 'right', color: 'var(--warn)' }}>{i.price.toLocaleString()} cr</td>
                <td style={td}>{i.rare && <span className="tag warn">RARE</span>}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <button className="btn sm">BUY · 1</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BlackMarketChannel() {
  const stock = window.GameData.BLACK_MARKET;
  const suspicion = 42;
  return (
    <div>
      <div style={{
        padding: 16,
        background: 'var(--illegal-bg)',
        border: '1px solid var(--illegal-dim)',
        marginBottom: 22,
        display: 'grid', gridTemplateColumns: '1fr auto', gap: 22, alignItems: 'center',
      }}>
        <div>
          <div className="t-eyebrow" style={{ color: 'var(--illegal)' }}>⛧ FEDERATION SUSPICION</div>
          <div style={{ marginTop: 8, position: 'relative', height: 16, background: 'var(--bg-input)', border: '1px solid var(--line-soft)' }}>
            <div style={{ width: `${suspicion}%`, height: '100%', background: 'var(--illegal)', opacity: 0.6 }} />
            <div style={{ position: 'absolute', left: '70%', top: -2, bottom: -2, width: 1, background: 'var(--crit)' }} />
            <div style={{ position: 'absolute', left: 'calc(70% + 4px)', top: -16, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--crit)' }}>INVESTIGATION ▾</div>
          </div>
          <div className="t-meta" style={{ marginTop: 10 }}>
            <span style={{ color: 'var(--illegal)' }}>42 / 100</span> · Each sale +5–18 · Decays at −0.4/day · Investigation triggers at 70
          </div>
        </div>
        <div className="t-data" style={{ fontSize: 32, color: 'var(--illegal)' }}>42</div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span style={{ color: 'var(--illegal)' }}>BROKER OFFERINGS</span>
          <span className="head-meta">contact +12C · expires when convoy departs</span>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stock.map(i => (
            <div key={i.id} style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto auto',
              gap: 14, alignItems: 'center',
              padding: 14,
              background: 'var(--bg-raised)',
              border: '1px solid var(--illegal-dim)',
              borderLeft: '3px solid var(--illegal)',
            }}>
              <div>
                <div style={{ fontSize: 14, color: 'var(--fg-100)' }}>{i.name}</div>
                <div className="t-meta" style={{ marginTop: 4 }}>Qty {i.qty} · Risk-on-detection +{i.risk}% suspicion</div>
              </div>
              <div className="tag illegal">ILLEGAL</div>
              <div style={{ textAlign: 'right' }}>
                <div className="t-data" style={{ fontSize: 18, color: 'var(--illegal)' }}>{i.price.toLocaleString()}</div>
                <div className="t-meta">cr</div>
              </div>
              <button className="btn illegal sm">BUY ▸</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PriceSparkline() {
  // Simple SVG sparkline of mock prices
  const pts = [40, 38, 44, 42, 50, 56, 54, 60, 62, 68, 72, 80];
  const max = 90;
  const w = 320, h = 70;
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

function CargoStockpile({ ores }) {
  return (
    <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)' }}>
      <div className="t-eyebrow">STOCKPILE · ALL ASTEROIDS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
        {ores.slice(0, 7).map((o, i) => {
          const stock = [840, 620, 440, 280, 160, 90, 22][i];
          const cap = 1000;
          return (
            <div key={o.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, background: o.color }} />
                  <span style={{ color: 'var(--fg-80)' }}>{o.name}</span>
                </span>
                <span className="t-data" style={{ color: 'var(--fg-100)' }}>{stock}<span style={{ color: 'var(--fg-40)' }}>/{cap}t</span></span>
              </div>
              <div className="meter" style={{ marginTop: 4, height: 3 }}>
                <div style={{ width: `${(stock / cap) * 100}%`, background: o.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentTrades() {
  const trades = [
    { t: '0341.06', side: 'SOLD',   item: '320t Crystalite', price: '+8,512 cr',  channel: 'fed',     color: 'var(--ally)' },
    { t: '0339.40', side: 'BOUGHT', item: 'Spy Satellite',   price: '−2,600 cr',  channel: 'merch',   color: 'var(--warn)' },
    { t: '0337.18', side: 'SOLD',   item: '12t Korellium',   price: '+1,180 cr',  channel: 'fed',     color: 'var(--ally)' },
    { t: '0334.02', side: 'BOUGHT', item: 'Nexos (raw) × 1', price: '−1,450 cr',  channel: 'BLACK',   color: 'var(--illegal)' },
    { t: '0331.55', side: 'SOLD',   item: '180t Barium',     price: '+3,024 cr',  channel: 'merch',   color: 'var(--ally)' },
  ];
  return (
    <div style={{ padding: 18 }}>
      <div className="t-eyebrow">RECENT LEDGER</div>
      <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        {trades.map((tr, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: 'auto 1fr auto',
            gap: 10, padding: '8px 0',
            borderBottom: '1px solid var(--line-soft)',
          }}>
            <div className="t-meta">T+{tr.t}</div>
            <div>
              <div style={{ color: 'var(--fg-100)' }}>{tr.item}</div>
              <div className="t-meta">{tr.side} · {tr.channel}</div>
            </div>
            <div style={{ color: tr.color, fontWeight: 500 }}>{tr.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const th = { padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 };
const td = { padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--fg-80)' };

Object.assign(window, { Trade });
