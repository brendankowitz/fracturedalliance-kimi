import { describe, it, expect } from 'vitest';
import {
  SFX_NAMES,
  SFX_SPECS,
  describeSfx,
  sfxSpan,
  initAudio,
  click,
  place,
  error,
  dayChime,
  alertStinger,
} from './sfx';

describe('sfx design table', () => {
  it('exposes the five console sounds', () => {
    expect(SFX_NAMES).toEqual(['click', 'place', 'error', 'dayChime', 'alertStinger']);
  });

  it('describeSfx returns the spec for each name', () => {
    for (const name of SFX_NAMES) {
      const spec = describeSfx(name);
      expect(spec.length).toBeGreaterThan(0);
      expect(spec).toBe(SFX_SPECS[name]);
    }
  });

  it('all tones are well-formed', () => {
    for (const name of SFX_NAMES) {
      for (const tone of SFX_SPECS[name]) {
        expect(tone.freq).toBeGreaterThan(0);
        expect(tone.dur).toBeGreaterThan(0);
        expect(tone.vol).toBeGreaterThan(0);
        expect(tone.vol).toBeLessThanOrEqual(1);
        expect(tone.delay ?? 0).toBeGreaterThanOrEqual(0);
        if (tone.freqEnd !== undefined) expect(tone.freqEnd).toBeGreaterThan(0);
      }
    }
  });

  it('all sounds are short and tasteful (< 1s total span)', () => {
    for (const name of SFX_NAMES) {
      expect(sfxSpan(name)).toBeLessThan(1);
    }
  });
});

describe('sfx playback guards (jsdom: no AudioContext)', () => {
  it('initAudio returns false without WebAudio', () => {
    expect(initAudio()).toBe(false);
  });

  it('sound functions no-op without throwing', () => {
    expect(() => {
      click();
      place();
      error();
      dayChime();
      alertStinger();
    }).not.toThrow();
  });

  it('sound functions no-op when sound is disabled', async () => {
    const { useGameStore } = await import('../store/gameStore');
    useGameStore.getState().setSettings({ sound: false });
    expect(() => {
      click();
      dayChime();
      alertStinger();
    }).not.toThrow();
    useGameStore.getState().setSettings({ sound: true });
  });
});
