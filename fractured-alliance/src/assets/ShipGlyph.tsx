export function ShipGlyph({ kind, size = 24 }: { kind: string; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 32 32', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 0.6, strokeLinejoin: 'miter' as const, xmlns: 'http://www.w3.org/2000/svg' };
  switch (kind) {
    case 'scout': return (
      <svg {...props}>
        <polygon points="16,4 18,22 14,22" />
        <polygon points="11,18 16,22 21,18 16,21" fillOpacity="0.6" />
        <line x1="16" y1="22" x2="16" y2="26" />
        <ellipse cx="16" cy="24" rx="1.2" ry="2.4" fill="currentColor" stroke="none" opacity="0.9" className="fa-thrust" />
      </svg>
    );
    case 'assault': return (
      <svg {...props}>
        <polygon points="16,3 20,21 16,18 12,21" />
        <polygon points="6,18 12,21 12,15" fillOpacity="0.5" />
        <polygon points="26,18 20,21 20,15" fillOpacity="0.5" />
        <line x1="16" y1="21" x2="16" y2="27" strokeWidth="1" />
        <ellipse cx="14" cy="24" rx="1" ry="2.4" fill="currentColor" stroke="none" className="fa-thrust" />
        <ellipse cx="18" cy="24" rx="1" ry="2.4" fill="currentColor" stroke="none" className="fa-thrust-2" />
      </svg>
    );
    case 'eagle': return (
      <svg {...props}>
        <polygon points="16,2 22,16 22,22 16,20 10,22 10,16" />
        <polygon points="4,20 10,22 10,14" fillOpacity="0.55" />
        <polygon points="28,20 22,22 22,14" fillOpacity="0.55" />
        <circle cx="16" cy="12" r="1.5" fill="oklch(0.2 0.012 240)" stroke="none" />
        <circle cx="16" cy="12" r="0.7" fill="currentColor" stroke="none" className="fa-glow-soft" />
        <line x1="13" y1="23" x2="13" y2="28" strokeWidth="0.8" />
        <line x1="19" y1="23" x2="19" y2="28" strokeWidth="0.8" />
        <ellipse cx="13" cy="26" rx="1" ry="2.2" fill="currentColor" stroke="none" className="fa-thrust" />
        <ellipse cx="19" cy="26" rx="1" ry="2.2" fill="currentColor" stroke="none" className="fa-thrust-2" />
      </svg>
    );
    case 'battleship': return (
      <svg {...props}>
        <polygon points="16,2 20,8 22,14 22,26 10,26 10,14 12,8" />
        <rect x="4" y="14" width="6" height="10" fillOpacity="0.5" />
        <rect x="22" y="14" width="6" height="10" fillOpacity="0.5" />
        <rect x="14" y="10" width="4" height="4" stroke="oklch(0.2 0.012 240)" strokeWidth="0.6" fill="oklch(0.2 0.012 240)" />
        <rect x="15" y="11" width="2" height="2" fill="currentColor" stroke="none" className="fa-glow-soft" />
        <rect x="13" y="16" width="6" height="2" fill="oklch(0.2 0.012 240)" stroke="none" />
        <rect x="13" y="20" width="6" height="2" fill="oklch(0.2 0.012 240)" stroke="none" />
        <circle cx="7" cy="19" r="0.6" fill="currentColor" stroke="none" className="fa-blink" />
        <circle cx="25" cy="19" r="0.6" fill="currentColor" stroke="none" className="fa-blink-2" />
        <line x1="13" y1="27" x2="13" y2="31" strokeWidth="1" />
        <line x1="16" y1="27" x2="16" y2="31" strokeWidth="1" />
        <line x1="19" y1="27" x2="19" y2="31" strokeWidth="1" />
        <ellipse cx="13" cy="29" rx="1.1" ry="3" fill="currentColor" stroke="none" className="fa-thrust" />
        <ellipse cx="16" cy="29" rx="1.1" ry="3.4" fill="currentColor" stroke="none" className="fa-thrust-2" />
        <ellipse cx="19" cy="29" rx="1.1" ry="3" fill="currentColor" stroke="none" className="fa-thrust-3" />
      </svg>
    );
    case 'destructor': return (
      <svg {...props}>
        <polygon points="16,4 24,12 24,22 16,26 8,22 8,12" />
        <polygon points="4,8 8,12 8,22 4,26" fillOpacity="0.5" />
        <polygon points="28,8 24,12 24,22 28,26" fillOpacity="0.5" />
        <circle cx="16" cy="14" r="2" fill="oklch(0.2 0.012 240)" stroke="none" />
        <circle cx="16" cy="14" r="1.1" fill="currentColor" stroke="none" className="fa-glow-soft" />
        <rect x="14" y="18" width="4" height="3" fill="oklch(0.2 0.012 240)" stroke="none" />
        <circle cx="5" cy="17" r="0.7" fill="currentColor" stroke="none" className="fa-blink" />
        <circle cx="27" cy="17" r="0.7" fill="currentColor" stroke="none" className="fa-blink-2" />
        <line x1="14" y1="27" x2="14" y2="30" strokeWidth="1" />
        <line x1="18" y1="27" x2="18" y2="30" strokeWidth="1" />
        <ellipse cx="14" cy="29" rx="1.2" ry="2.8" fill="currentColor" stroke="none" className="fa-thrust" />
        <ellipse cx="18" cy="29" rx="1.2" ry="2.8" fill="currentColor" stroke="none" className="fa-thrust-3" />
      </svg>
    );
    case 'terminator': return (
      <svg {...props}>
        <polygon points="16,2 22,10 22,22 18,28 14,28 10,22 10,10" />
        <polygon points="4,14 10,12 10,22 4,26" fillOpacity="0.55" />
        <polygon points="28,14 22,12 22,22 28,26" fillOpacity="0.55" />
        <rect x="14" y="12" width="4" height="10" fill="oklch(0.2 0.012 240)" stroke="none" />
        <rect x="15.4" y="13" width="1.2" height="8" fill="currentColor" stroke="none" className="fa-glow-soft" />
        <rect x="13" y="14" width="6" height="1.5" />
        <rect x="13" y="18" width="6" height="1.5" />
        <line x1="16" y1="28" x2="16" y2="31" strokeWidth="1.2" />
        <ellipse cx="16" cy="30" rx="1.4" ry="3" fill="currentColor" stroke="none" className="fa-thrust" />
      </svg>
    );
    case 'cruiser': return (
      <svg {...props}>
        <polygon points="16,1 22,6 24,14 24,24 22,28 10,28 8,24 8,14 10,6" />
        <polygon points="2,16 8,12 8,24 2,28" fillOpacity="0.5" />
        <polygon points="30,16 24,12 24,24 30,28" fillOpacity="0.5" />
        <rect x="13" y="5" width="6" height="4" fill="oklch(0.2 0.012 240)" stroke="none" />
        <rect x="13" y="5" width="6" height="4" />
        <rect x="14" y="6" width="4" height="2" fill="currentColor" stroke="none" className="fa-glow-soft" />
        <rect x="14" y="11" width="4" height="14" fill="oklch(0.2 0.012 240)" stroke="none" />
        <circle cx="16" cy="14" r="1.5" />
        <circle cx="16" cy="18" r="1.5" />
        <circle cx="16" cy="22" r="1.5" />
        <circle cx="16" cy="14" r="0.5" fill="currentColor" stroke="none" className="fa-glow-soft" />
        <circle cx="16" cy="18" r="0.5" fill="currentColor" stroke="none" className="fa-glow-soft-2" />
        <circle cx="16" cy="22" r="0.5" fill="currentColor" stroke="none" className="fa-glow-soft" />
        <line x1="13" y1="29" x2="13" y2="31" strokeWidth="1.2" />
        <line x1="16" y1="29" x2="16" y2="31" strokeWidth="1.2" />
        <line x1="19" y1="29" x2="19" y2="31" strokeWidth="1.2" />
        <ellipse cx="13" cy="30.5" rx="1.1" ry="2.4" fill="currentColor" stroke="none" className="fa-thrust" />
        <ellipse cx="16" cy="30.5" rx="1.3" ry="3.2" fill="currentColor" stroke="none" className="fa-thrust-2" />
        <ellipse cx="19" cy="30.5" rx="1.1" ry="2.4" fill="currentColor" stroke="none" className="fa-thrust-3" />
      </svg>
    );
    default: return null;
  }
}
