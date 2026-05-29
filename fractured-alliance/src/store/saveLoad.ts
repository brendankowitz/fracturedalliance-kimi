import type { SaveData } from '../sim/serialize';

const SAVE_KEY = 'fa-saves';
const SETTINGS_KEY = 'fa-settings';

export interface SaveSlot {
  slot: number;
  name: string;
  day: number | null;
  verdict: string | null;
  stamp: string | null;
}

export function loadSettings(): any {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return null;
  }
}

export function persistSettings(settings: any) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSaves(): SaveSlot[] {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]');
  } catch {
    return [
      { slot: 1, name: '— empty —', day: null, verdict: null, stamp: null },
      { slot: 2, name: '— empty —', day: null, verdict: null, stamp: null },
      { slot: 3, name: '— empty —', day: null, verdict: null, stamp: null },
      { slot: 4, name: '— empty —', day: null, verdict: null, stamp: null },
    ];
  }
}

export function persistSave(slot: number, data: SaveData) {
  try {
    const saves = loadSaves();
    const idx = saves.findIndex((s) => s.slot === slot);
    const entry: SaveSlot = {
      slot,
      name: data.name,
      day: data.day,
      verdict: data.verdict,
      stamp: data.stamp,
    };
    if (idx >= 0) saves[idx] = entry;
    else saves.push(entry);
    localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
    localStorage.setItem(`fa-save-${slot}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to persist save ${slot}:`, e);
    throw new Error('Save failed: unable to write to local storage');
  }
}

export function loadSaveData(slot: number): SaveData | null {
  try {
    return JSON.parse(localStorage.getItem(`fa-save-${slot}`) || 'null');
  } catch {
    return null;
  }
}
