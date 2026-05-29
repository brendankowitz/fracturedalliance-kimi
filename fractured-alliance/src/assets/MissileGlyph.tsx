export function MissileGlyph({ kind, size = 24 }: { kind: string; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 24 30', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, xmlns: 'http://www.w3.org/2000/svg' };
  switch (kind) {
    case 'basic': return (
      <svg {...props}>
        <path d="M12 2 L 15 7 L 15 19 L 12 22 L 9 19 L 9 7 Z" fill="currentColor" fillOpacity="0.2" />
        <path d="M12 2 L 15 7 L 15 19 L 12 22 L 9 19 L 9 7 Z" />
        <line x1="9" y1="13" x2="6" y2="16" />
        <line x1="15" y1="13" x2="18" y2="16" />
        <line x1="12" y1="22" x2="12" y2="28" strokeWidth="1" strokeDasharray="1 1" className="fa-trail" />
      </svg>
    );
    case 'nuke': return (
      <svg {...props}>
        <path d="M12 2 L 16 7 L 16 19 L 12 22 L 8 19 L 8 7 Z" fill="currentColor" fillOpacity="0.25" />
        <path d="M12 2 L 16 7 L 16 19 L 12 22 L 8 19 L 8 7 Z" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" className="fa-burst" />
        <circle cx="12" cy="12" r="4" className="fa-burst" />
        <line x1="8" y1="13" x2="4" y2="16" />
        <line x1="16" y1="13" x2="20" y2="16" />
        <line x1="12" y1="22" x2="12" y2="28" strokeWidth="1.4" strokeDasharray="2 1" className="fa-trail" />
      </svg>
    );
    case 'stasis': return (
      <svg {...props}>
        <path d="M12 2 L 15 7 L 15 19 L 12 22 L 9 19 L 9 7 Z" />
        <g className="fa-spin" style={{ transformOrigin: '12px 12px' }}>
          <line x1="12" y1="9" x2="12" y2="15" strokeWidth="0.8" />
          <line x1="9.5" y1="10" x2="14.5" y2="14" strokeWidth="0.8" />
          <line x1="14.5" y1="10" x2="9.5" y2="14" strokeWidth="0.8" />
        </g>
        <circle cx="12" cy="12" r="0.8" fill="currentColor" className="fa-pulse" />
        <line x1="9" y1="13" x2="6" y2="16" />
        <line x1="15" y1="13" x2="18" y2="16" />
        <line x1="12" y1="22" x2="12" y2="27" strokeWidth="1" strokeDasharray="0.5 1" className="fa-trail" />
      </svg>
    );
    case 'virus': return (
      <svg {...props}>
        <path d="M12 2 L 15 7 L 15 19 L 12 22 L 9 19 L 9 7 Z" />
        <g className="fa-spin" style={{ transformOrigin: '12px 12px' }}>
          <circle cx="12" cy="9" r="1.2" />
          <circle cx="10" cy="14" r="1.2" />
          <circle cx="14" cy="14" r="1.2" />
          <line x1="12" y1="9" x2="10" y2="14" strokeWidth="0.8" />
          <line x1="12" y1="9" x2="14" y2="14" strokeWidth="0.8" />
          <line x1="10" y1="14" x2="14" y2="14" strokeWidth="0.8" />
        </g>
        <line x1="9" y1="13" x2="6" y2="16" />
        <line x1="15" y1="13" x2="18" y2="16" />
        <line x1="12" y1="22" x2="12" y2="27" strokeWidth="1" strokeDasharray="1 1" className="fa-trail" />
      </svg>
    );
    case 'mega': return (
      <svg {...props}>
        <path d="M12 1 L 16 6 L 16 11 L 14 13 L 14 19 L 12 21 L 10 19 L 10 13 L 8 11 L 8 6 Z" fill="currentColor" fillOpacity="0.22" />
        <path d="M12 1 L 16 6 L 16 11 L 14 13 L 14 19 L 12 21 L 10 19 L 10 13 L 8 11 L 8 6 Z" />
        <line x1="10" y1="15" x2="7" y2="18" />
        <line x1="14" y1="15" x2="17" y2="18" />
        <ellipse cx="12" cy="23" rx="1.4" ry="2" fill="currentColor" stroke="none" className="fa-thrust" />
        <ellipse cx="12" cy="26" rx="1" ry="1.4" fill="currentColor" stroke="none" className="fa-thrust-2" />
      </svg>
    );
    case 'nexos': return (
      <svg {...props}>
        <path d="M12 1 L 17 6 L 16 12 L 18 18 L 12 23 L 6 18 L 8 12 L 7 6 Z" fill="currentColor" fillOpacity="0.25" className="fa-pulse" />
        <path d="M12 1 L 17 6 L 16 12 L 18 18 L 12 23 L 6 18 L 8 12 L 7 6 Z" />
        <polygon points="12,7 14,12 12,16 10,12" fill="currentColor" className="fa-burst" />
      </svg>
    );
    default: return null;
  }
}
