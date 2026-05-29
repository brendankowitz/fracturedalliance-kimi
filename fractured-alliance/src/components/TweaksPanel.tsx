import { useState } from 'react';
import type { ScreenId, GameSettings } from '../types';

export function TweaksPanel({ settings, setSettings, setScreen }: {
  settings: GameSettings;
  setSettings: (s: Partial<GameSettings>) => void;
  setScreen: (s: ScreenId) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 200 }}>
      <button
        className="btn sm ghost"
        onClick={() => setOpen(!open)}
        style={{ opacity: 0.6 }}
      >
        {open ? '✕ CLOSE' : '⚙ TWEAKS'}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 36,
          right: 0,
          width: 220,
          background: 'var(--bg-base)',
          border: '1px solid var(--line)',
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div className="t-eyebrow" style={{ marginBottom: 4 }}>THEME</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(['warn', 'cyan', 'crimson', 'verdant'] as const).map(a => (
              <button
                key={a}
                className={`btn sm ${settings.accent === a ? 'primary' : 'ghost'}`}
                onClick={() => setSettings({ accent: a })}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="t-eyebrow" style={{ marginTop: 8 }}>LAYOUT</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {(['compact', 'regular', 'spacious'] as const).map(d => (
              <button
                key={d}
                className={`btn sm ${settings.density === d ? 'primary' : 'ghost'}`}
                onClick={() => setSettings({ density: d })}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="t-eyebrow" style={{ marginTop: 8 }}>EFFECTS</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="checkbox"
              checked={settings.scanlines}
              onChange={(e) => setSettings({ scanlines: e.target.checked })}
            />
            Scanlines
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="checkbox"
              checked={settings.vignette}
              onChange={(e) => setSettings({ vignette: e.target.checked })}
            />
            Vignette
          </label>

          <div className="t-eyebrow" style={{ marginTop: 8 }}>JUMP TO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { id: 'menu', label: 'Main menu' },
              { id: 'sector', label: 'Sector' },
              { id: 'colony', label: 'Colony' },
              { id: 'scitek', label: 'Sci-Tek' },
              { id: 'diplomacy', label: 'Diplomacy' },
              { id: 'trade', label: 'Commerce' },
              { id: 'combat', label: 'Tactical' },
              { id: 'espionage', label: 'Black Cell' },
            ].map(s => (
              <button key={s.id} className="btn sm ghost" onClick={() => setScreen(s.id as ScreenId)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
