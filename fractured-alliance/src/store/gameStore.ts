import { create } from 'zustand';
import type { ScreenId, GameSettings, SaveSlot, PlacedBuilding, BuildQueueItem } from '../types';
import { loadSettings, persistSettings, loadSaves } from './saveLoad';

interface GameState {
  screen: ScreenId;
  paused: boolean;
  speed: number;
  tick: number;
  treasury: number;
  alerts: number;
  settings: GameSettings;
  selectedAsteroid: string;
  selectedBuilding: string | null;
  placedBuildings: Record<string, PlacedBuilding>;
  buildQueue: BuildQueueItem[];
  blueprintsOwned: string[];
  suspicion: number;
  reputation: Record<string, number>;
  federationStanding: number;
  saves: SaveSlot[];

  setScreen: (s: ScreenId) => void;
  setPaused: (p: boolean) => void;
  setSpeed: (s: number) => void;
  advanceTick: () => void;
  setSettings: (s: Partial<GameSettings>) => void;
  setSelectedAsteroid: (id: string) => void;
  setSelectedBuilding: (id: string | null) => void;
  placeBuilding: (cell: string, kind: string) => void;
  purchaseBlueprint: (id: string, cost: number) => boolean;
  updateReputation: (raceId: string, delta: number) => void;
  addSuspicion: (amount: number) => void;
  loadSave: (slot: number) => void;
}

const DEFAULT_PLACED: Record<string, PlacedBuilding> = {
  '4,4': { kind: 'cpu' },
  '3,4': { kind: 'air' },
  '5,4': { kind: 'hydration' },
  '4,3': { kind: 'living' },
  '4,5': { kind: 'living' },
  '3,3': { kind: 'power1' },
  '5,5': { kind: 'power1' },
  '2,4': { kind: 'mine1' },
  '6,4': { kind: 'mine2' },
  '3,5': { kind: 'hydroponics' },
  '5,3': { kind: 'medical' },
  '2,3': { kind: 'storage' },
  '6,5': { kind: 'storage' },
  '2,5': { kind: 'laser' },
  '6,3': { kind: 'laser' },
  '4,6': { kind: 'silo' },
  '1,4': { kind: 'deep' },
  '7,4': { kind: 'security' },
  '4,2': { kind: 'resiblock' },
  '3,6': { kind: 'pleasure', damaged: true },
  '1,3': { kind: 'mine1', constructing: true, progress: 0.55 },
  '1,5': { kind: 'mine1', constructing: true, progress: 0.32 },
};

const DEFAULT_QUEUE: BuildQueueItem[] = [
  { name: 'Mine Mk1', cell: '[1,3]', pct: 55, eta: '2d', active: true },
  { name: 'Mine Mk1', cell: '[1,5]', pct: 32, eta: '3d', active: true },
  { name: 'Storage Tower', cell: '[7,5]', pct: 0, eta: '4d', active: false },
  { name: 'Laser Turret', cell: '[3,2]', pct: 0, eta: '5d', active: false },
  { name: 'Mine Mk2', cell: '[7,3]', pct: 0, eta: '7d', active: false },
  { name: 'Pleasure Dome', cell: '—', pct: 0, eta: '8d', active: false, disabled: true, note: 'awaiting medical clear' },
];

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  paused: false,
  speed: 1,
  tick: 341,
  treasury: 142840,
  alerts: 3,
  settings: loadSettings() ?? {
    accent: 'warn',
    density: 'regular',
    scanlines: false,
    vignette: true,
  },
  selectedAsteroid: 'arch-i',
  selectedBuilding: 'mine2',
  placedBuildings: DEFAULT_PLACED,
  buildQueue: DEFAULT_QUEUE,
  blueprintsOwned: ['mk2mine', 'mk2deep', 'seismic', 'hep', 'powamp', 'sensor'],
  suspicion: 42,
  reputation: {
    kryll: -42,
    motkaj: -18,
    achar: 64,
    brakkat: 8,
    rigal: 38,
    mauna: -80,
  },
  federationStanding: 62,
  saves: loadSaves(),

  setScreen: (s) => set({ screen: s }),
  setPaused: (p) => set({ paused: p }),
  setSpeed: (s) => set({ speed: s }),

  advanceTick: () => {
    const state = get();
    if (state.paused) return;
    set({ tick: state.tick + 1 });
  },

  setSettings: (s) => {
    set((state) => {
      const next = { ...state.settings, ...s };
      persistSettings(next);
      return { settings: next };
    });
  },
  setSelectedAsteroid: (id) => set({ selectedAsteroid: id }),
  setSelectedBuilding: (id) => set({ selectedBuilding: id }),

  placeBuilding: (cell, kind) => {
    set((state) => ({
      placedBuildings: { ...state.placedBuildings, [cell]: { kind, constructing: true, progress: 0 } },
    }));
  },

  purchaseBlueprint: (id, cost) => {
    const state = get();
    if (state.treasury < cost || state.blueprintsOwned.includes(id)) return false;
    set({
      treasury: state.treasury - cost,
      blueprintsOwned: [...state.blueprintsOwned, id],
    });
    return true;
  },

  updateReputation: (raceId, delta) =>
    set((state) => ({
      reputation: { ...state.reputation, [raceId]: (state.reputation[raceId] ?? 0) + delta },
    })),

  addSuspicion: (amount) =>
    set((state) => ({ suspicion: Math.min(100, state.suspicion + amount) })),

  loadSave: (_slot) => {
    set({ screen: 'sector', tick: 341 });
  },
}));

// Auto-tick loop
let intervalId: ReturnType<typeof setInterval> | null = null;

export function startTickLoop() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    useGameStore.getState().advanceTick();
  }, 6000);
}

export function stopTickLoop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
