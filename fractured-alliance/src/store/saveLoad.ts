import { useGameStore } from './gameStore';
import type { SaveSlot } from '../types';

const SAVE_KEY = 'fa_saves';
const SETTINGS_KEY = 'fa_settings';

export function loadSaves(): SaveSlot[] {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [
    { slot: 1, name: 'Forge-3 push', day: 341, verdict: 'In progress', stamp: '2026-05-27 14:02' },
    { slot: 2, name: 'Achar trade run', day: 180, verdict: 'Won — Corporate', stamp: '2026-05-25 22:18' },
    { slot: 3, name: 'Kryll war', day: 87, verdict: 'Lost — Asteroid Ram', stamp: '2026-05-22 09:44' },
    { slot: 4, name: '— empty —', day: null, verdict: null, stamp: null },
  ];
}

export function persistSaves(saves: SaveSlot[]) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

export function persistSettings(settings: object) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function autoSave() {
  const state = useGameStore.getState();
  const snapshot = {
    tick: state.tick,
    treasury: state.treasury,
    reputation: state.reputation,
    federationStanding: state.federationStanding,
    blueprintsOwned: state.blueprintsOwned,
    suspicion: state.suspicion,
    placedBuildings: state.placedBuildings,
    buildQueue: state.buildQueue,
    selectedAsteroid: state.selectedAsteroid,
  };
  localStorage.setItem('fa_autosave', JSON.stringify(snapshot));
}

export function loadAutoSave(): object | null {
  try {
    const raw = localStorage.getItem('fa_autosave');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}
