// assets.jsx — Schematic asset library
// All icons are top-down, line-art, inherit currentColor, designed for the data-terminal aesthetic.
// Exports: BuildingGlyph, ShipGlyph, MissileGlyph, BombardmentGlyph, BlueprintSchematic

/* ============================================================
   BUILDING GLYPHS — top-down schematic, 24×24 viewBox
   Each rendered with stroke="currentColor", fill="none" unless noted.
   ============================================================ */
function BuildingGlyph({ id, size = 28 }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'square', strokeLinejoin: 'miter', shapeRendering: 'crispEdges', xmlns: 'http://www.w3.org/2000/svg' };
  switch (id) {
    case 'cpu': return (
      <svg {...props}>
        <rect x="2" y="2" width="20" height="20" />
        <rect x="8" y="8" width="8" height="8" />
        <path d="M12 2 v6 M12 16 v6 M2 12 h6 M16 12 h6" />
        <circle cx="2" cy="2" r="0.8" fill="currentColor" />
        <circle cx="22" cy="2" r="0.8" fill="currentColor" />
        <circle cx="2" cy="22" r="0.8" fill="currentColor" />
        <circle cx="22" cy="22" r="0.8" fill="currentColor" />
      </svg>
    );
    case 'air': return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 4 C 14 8 14 8 12 11" />
        <path d="M20 12 C 16 14 16 14 13 12" />
        <path d="M12 20 C 10 16 10 16 12 13" />
        <path d="M4 12 C 8 10 8 10 11 12" />
      </svg>
    );
    case 'hydration': return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" />
        <path d="M3 9 q 3 -2 6 0 t 6 0 t 6 0" />
        <path d="M3 13 q 3 -2 6 0 t 6 0 t 6 0" />
        <path d="M3 17 q 3 -2 6 0 t 6 0 t 6 0" />
      </svg>
    );
    case 'hydroponics': return (
      <svg {...props}>
        <rect x="2" y="6" width="20" height="12" />
        {[6, 10, 14, 18].map(x => (
          <g key={x}>
            <circle cx={x} cy="10" r="0.8" fill="currentColor" />
            <circle cx={x} cy="14" r="0.8" fill="currentColor" />
          </g>
        ))}
        <path d="M2 6 L 4 3 L 22 3 L 22 6" />
      </svg>
    );
    case 'living': return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <circle cx="7" cy="7" r="1" fill="currentColor" />
        <circle cx="17" cy="7" r="1" fill="currentColor" />
        <circle cx="7" cy="17" r="1" fill="currentColor" />
        <circle cx="17" cy="17" r="1" fill="currentColor" />
      </svg>
    );
    case 'resiblock': return (
      <svg {...props}>
        <rect x="2" y="2" width="20" height="20" />
        <line x1="8.66" y1="2" x2="8.66" y2="22" />
        <line x1="15.33" y1="2" x2="15.33" y2="22" />
        <line x1="2" y1="8.66" x2="22" y2="8.66" />
        <line x1="2" y1="15.33" x2="22" y2="15.33" />
        <rect x="10" y="20" width="4" height="2" fill="currentColor" />
      </svg>
    );
    case 'pleasure': return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <path d="M12 6 v-3 M18 12 h3 M12 18 v3 M6 12 h-3 M16.2 7.8 l2 -2 M16.2 16.2 l2 2 M7.8 16.2 l-2 2 M7.8 7.8 l-2 -2" />
      </svg>
    );
    case 'medical': return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" />
        <rect x="11" y="6" width="2" height="12" fill="currentColor" />
        <rect x="6" y="11" width="12" height="2" fill="currentColor" />
      </svg>
    );
    case 'security': return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" />
        <ellipse cx="12" cy="12" rx="7" ry="4" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <line x1="3" y1="3" x2="6" y2="6" />
        <line x1="21" y1="3" x2="18" y2="6" />
        <line x1="3" y1="21" x2="6" y2="18" />
        <line x1="21" y1="21" x2="18" y2="18" />
      </svg>
    );
    case 'radfilter': return (
      <svg {...props}>
        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
        <polygon points="12,6 18,9.5 18,15 12,18.5 6,15 6,9.5" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path d="M12 12 l3 -5 M12 12 l3 5 M12 12 l-6 0" />
      </svg>
    );
    case 'mine1': return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" />
        <polygon points="12,17 6,7 18,7" fill="currentColor" fillOpacity="0.18" />
        <polygon points="12,17 6,7 18,7" />
      </svg>
    );
    case 'mine2': return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" />
        <polygon points="12,12 7,4 17,4" fill="currentColor" fillOpacity="0.2" />
        <polygon points="12,12 7,4 17,4" />
        <polygon points="12,21 7,13 17,13" fill="currentColor" fillOpacity="0.2" />
        <polygon points="12,21 7,13 17,13" />
      </svg>
    );
    case 'deep': return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" />
        <rect x="10" y="3" width="4" height="14" fill="currentColor" fillOpacity="0.2" />
        <rect x="10" y="3" width="4" height="14" />
        <polygon points="9,17 12,21 15,17" fill="currentColor" />
        <line x1="3" y1="11" x2="10" y2="11" strokeDasharray="1,1" />
        <line x1="14" y1="11" x2="21" y2="11" strokeDasharray="1,1" />
      </svg>
    );
    case 'seismic': return (
      <svg {...props}>
        <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
        <polygon points="12,6 18,9.5 18,15 12,18.5 6,15 6,9.5" strokeDasharray="1,1" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <line x1="12" y1="12" x2="12" y2="2" strokeDasharray="0.5,1" />
        <line x1="9" y1="2" x2="9" y2="3.5" />
        <line x1="15" y1="2" x2="15" y2="3.5" />
      </svg>
    );
    case 'power1': return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" />
        <polygon points="13,4 6,13 11,13 11,20 18,11 13,11" fill="currentColor" />
      </svg>
    );
    case 'power2': return (
      <svg {...props}>
        <rect x="2" y="2" width="20" height="20" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
        <polygon points="2,2 4,2 2,4" fill="currentColor" />
        <polygon points="22,2 20,2 22,4" fill="currentColor" />
        <polygon points="2,22 4,22 2,20" fill="currentColor" />
        <polygon points="22,22 20,22 22,20" fill="currentColor" />
      </svg>
    );
    case 'storage': return (
      <svg {...props}>
        <circle cx="7" cy="8" r="4" />
        <circle cx="17" cy="8" r="4" />
        <circle cx="12" cy="16" r="4" />
        <circle cx="7" cy="8" r="1" fill="currentColor" />
        <circle cx="17" cy="8" r="1" fill="currentColor" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
      </svg>
    );
    case 'laser': return (
      <svg {...props}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
        <circle cx="12" cy="12" r="3" />
        <rect x="11" y="2" width="2" height="9" fill="currentColor" />
        <line x1="12" y1="2" x2="12" y2="0" strokeWidth="0.8" />
      </svg>
    );
    case 'silo': return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" />
        <circle cx="12" cy="12" r="6" />
        <polygon points="12,7 16,15 8,15" fill="currentColor" />
      </svg>
    );
    case 'gravnull': return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" strokeDasharray="2,1" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path d="M2 12 q 2 -3 4 0 t 4 0" />
        <path d="M14 12 q 2 -3 4 0 t 4 0" />
      </svg>
    );
    case 'shipyard': return (
      <svg {...props}>
        <rect x="2" y="6" width="20" height="12" />
        <path d="M2 12 h4 l 2 -3 h 8 l 2 3 h 4" />
        <polygon points="8,9 12,7 16,9 16,15 8,15" fill="currentColor" fillOpacity="0.18" />
        <polygon points="8,9 12,7 16,9 16,15 8,15" />
      </svg>
    );
    case 'dock': return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <rect x="11" y="3" width="2" height="6" fill="currentColor" />
        <rect x="11" y="15" width="2" height="6" fill="currentColor" />
        <rect x="3" y="11" width="6" height="2" fill="currentColor" />
        <rect x="15" y="11" width="6" height="2" fill="currentColor" />
        <polygon points="10,10 12,8 14,10 14,14 10,14" />
      </svg>
    );
    case 'engine': return (
      <svg {...props}>
        <rect x="3" y="7" width="14" height="10" />
        <rect x="5" y="9" width="10" height="6" fill="currentColor" fillOpacity="0.2" />
        <path d="M17 8 L 22 6 M17 12 L 23 12 M17 16 L 22 18" strokeWidth="1.8" />
        <path d="M17 9 L 21 9 M17 15 L 21 15" />
        <line x1="3" y1="3" x2="17" y2="3" strokeDasharray="1,1" />
        <line x1="3" y1="21" x2="17" y2="21" strokeDasharray="1,1" />
      </svg>
    );
    default: return (
      <svg {...props}>
        <rect x="3" y="3" width="18" height="18" strokeDasharray="2,1" />
        <text x="12" y="15" fontSize="9" fill="currentColor" textAnchor="middle" stroke="none" fontFamily="JetBrains Mono">?</text>
      </svg>
    );
  }
}

/* ============================================================
   SHIP GLYPHS — top-down silhouettes, 32×32 viewBox
   ============================================================ */
function ShipGlyph({ kind, size = 24 }) {
  const props = { width: size, height: size, viewBox: '0 0 32 32', fill: 'currentColor', stroke: 'currentColor', strokeWidth: 0.6, strokeLinejoin: 'miter', xmlns: 'http://www.w3.org/2000/svg' };
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

/* ============================================================
   MISSILE GLYPHS — silhouettes, 24×24 viewBox
   ============================================================ */
function MissileGlyph({ kind, size = 24 }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, xmlns: 'http://www.w3.org/2000/svg' };
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

/* ============================================================
   BOMBARDMENT GLYPHS — orbital weapons, 24×24
   ============================================================ */
function BombardmentGlyph({ kind, size = 24 }) {
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

/* ============================================================
   BLUEPRINT SCHEMATIC — full-panel hero render for Sci-Tek detail
   Takes a blueprint id; falls back to a generic schematic frame.
   ============================================================ */
function BlueprintSchematic({ bpId, building, ship, missile, width = 280, height = 200 }) {
  // Decide which body to draw
  let body = null;
  let label = '';

  if (building) {
    body = <g transform="translate(140, 100) scale(5)"><BuildingGlyph id={building} size={24} /></g>;
    label = building.toUpperCase();
  } else if (ship) {
    body = <g transform="translate(140, 100) scale(4)"><ShipGlyph kind={ship} size={32} /></g>;
    label = ship.toUpperCase();
  } else if (missile) {
    body = <g transform="translate(140, 100) scale(5)"><MissileGlyph kind={missile} size={24} /></g>;
    label = missile.toUpperCase();
  }

  // Map blueprint ids to bodies
  const map = {
    mk2mine: { building: 'mine2' },
    mk2deep: { building: 'deep' },
    seismic: { building: 'seismic' },
    hep:     { building: 'power2' },
    powamp:  { building: 'power1' },
    sensor:  { building: 'security' },
    fusion:  { building: 'power2' },
    shield40:{ building: 'gravnull' },
    shield50:{ building: 'gravnull' },
    photon:  { ship: 'eagle' },
    plasma:  { ship: 'battleship' },
    nuke:    { missile: 'nuke' },
    stasis:  { missile: 'stasis' },
    virus:   { missile: 'virus' },
    nexoswar:{ missile: 'nexos' },
    gravnull:{ building: 'gravnull' },
    engine:  { building: 'engine' },
    droids:  { building: 'shipyard' },
    satellite:{ building: 'security' },
    turretopt:{ building: 'laser' },
    staticind:{ building: 'silo' },
    antivirus:{ missile: 'virus' },
    autonomy:{ building: 'cpu' },
    oreteleport:{ building: 'storage' },
  };

  if (!body && bpId && map[bpId]) {
    const m = map[bpId];
    if (m.building) { body = <g transform="translate(80, 56) scale(3.5)"><BuildingGlyph id={m.building} size={24} /></g>; label = m.building.toUpperCase(); }
    if (m.ship)     { body = <g transform="translate(76, 50) scale(3)"><ShipGlyph kind={m.ship} size={32} /></g>; label = m.ship.toUpperCase(); }
    if (m.missile)  { body = <g transform="translate(94, 50) scale(3.5)"><MissileGlyph kind={m.missile} size={24} /></g>; label = m.missile.toUpperCase(); }
  }

  // Ticks along the edges
  const ticks = [];
  for (let i = 0; i < 14; i++) ticks.push(i * 20);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet"
         style={{ display: 'block', color: 'var(--warn)' }}
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="bp-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="oklch(0.28 0.014 240)" strokeWidth="0.4" />
        </pattern>
        <pattern id="bp-major" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.34 0.018 240)" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="oklch(0.16 0.012 240)" />
      <rect width={width} height={height} fill="url(#bp-grid)" />
      <rect width={width} height={height} fill="url(#bp-major)" />

      {/* Crosshair */}
      <line x1={width/2} y1="0" x2={width/2} y2={height} stroke="oklch(0.40 0.018 240)" strokeWidth="0.4" strokeDasharray="2,2" />
      <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="oklch(0.40 0.018 240)" strokeWidth="0.4" strokeDasharray="2,2" />

      {/* Body */}
      {body}

      {/* Callouts — dimension marks */}
      <line x1="30" y1="40" x2="50" y2="40" stroke="currentColor" strokeWidth="0.6" />
      <line x1="30" y1="38" x2="30" y2="42" stroke="currentColor" strokeWidth="0.6" />
      <line x1="50" y1="38" x2="50" y2="42" stroke="currentColor" strokeWidth="0.6" />
      <text x="40" y="35" fontFamily="JetBrains Mono" fontSize="6" fill="currentColor" textAnchor="middle">A.20m</text>

      <line x1="230" y1="60" x2="230" y2="120" stroke="currentColor" strokeWidth="0.6" />
      <line x1="228" y1="60" x2="232" y2="60" stroke="currentColor" strokeWidth="0.6" />
      <line x1="228" y1="120" x2="232" y2="120" stroke="currentColor" strokeWidth="0.6" />
      <text x="244" y="92" fontFamily="JetBrains Mono" fontSize="6" fill="currentColor">B.84m</text>

      {/* Border + label */}
      <rect x="0.5" y="0.5" width={width - 1} height={height - 1} fill="none" stroke="var(--warn)" strokeWidth="0.6" />
      <rect x="6" y="6" width={width - 12} height="14" fill="oklch(0.18 0.012 240)" stroke="var(--warn)" strokeWidth="0.4" />
      <text x="12" y="16" fontFamily="JetBrains Mono" fontSize="7" fill="var(--warn)" letterSpacing="2">SCHEMATIC // {label}</text>
      <text x={width - 12} y="16" fontFamily="JetBrains Mono" fontSize="7" fill="oklch(0.55 0.012 240)" textAnchor="end">REV-4</text>

      <rect x="6" y={height - 20} width={width - 12} height="14" fill="oklch(0.18 0.012 240)" stroke="var(--warn)" strokeWidth="0.4" />
      <text x="12" y={height - 10} fontFamily="JetBrains Mono" fontSize="6" fill="oklch(0.66 0.012 240)">HELION SCI-TEK · CLEAR — 7</text>
      <text x={width - 12} y={height - 10} fontFamily="JetBrains Mono" fontSize="6" fill="oklch(0.55 0.012 240)" textAnchor="end">SHEET 1/3</text>
    </svg>
  );
}

Object.assign(window, { BuildingGlyph, ShipGlyph, MissileGlyph, BombardmentGlyph, BlueprintSchematic });
