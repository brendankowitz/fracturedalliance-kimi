import type { ScreenId } from '../types';
import { useGameStore } from '../store/gameStore';

interface RailEntry {
  id: ScreenId;
  label: string;
  key: string;
  illegal?: boolean;
  glyph: React.ReactNode;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const ENTRIES: RailEntry[] = [
  {
    id: 'sector', label: 'Sector', key: 'F2',
    glyph: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <ellipse cx="12" cy="12" rx="9" ry="4" />
        <circle cx="12" cy="12" r="2.2" />
        <circle cx="19" cy="9.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="5" cy="14.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'colony', label: 'Colony', key: 'F3',
    glyph: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M12 3l7 4v8l-7 4-7-4V7z" />
        <path d="M12 3v8m0 0l7-4m-7 4L5 7" />
      </svg>
    ),
  },
  {
    id: 'scitek', label: 'Sci-Tek', key: 'F4',
    glyph: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M10 3h4M11 3v6l-5 9a2.4 2.4 0 002.1 3.6h7.8A2.4 2.4 0 0018 18l-5-9V3" />
        <path d="M8 15h8" />
      </svg>
    ),
  },
  {
    id: 'trade', label: 'Commerce', key: 'F5',
    glyph: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M4 8h13m0 0l-3.5-3.5M17 8l-3.5 3.5" />
        <path d="M20 16H7m0 0l3.5-3.5M7 16l3.5 3.5" />
      </svg>
    ),
  },
  {
    id: 'diplomacy', label: 'Diplomacy', key: 'F6',
    glyph: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <circle cx="8.5" cy="12" r="5" />
        <circle cx="15.5" cy="12" r="5" />
      </svg>
    ),
  },
  {
    id: 'combat', label: 'Tactical', key: 'F7',
    glyph: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="12" r="6.5" />
        <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: 'espionage', label: 'Black Cell', key: 'F8', illegal: true,
    glyph: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
        <circle cx="12" cy="12" r="2.6" />
      </svg>
    ),
  },
];

export function IconRail() {
  const screen = useGameStore((s) => s.screen);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <nav className="icon-rail" aria-label="Screen navigation">
      {ENTRIES.map((e) => (
        <button
          key={e.id}
          className={[
            'rail-btn',
            screen === e.id ? 'active' : '',
            e.illegal ? 'illegal' : '',
          ].join(' ').trim()}
          data-tip={`${e.label.toUpperCase()} · ${e.key}`}
          aria-label={`${e.label} (${e.key})`}
          aria-pressed={screen === e.id}
          onClick={() => setScreen(e.id)}
        >
          {e.glyph}
        </button>
      ))}
    </nav>
  );
}
