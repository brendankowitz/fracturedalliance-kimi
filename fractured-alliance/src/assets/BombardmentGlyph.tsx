export function BombardmentGlyph({ kind, size = 24 }: { kind: string; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, xmlns: 'http://www.w3.org/2000/svg' };
  switch (kind) {
    case 'napalm': return (
      <svg {...props}>
        <circle cx="12" cy="12" r="6" fill="currentColor" fillOpacity="0.22" className="fa-pulse" />
        <circle cx="12" cy="12" r="6" />
        <path d="M12 6 q -3 4 0 6 q 3 -2 0 -6" className="fa-pulse" />
        <path d="M12 6 q 4 4 0 8" strokeDasharray="0.5,0.5" className="fa-pulse-slow" />
        <line x1="3" y1="3" x2="6" y2="6" />
        <line x1="21" y1="3" x2="18" y2="6" />
        <line x1="3" y1="21" x2="6" y2="18" />
        <line x1="21" y1="21" x2="18" y2="18" />
      </svg>
    );
    case 'vortex': return (
      <svg {...props}>
        <g className="fa-spin-fast" style={{ transformOrigin: '12px 12px' }}>
          <path d="M12 4 a 8 8 0 1 1 -6 13" />
          <path d="M12 7 a 5 5 0 1 1 -4 8" />
          <path d="M12 10 a 2 2 0 1 1 -2 3" />
        </g>
        <circle cx="11" cy="13" r="0.8" fill="currentColor" />
      </svg>
    );
    case 'chaos': return (
      <svg {...props}>
        <polygon points="12,2 15,9 22,10 17,15 19,22 12,18 5,22 7,15 2,10 9,9" fill="currentColor" fillOpacity="0.18" className="fa-flicker" />
        <polygon points="12,2 15,9 22,10 17,15 19,22 12,18 5,22 7,15 2,10 9,9" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" className="fa-pulse" />
      </svg>
    );
    default: return null;
  }
}
