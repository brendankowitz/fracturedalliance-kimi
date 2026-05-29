export function BuildingGlyph({ id, size = 28 }: { id: string; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'square' as const, strokeLinejoin: 'miter' as const, shapeRendering: 'crispEdges' as const, xmlns: 'http://www.w3.org/2000/svg' };
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
