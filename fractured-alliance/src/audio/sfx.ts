/* ============================================================
   sfx — procedural WebAudio sound effects (no asset files).
   Retro-terminal bleeps synthesized from oscillators + gain
   envelopes. Side-effect-free at import time: the AudioContext
   is only created/resumed inside a user gesture (autoplay-policy
   safe). Everything audible is gated on settings.sound.
   ============================================================ */

import { useGameStore } from '../store/gameStore';

export type SfxName = 'click' | 'place' | 'error' | 'dayChime' | 'alertStinger';

export interface ToneSpec {
  type: OscillatorType;
  /** Start frequency in Hz. */
  freq: number;
  /** Optional glide target in Hz (exponential). */
  freqEnd?: number;
  /** Seconds. */
  dur: number;
  /** Peak gain 0..1 (master gain is applied on top). */
  vol: number;
  /** Start offset in seconds from the trigger. */
  delay?: number;
}

/* Sound design table — pure data, unit-testable without WebAudio. */
export const SFX_SPECS: Record<SfxName, ToneSpec[]> = {
  /* Console key blip: one short square tick. */
  click: [
    { type: 'square', freq: 1180, dur: 0.045, vol: 0.16 },
  ],
  /* Build confirmed: rising two-note chirp. */
  place: [
    { type: 'square', freq: 620, dur: 0.06, vol: 0.16 },
    { type: 'square', freq: 930, dur: 0.09, vol: 0.16, delay: 0.06 },
  ],
  /* Rejected action: low detuned buzz. */
  error: [
    { type: 'sawtooth', freq: 160, freqEnd: 110, dur: 0.16, vol: 0.14 },
    { type: 'sawtooth', freq: 164, freqEnd: 112, dur: 0.16, vol: 0.10 },
  ],
  /* Day rollover: soft two-tone sine chime. */
  dayChime: [
    { type: 'sine', freq: 880, dur: 0.28, vol: 0.14 },
    { type: 'sine', freq: 1318, dur: 0.42, vol: 0.11, delay: 0.16 },
  ],
  /* Critical event: three urgent descending beeps. */
  alertStinger: [
    { type: 'square', freq: 740, freqEnd: 620, dur: 0.09, vol: 0.18 },
    { type: 'square', freq: 740, freqEnd: 620, dur: 0.09, vol: 0.18, delay: 0.13 },
    { type: 'square', freq: 880, freqEnd: 520, dur: 0.16, vol: 0.18, delay: 0.26 },
  ],
};

export const SFX_NAMES = Object.keys(SFX_SPECS) as SfxName[];

/** Pure accessor so tests (and future UI) can introspect the design table. */
export function describeSfx(name: SfxName): ToneSpec[] {
  return SFX_SPECS[name];
}

/** Total audible span of a sound in seconds (last tone end). */
export function sfxSpan(name: SfxName): number {
  return Math.max(...SFX_SPECS[name].map((t) => (t.delay ?? 0) + t.dur));
}

/* ------------------------------------------------------------
   AudioContext lifecycle — module-private, lazily created.
   ------------------------------------------------------------ */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

/**
 * Create (once) and resume the shared AudioContext. Call from a
 * user gesture. Returns false where WebAudio is unavailable
 * (e.g. jsdom) — callers must treat sounds as no-ops then.
 */
export function initAudio(): boolean {
  if (typeof window === 'undefined') return false;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return false;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return true;
}

function soundEnabled(): boolean {
  return useGameStore.getState().settings.sound ?? true;
}

function scheduleTone(tone: ToneSpec) {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + (tone.delay ?? 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = tone.type;
  osc.frequency.setValueAtTime(tone.freq, t0);
  if (tone.freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, tone.freqEnd), t0 + tone.dur);
  }
  /* Fast attack, exponential release — retro terminal character. */
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, tone.vol), t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + tone.dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + tone.dur + 0.02);
}

/**
 * Play a sound. `gesture` sounds may create/resume the context
 * (they are triggered by user input); ambient sounds only play
 * if audio is already running, so they never violate autoplay
 * policy. All sounds no-op when settings.sound is off.
 */
function play(name: SfxName, gesture: boolean) {
  if (!soundEnabled()) return;
  if (!ctx) {
    if (!gesture || !initAudio()) return;
  } else if (ctx.state === 'suspended') {
    if (!gesture) return;
    void ctx.resume();
  }
  for (const tone of SFX_SPECS[name]) scheduleTone(tone);
}

export function click() {
  play('click', true);
}

export function place() {
  play('place', true);
}

export function error() {
  play('error', true);
}

export function dayChime() {
  play('dayChime', false);
}

export function alertStinger() {
  play('alertStinger', false);
}
