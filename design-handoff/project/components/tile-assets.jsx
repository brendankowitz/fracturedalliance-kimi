// tile-assets.jsx — Isometric building tiles (variant of BuildingGlyph)
// 48x48 viewBox, 2:1 isometric projection, three-tone shading + warm accent.
// Exports: BuildingTile

const TILE_TONES = {
  top:    '#3f4858',   // ~oklch(0.46 .022 240)
  topLit: '#4f5867',   // ~oklch(0.54 .025 240)
  sideR:  '#1c212c',   // ~oklch(0.22 .014 240)
  sideL:  '#2a3140',   // ~oklch(0.32 .018 240)
  edge:   '#0c0f17',   // ~oklch(0.12 .010 240)
  pad:    '#161b25',   // ~oklch(0.18 .012 240)
  water:  '#5c9bb8',   // ~oklch(0.55 .10 200)
  waterBg: 'rgba(54, 96, 116, 0.6)',
  glass:  'rgba(80, 156, 102, 0.45)',
  glassD: 'rgba(54, 122, 80, 0.5)',
  plant:  '#79c188',   // ~oklch(0.70 .14 150)
  windowD:'rgba(106, 76, 38, 0.55)',
  windowD2:'rgba(106, 76, 38, 0.35)',
  steam:  '#737e8d',   // ~oklch(0.55 .04 240)
  glow:   '#e8a04a',   // warm amber to match --warn
  glowDim:'#a87530',
};

// Helper: isometric box. cx,cy = floor-front-point; w = half-width, d = half-depth, h = height
function IsoBox({ cx, cy, w, d, h, top = TILE_TONES.top, sideR = TILE_TONES.sideR, sideL = TILE_TONES.sideL, stroke = TILE_TONES.edge }) {
  const fb = [cx, cy];
  const rb = [cx + w, cy - w / 2];
  const lb = [cx - d, cy - d / 2];
  const bb = [cx + w - d, cy - w / 2 - d / 2];
  const ft = [cx, cy - h];
  const rt = [cx + w, cy - w / 2 - h];
  const lt = [cx - d, cy - d / 2 - h];
  const bt = [cx + w - d, cy - w / 2 - d / 2 - h];
  return (
    <g>
      <polygon points={`${fb} ${lb} ${lt} ${ft}`} fill={sideL} stroke={stroke} strokeWidth="0.3" />
      <polygon points={`${fb} ${rb} ${rt} ${ft}`} fill={sideR} stroke={stroke} strokeWidth="0.3" />
      <polygon points={`${ft} ${rt} ${bt} ${lt}`} fill={top} stroke={stroke} strokeWidth="0.3" />
    </g>
  );
}

// Helper: isometric platform/floor pad
function IsoPad({ cx, cy, w, d, fill = '#161b25', stroke = TILE_TONES.edge }) {
  return (
    <polygon
      points={`${cx},${cy} ${cx + w},${cy - w / 2} ${cx + w - d},${cy - w / 2 - d / 2} ${cx - d},${cy - d / 2}`}
      fill={fill} stroke={stroke} strokeWidth="0.3"
    />
  );
}

function BuildingTile({ id, size = 56, glow = true }) {
  const props = { width: size, height: size, viewBox: '0 0 48 48', xmlns: 'http://www.w3.org/2000/svg' };

  switch (id) {
    case 'cpu': return (
      <svg {...props}>
        <IsoPad cx="24" cy="40" w="14" d="14" />
        {/* base tower */}
        <IsoBox cx="24" cy="40" w="10" d="10" h="14" />
        {/* upper smaller tower */}
        <IsoBox cx="24" cy={40 - 14} w="6" d="6" h="8" top={TILE_TONES.topLit} />
        {/* antenna */}
        <line x1="24" y1="18" x2="24" y2="10" stroke="#a87530" strokeWidth="0.6" />
        <circle cx="24" cy="9" r="1.4" fill="#e8a04a" className="fa-pulse" />
        {/* windows */}
        {glow && [0, 1, 2].map(i => (
          <g key={i}>
            <rect x="19" y={32 - i * 3} width="2" height="1.4" fill="#e8a04a" className={i === 0 ? 'fa-flicker' : i === 1 ? 'fa-flicker-2' : 'fa-flicker-3'} />
            <rect x="22" y={32 - i * 3} width="2" height="1.4" fill="#a87530" className={i === 0 ? 'fa-flicker-3' : 'fa-flicker-2'} />
          </g>
        ))}
      </svg>
    );

    case 'air': return (
      <svg {...props}>
        <IsoPad cx="24" cy="40" w="14" d="14" />
        <IsoBox cx="24" cy="40" w="12" d="12" h="10" />
        {/* intake fan on front-left face */}
        <circle cx="18" cy="33" r="3" fill={TILE_TONES.sideL} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <circle cx="18" cy="33" r="3" fill="none" stroke="#e8a04a" strokeWidth="0.5" />
        <g className="fa-spin" style={{ transformOrigin: '18px 33px' }} stroke="#a87530" strokeWidth="0.5">
          <line x1="18" y1="30.5" x2="18" y2="35.5" />
          <line x1="15.5" y1="33" x2="20.5" y2="33" />
          <line x1="16.2" y1="31.2" x2="19.8" y2="34.8" />
          <line x1="19.8" y1="31.2" x2="16.2" y2="34.8" />
        </g>
        <circle cx="18" cy="33" r="0.8" fill="#e8a04a" />
        {/* exhaust on top */}
        <ellipse cx="22" cy="29" rx="2" ry="1" fill={TILE_TONES.sideR} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <ellipse cx="22" cy="29" rx="1.2" ry="0.6" fill={TILE_TONES.edge} />
      </svg>
    );

    case 'hydration': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="14" d="14" />
        {/* main cylindrical tank */}
        <ellipse cx="24" cy="42" rx="9" ry="4.5" fill={TILE_TONES.sideR} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <rect x="15" y="28" width="18" height="14" fill={TILE_TONES.sideL} stroke="none" />
        <path d="M 15 28 a 9 4.5 0 0 0 18 0" fill="none" stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <ellipse cx="24" cy="28" rx="9" ry="4.5" fill={TILE_TONES.topLit} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <ellipse cx="24" cy="28" rx="6" ry="3" fill="rgba(54, 96, 116, 0.6)" stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* water level lines */}
        <path d="M 15 34 a 9 4.5 0 0 0 18 0" fill="none" stroke="#5c9bb8" strokeWidth="0.4" className="fa-pulse-slow" />
        <path d="M 15 38 a 9 4.5 0 0 0 18 0" fill="none" stroke="#5c9bb8" strokeWidth="0.4" className="fa-pulse" />
        {/* small pipe right */}
        <rect x="33" y="34" width="2" height="6" fill={TILE_TONES.sideR} stroke={TILE_TONES.edge} strokeWidth="0.3" />
      </svg>
    );

    case 'hydroponics': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="16" d="14" />
        {/* low base */}
        <IsoBox cx="24" cy="42" w="14" d="12" h="3" />
        {/* gabled greenhouse - 3 sections */}
        {[-7, 0, 7].map((dx, i) => {
          const cx = 24 + dx * 0.5;
          return (
            <g key={i}>
              <polygon
                points={`${cx - 4},${36 - dx * 0.5} ${cx + 4},${33 - dx * 0.5} ${cx + 4 - 6},${33 - dx * 0.5 - 3} ${cx - 4 - 6},${36 - dx * 0.5 - 3}`}
                fill="rgba(80, 156, 102, 0.45)" stroke={TILE_TONES.edge} strokeWidth="0.3"
              />
              <polygon
                points={`${cx - 4},${36 - dx * 0.5} ${cx + 4},${33 - dx * 0.5} ${cx + 4},${36 - dx * 0.5} ${cx - 4},${39 - dx * 0.5}`}
                fill="rgba(54, 122, 80, 0.5)" stroke={TILE_TONES.edge} strokeWidth="0.3"
              />
            </g>
          );
        })}
        {/* plant rows visible */}
        <g fill="#79c188" className="fa-pulse-slow">
          <circle cx="14" cy="37" r="0.5" />
          <circle cx="17" cy="37" r="0.5" />
          <circle cx="22" cy="35" r="0.5" />
          <circle cx="25" cy="35" r="0.5" />
        </g>
      </svg>
    );

    case 'living': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="15" d="15" />
        {/* 3 small habitat domes */}
        {[[18, 38, 5], [27, 36, 6], [30, 41, 4]].map(([cx, cy, r], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.5} fill={TILE_TONES.topLit} stroke={TILE_TONES.edge} strokeWidth="0.3" />
            <path d={`M ${cx - r} ${cy} a ${r} ${r * 0.5} 0 0 0 ${r * 2} 0`} fill="none" stroke={TILE_TONES.edge} strokeWidth="0.3" />
            <path d={`M ${cx - r * 0.7} ${cy - r * 0.35} a ${r * 0.7} ${r * 0.35} 0 0 0 ${r * 1.4} 0`} fill="none" stroke={TILE_TONES.glowDim} strokeWidth="0.4" />
          </g>
        ))}
        {/* connecting corridor */}
        <rect x="20" y="39" width="6" height="2" fill={TILE_TONES.sideL} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* small windows */}
        {glow && (
          <>
            <rect x="17" y="38" width="1" height="1" fill="#e8a04a" className="fa-flicker" />
            <rect x="26" y="36" width="1" height="1" fill="#e8a04a" className="fa-flicker-2" />
            <rect x="30" y="41" width="0.8" height="0.8" fill="#e8a04a" className="fa-flicker-3" />
          </>
        )}
      </svg>
    );

    case 'resiblock': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="13" d="13" />
        <IsoBox cx="24" cy="42" w="10" d="10" h="22" />
        {/* window grid on left face (lit) */}
        {glow && (
          <g>
            {[0,1,2,3,4].map(row => (
              <g key={row}>
                {[0,1,2].map(col => {
                  const wx = 24 - 8 + col * 3;
                  const wy = 40 - 4 - col * 1.5 - row * 4;
                  const on = (row * 3 + col) % 2 === 0;
                  return <rect key={col} x={wx} y={wy} width="1.2" height="2"
                    fill={on ? '#e8a04a' : 'rgba(106, 76, 38, 0.55)'}
                    className={['fa-flicker','fa-flicker-2','fa-flicker-3'][(row+col)%3]} />;
                })}
              </g>
            ))}
            {/* window grid on right face (shadow) */}
            {[0,1,2,3,4].map(row => (
              <g key={`r${row}`}>
                {[0,1,2].map(col => {
                  const wx = 24 + 2 + col * 3;
                  const wy = 39 - col * 1.5 - row * 4;
                  const on = (row + col) % 3 !== 0;
                  return <rect key={col} x={wx} y={wy} width="1.2" height="2"
                    fill={on ? '#a87530' : 'rgba(106, 76, 38, 0.35)'}
                    className={['fa-flicker-2','fa-flicker','fa-flicker-3'][(row+col)%3]} />;
                })}
              </g>
            ))}
          </g>
        )}
      </svg>
    );

    case 'pleasure': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="18" d="18" />
        {/* base ring */}
        <ellipse cx="24" cy="42" rx="14" ry="7" fill={TILE_TONES.sideR} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <ellipse cx="24" cy="40" rx="14" ry="7" fill={TILE_TONES.sideL} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* dome */}
        <path d="M 10 40 A 14 14 0 0 1 38 40 Z" fill={TILE_TONES.top} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* dome panels (lit) */}
        <path d="M 24 26 L 14 39 M 24 26 L 19 39 M 24 26 L 24 40 M 24 26 L 29 39 M 24 26 L 34 39" stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <path d="M 11 35 A 14 14 0 0 1 37 35" fill="none" stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <path d="M 13 30 A 14 14 0 0 1 35 30" fill="none" stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* center glow */}
        {glow && <circle cx="24" cy="30" r="2" fill="#e8a04a" opacity="0.7" className="fa-pulse" />}
        {glow && <circle cx="24" cy="30" r="3.5" fill="none" stroke="#e8a04a" strokeWidth="0.3" className="fa-pulse-slow" />}
      </svg>
    );

    case 'medical': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="13" d="13" />
        <IsoBox cx="24" cy="42" w="10" d="10" h="10" top={TILE_TONES.topLit} />
        {/* cross on roof, raised */}
        <g transform="translate(24, 31)" className="fa-pulse-slow">
          <rect x="-1" y="-3" width="2" height="6" fill="#e8a04a" stroke={TILE_TONES.edge} strokeWidth="0.3" />
          <rect x="-3" y="-1" width="6" height="2" fill="#e8a04a" stroke={TILE_TONES.edge} strokeWidth="0.3" />
        </g>
        {/* entry door */}
        <rect x="22.5" y="37" width="3" height="3" fill="#e8a04a" opacity="0.7" />
        {glow && (
          <>
            <rect x="16" y="37" width="1.5" height="2" fill="#e8a04a" className="fa-flicker" />
            <rect x="19" y="38" width="1.5" height="2" fill="#a87530" className="fa-flicker-2" />
          </>
        )}
      </svg>
    );

    case 'security': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="14" d="14" />
        <IsoBox cx="24" cy="42" w="11" d="11" h="6" />
        {/* rotating watchtower */}
        <IsoBox cx="22" cy="36" w="3" d="3" h="6" top={TILE_TONES.topLit} />
        <g className="fa-spin-slow" style={{ transformOrigin: '22px 30px' }}>
          <ellipse cx="22" cy="30" rx="2" ry="1" fill="#e8a04a" stroke={TILE_TONES.edge} strokeWidth="0.3" />
          <line x1="22" y1="30" x2="28" y2="28" stroke="#e8a04a" strokeWidth="0.5" />
          <circle cx="28.5" cy="27.8" r="0.6" fill="#e8a04a" />
        </g>
        {/* fence corners */}
        {glow && [[16, 41], [32, 39], [30, 44]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.4" fill="#a87530" className={i === 0 ? 'fa-blink' : 'fa-blink-2'} />
        ))}
      </svg>
    );

    case 'radfilter': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="14" d="14" />
        {/* hyperboloid cooling tower */}
        <path d="M 18 42 Q 16 34 18 26 L 30 26 Q 32 34 30 42 Z" fill={TILE_TONES.sideL} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <path d="M 18 42 Q 16 34 18 26" fill="none" stroke={TILE_TONES.edge} strokeWidth="0.4" />
        <path d="M 30 42 Q 32 34 30 26" fill="none" stroke={TILE_TONES.edge} strokeWidth="0.4" />
        {/* top opening */}
        <ellipse cx="24" cy="26" rx="6" ry="2.5" fill={TILE_TONES.edge} stroke={TILE_TONES.glowDim} strokeWidth="0.3" />
        {/* base */}
        <ellipse cx="24" cy="42" rx="6" ry="2.5" fill={TILE_TONES.sideR} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* steam ring */}
        <ellipse cx="24" cy="23" rx="5" ry="1.5" fill="none" stroke="#737e8d" strokeWidth="0.3" strokeDasharray="1,1" className="fa-rise" />
        <ellipse cx="24" cy="20" rx="4" ry="1.2" fill="none" stroke="#737e8d" strokeWidth="0.3" strokeDasharray="1,1" className="fa-rise-2" />
        {/* warning lights at base */}
        {glow && <circle cx="28" cy="42" r="0.6" fill="#e8a04a" className="fa-blink" />}
      </svg>
    );

    case 'mine1': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="14" d="14" />
        {/* mine entry pad */}
        <IsoBox cx="24" cy="42" w="11" d="11" h="2" />
        {/* dark pit */}
        <polygon points="22,37 28,36 28,38 22,39" fill={TILE_TONES.edge} stroke="#a87530" strokeWidth="0.3" />
        {/* small headframe */}
        <line x1="20" y1="38" x2="22" y2="30" stroke={TILE_TONES.sideL} strokeWidth="0.8" />
        <line x1="26" y1="36.5" x2="22" y2="30" stroke={TILE_TONES.sideL} strokeWidth="0.8" />
        <line x1="22" y1="30" x2="29" y2="34" stroke={TILE_TONES.sideR} strokeWidth="0.8" />
        <circle cx="22" cy="30" r="1" fill="#e8a04a" stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* conveyor */}
        <polygon points="28,38 35,42 35,44 28,40" fill={TILE_TONES.sideR} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <line x1="28" y1="39" x2="35" y2="43" stroke="#a87530" strokeWidth="0.4" strokeDasharray="1 1" className="fa-conveyor" />
        <circle cx="22" cy="30" r="0.6" fill="#e8a04a" className="fa-pulse" />
      </svg>
    );

    case 'mine2': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="16" d="16" />
        <IsoBox cx="24" cy="42" w="13" d="13" h="3" />
        {/* twin pits */}
        <polygon points="18,37 23,36 23,38 18,39" fill={TILE_TONES.edge} stroke="#a87530" strokeWidth="0.3" />
        <polygon points="25,36 30,35 30,37 25,38" fill={TILE_TONES.edge} stroke="#a87530" strokeWidth="0.3" />
        {/* twin headframes */}
        <g stroke={TILE_TONES.sideL} strokeWidth="0.8" fill="none">
          <line x1="16" y1="38" x2="20" y2="28" />
          <line x1="23" y1="36" x2="20" y2="28" />
          <line x1="23" y1="36" x2="28" y2="26" />
          <line x1="30" y1="35" x2="28" y2="26" />
        </g>
        <circle cx="20" cy="28" r="1.2" fill="#e8a04a" className="fa-pulse" />
        <circle cx="28" cy="26" r="1.2" fill="#e8a04a" className="fa-pulse-slow" />
        <line x1="20" y1="28" x2="28" y2="26" stroke="#a87530" strokeWidth="0.4" />
        {/* conveyor right */}
        <polygon points="30,37 38,42 38,44 30,39" fill={TILE_TONES.sideR} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <line x1="30" y1="38" x2="38" y2="43" stroke="#a87530" strokeWidth="0.4" strokeDasharray="1 1" className="fa-conveyor" />
      </svg>
    );

    case 'deep': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="13" d="13" />
        <IsoBox cx="24" cy="42" w="10" d="10" h="3" />
        {/* tall drill derrick */}
        <g stroke={TILE_TONES.sideL} strokeWidth="0.8" fill="none">
          <line x1="20" y1="39" x2="24" y2="14" />
          <line x1="28" y1="38" x2="24" y2="14" />
          <line x1="22" y1="39" x2="24" y2="14" />
          <line x1="26" y1="38" x2="24" y2="14" />
          {/* cross braces */}
          <line x1="21" y1="33" x2="27" y2="32" />
          <line x1="22" y1="27" x2="26" y2="26" />
          <line x1="23" y1="21" x2="25" y2="21" />
        </g>
        {/* top crown */}
        <circle cx="24" cy="14" r="1.2" fill="#e8a04a" className="fa-blink" />
        {/* bore hole */}
        <ellipse cx="24" cy="40" rx="2" ry="1" fill={TILE_TONES.edge} stroke="#a87530" strokeWidth="0.3" />
      </svg>
    );

    case 'seismic': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="18" d="18" />
        <g className="fa-shake">
          {/* hexagonal containment */}
          <polygon points="24,28 32,32 32,40 24,44 16,40 16,32"
            fill={TILE_TONES.sideL} stroke={TILE_TONES.edge} strokeWidth="0.4" />
          <polygon points="24,28 32,32 24,36 16,32"
            fill={TILE_TONES.topLit} stroke={TILE_TONES.edge} strokeWidth="0.4" />
          <line x1="24" y1="28" x2="24" y2="44" stroke={TILE_TONES.edge} strokeWidth="0.4" />
          {/* drill emerging */}
          <line x1="24" y1="28" x2="24" y2="14" stroke={TILE_TONES.sideR} strokeWidth="1.6" />
          <polygon points="22,14 26,14 24,8" fill="#e8a04a" stroke={TILE_TONES.edge} strokeWidth="0.3" />
          {/* warning band */}
          <line x1="16" y1="36" x2="32" y2="36" stroke="#e8a04a" strokeWidth="0.5" strokeDasharray="1,1" />
        </g>
        {/* corner lights */}
        {glow && (
          <>
            <circle cx="16" cy="36" r="0.7" fill="#dc5050" className="fa-blink" />
            <circle cx="32" cy="36" r="0.7" fill="#dc5050" className="fa-blink-2" />
            <circle cx="24" cy="44" r="0.7" fill="#dc5050" className="fa-blink" />
          </>
        )}
      </svg>
    );

    case 'power1': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="14" d="14" />
        <IsoBox cx="24" cy="42" w="11" d="11" h="8" />
        {/* twin chimneys */}
        <rect x="18" y="26" width="2" height="8" fill={TILE_TONES.sideL} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <rect x="20" y="26" width="2" height="8" fill={TILE_TONES.sideR} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <ellipse cx="20" cy="26" rx="2" ry="0.8" fill={TILE_TONES.edge} stroke="#a87530" strokeWidth="0.3" />
        {/* exhaust glow */}
        {glow && <ellipse cx="20" cy="23" rx="1.6" ry="0.8" fill="#e8a04a" opacity="0.5" className="fa-rise" />}
        {/* lightning bolt sign */}
        <polygon points="28,32 25,38 27,38 25,42" fill="#e8a04a" stroke={TILE_TONES.edge} strokeWidth="0.3" className="fa-pulse" />
        {/* windows */}
        {glow && [[16, 39], [29, 38]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="1.4" height="1.8" fill="#e8a04a" className={i ? 'fa-flicker-2' : 'fa-flicker'} />
        ))}
      </svg>
    );

    case 'power2': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="17" d="17" />
        {/* base */}
        <IsoBox cx="24" cy="42" w="13" d="13" h="6" />
        {/* central reactor dome */}
        <ellipse cx="24" cy="34" rx="6" ry="3" fill={TILE_TONES.sideR} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <path d="M 18 34 A 6 6 0 0 1 30 34 Z" fill={TILE_TONES.topLit} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* glow rings on dome */}
        <path d="M 19 33 A 5 5 0 0 1 29 33" fill="none" stroke="#e8a04a" strokeWidth="0.4" className="fa-pulse-slow" />
        <path d="M 21 30 A 3 3 0 0 1 27 30" fill="none" stroke="#e8a04a" strokeWidth="0.4" className="fa-pulse" />
        {glow && <circle cx="24" cy="32" r="1.2" fill="#e8a04a" opacity="0.9" className="fa-pulse" />}
        {/* twin cooling stacks */}
        <rect x="14" y="30" width="2" height="10" fill={TILE_TONES.sideL} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <rect x="32" y="30" width="2" height="10" fill={TILE_TONES.sideL} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <ellipse cx="15" cy="30" rx="1.2" ry="0.5" fill={TILE_TONES.edge} />
        <ellipse cx="33" cy="30" rx="1.2" ry="0.5" fill={TILE_TONES.edge} />
      </svg>
    );

    case 'storage': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="15" d="15" />
        {/* 4 cylindrical silos */}
        {[[19, 38, 3], [27, 36, 3], [22, 41, 2.5], [30, 41, 2.5]].map(([cx, cy, r], i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy + 10} rx={r} ry={r * 0.4} fill={TILE_TONES.sideR} stroke={TILE_TONES.edge} strokeWidth="0.3" />
            <rect x={cx - r} y={cy} width={r * 2} height="10" fill={TILE_TONES.sideL} />
            <path d={`M ${cx - r} ${cy} L ${cx - r} ${cy + 10}`} stroke={TILE_TONES.edge} strokeWidth="0.3" />
            <path d={`M ${cx + r} ${cy} L ${cx + r} ${cy + 10}`} stroke={TILE_TONES.edge} strokeWidth="0.3" />
            <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.4} fill={TILE_TONES.topLit} stroke={TILE_TONES.edge} strokeWidth="0.3" />
            {/* level marker */}
            <ellipse cx={cx} cy={cy + 5} rx={r - 0.3} ry={r * 0.4 - 0.1} fill="none" stroke="#a87530" strokeWidth="0.3" className={['fa-pulse-slow','fa-pulse','fa-pulse-slow','fa-pulse'][i]} />
          </g>
        ))}
      </svg>
    );

    case 'laser': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="13" d="13" />
        {/* base */}
        <IsoBox cx="24" cy="42" w="10" d="10" h="4" />
        {/* turret column */}
        <ellipse cx="24" cy="36" rx="4" ry="2" fill={TILE_TONES.sideR} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <rect x="20" y="32" width="8" height="4" fill={TILE_TONES.sideL} />
        <ellipse cx="24" cy="32" rx="4" ry="2" fill={TILE_TONES.topLit} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* barrel pointing up-right */}
        <line x1="24" y1="32" x2="32" y2="20" stroke={TILE_TONES.sideR} strokeWidth="1.6" />
        <circle cx="32" cy="20" r="1.2" fill="#e8a04a" stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* energy charge */}
        {glow && <circle cx="32" cy="20" r="2" fill="none" stroke="#e8a04a" strokeWidth="0.4" className="fa-charge" />}
        {glow && <line x1="32" y1="20" x2="36" y2="14" stroke="#e8a04a" strokeWidth="0.4" strokeDasharray="0.6,0.6" className="fa-pulse" />}
      </svg>
    );

    case 'silo': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="14" d="14" />
        <IsoBox cx="24" cy="42" w="11" d="11" h="3" />
        {/* silo doors on top (segmented) */}
        <polygon points="20,38 28,36 28,40 20,42" fill={TILE_TONES.edge} stroke="#a87530" strokeWidth="0.4" />
        <line x1="24" y1="37" x2="24" y2="41" stroke="#a87530" strokeWidth="0.3" />
        {/* perimeter warning lights */}
        {glow && [[16, 41], [32, 39], [22, 44], [30, 43]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.6" fill={i % 2 ? '#e8a04a' : '#dc5050'} className={i % 2 ? 'fa-blink' : 'fa-blink-2'} />
        ))}
        {/* missile tip emerging */}
        <polygon points="23,33 25,33 24,29" fill="#e8a04a" stroke={TILE_TONES.edge} strokeWidth="0.3" className="fa-pulse" />
        <line x1="24" y1="29" x2="24" y2="36" stroke={TILE_TONES.sideR} strokeWidth="0.4" strokeDasharray="0.4,0.6" />
      </svg>
    );

    case 'gravnull': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="15" d="15" />
        <IsoBox cx="24" cy="42" w="11" d="11" h="6" />
        {/* dish base */}
        <line x1="24" y1="36" x2="24" y2="26" stroke={TILE_TONES.sideL} strokeWidth="1.4" />
        {/* parabolic dish (ellipse arc, facing up-left) */}
        <ellipse cx="24" cy="22" rx="9" ry="3" fill={TILE_TONES.sideL} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <path d="M 15 22 A 9 4.5 0 0 1 33 22 Z" fill={TILE_TONES.topLit} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <ellipse cx="24" cy="22" rx="6" ry="2" fill="none" stroke="#e8a04a" strokeWidth="0.3" />
        <ellipse cx="24" cy="22" rx="3" ry="1" fill="none" stroke="#e8a04a" strokeWidth="0.3" />
        <circle cx="24" cy="22" r="0.8" fill="#e8a04a" />
        {/* anti-grav waves */}
        {glow && (
          <>
            <ellipse cx="24" cy="22" rx="6" ry="1.5" fill="none" stroke="#e8a04a" strokeWidth="0.4" className="fa-wave" />
            <ellipse cx="24" cy="22" rx="6" ry="1.5" fill="none" stroke="#a87530" strokeWidth="0.4" className="fa-wave-2" />
            <ellipse cx="24" cy="22" rx="6" ry="1.5" fill="none" stroke="#a87530" strokeWidth="0.4" className="fa-wave-3" />
          </>
        )}
      </svg>
    );

    case 'shipyard': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="18" d="14" />
        {/* long hangar */}
        <IsoBox cx="24" cy="42" w="14" d="10" h="6" />
        {/* curved roof */}
        <path d="M 10 36 Q 24 28 38 36 L 38 36 L 24 30 Z" fill={TILE_TONES.topLit} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <path d="M 10 36 Q 24 28 38 36" fill="none" stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* bay door opening (interior glow) */}
        <polygon points="14,38 20,38 20,42 14,42" fill="#e8a04a" opacity="0.8" className="fa-pulse-slow" />
        <polygon points="14,38 20,38 20,42 14,42" fill="none" stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* small ship inside */}
        <polygon points="15,40 19,40 17,41.5" fill={TILE_TONES.edge} />
        {/* roof lights */}
        {glow && [[18, 31], [24, 29], [30, 31]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.5" fill="#e8a04a" className={i === 1 ? 'fa-blink' : 'fa-blink-2'} />
        ))}
      </svg>
    );

    case 'dock': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="14" d="14" />
        {/* support pylon */}
        <line x1="24" y1="42" x2="24" y2="32" stroke={TILE_TONES.sideR} strokeWidth="1.4" />
        {/* orbital ring (elevated) */}
        <ellipse cx="24" cy="22" rx="14" ry="6" fill="none" stroke={TILE_TONES.sideR} strokeWidth="2.4" />
        <ellipse cx="24" cy="22" rx="14" ry="6" fill="none" stroke={TILE_TONES.topLit} strokeWidth="1.2" />
        {/* docked ship */}
        <polygon points="24,18 27,22 24,24 21,22" fill={TILE_TONES.sideL} stroke={TILE_TONES.edge} strokeWidth="0.3" />
        <line x1="24" y1="18" x2="24" y2="24" stroke={TILE_TONES.edge} strokeWidth="0.3" />
        {/* ring lights */}
        {glow && [[10, 22], [38, 22], [24, 16], [24, 28]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.7" fill="#e8a04a" className={i % 2 ? 'fa-blink' : 'fa-blink-2'} />
        ))}
      </svg>
    );

    case 'engine': return (
      <svg {...props}>
        <IsoPad cx="24" cy="42" w="18" d="14" />
        {/* main thruster block */}
        <IsoBox cx="24" cy="42" w="14" d="10" h="10" />
        {/* 3 exhaust nozzles facing right */}
        {[0, 1, 2].map(i => {
          const y = 33 + i * 3;
          const cls = ['fa-thrust', 'fa-thrust-2', 'fa-thrust-3'][i];
          return (
            <g key={i}>
              <ellipse cx="40" cy={y} rx="2" ry="1.4" fill={TILE_TONES.edge} stroke={TILE_TONES.glowDim} strokeWidth="0.3" />
              <ellipse cx="40" cy={y} rx="1.2" ry="0.8" fill="#e8a04a" opacity={glow ? 0.9 : 0.4} className={cls} />
              {/* exhaust plume */}
              {glow && <ellipse cx="44" cy={y} rx="3" ry="0.6" fill="#e8a04a" opacity="0.4" className={cls} />}
            </g>
          );
        })}
        {/* warning stripes on body */}
        <line x1="18" y1="36" x2="32" y2="33" stroke="#e8a04a" strokeWidth="0.4" strokeDasharray="1,1" />
        <line x1="18" y1="40" x2="32" y2="37" stroke="#e8a04a" strokeWidth="0.4" strokeDasharray="1,1" />
      </svg>
    );

    default: return (
      <svg {...props}>
        <IsoPad cx="24" cy="40" w="10" d="10" />
        <IsoBox cx="24" cy="40" w="8" d="8" h="8" />
        <text x="24" y="25" fontSize="6" fill="#e8a04a" textAnchor="middle" fontFamily="JetBrains Mono">?</text>
      </svg>
    );
  }
}

Object.assign(window, { BuildingTile });
