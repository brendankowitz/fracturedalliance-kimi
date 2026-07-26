import { create } from 'zustand';
import type { ScreenId, GameSettings, SaveSlot, OreKind, TreatyKind, Difficulty } from '../types';
import type { AsteroidState, SimEvent, WorldState } from '../sim/types';
import type { MarketState } from '../sim/market';
import { tickWorld, createInitialMarket } from '../sim/tick';
import { buyOre as buyOreSim, sellOre as sellOreSim } from '../sim/market';
import { proposeTreaty as proposeTreatySim, breakTreaty as breakTreatySim } from '../sim/diplomacy';
import { serializeWorld, deserializeWorld } from '../sim/serialize';
import { persistSave, loadSaveData, loadSettings, persistSettings, loadSaves } from './saveLoad';
import { checkAchievements } from '../sim/achievements';
import { ASTEROIDS, AGENTS, RACES } from '../data/gameData';
import { createRelations } from '../sim/diplomacy';
import { resolveMission } from '../sim/espionage';

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
  asteroids: AsteroidState[];
  events: SimEvent[];
  blueprintsOwned: string[];
  suspicion: number;
  reputation: Record<string, number>;
  federationStanding: number;
  saves: SaveSlot[];
  market: MarketState;
  relations: Record<string, import('../sim/diplomacy').RaceRelations>;
  achievements: string[];
  proposeTreaty: (raceId: string, treaty: TreatyKind) => void;
  breakTreaty: (raceId: string, treaty: TreatyKind) => void;

  setScreen: (s: ScreenId) => void;
  setPaused: (p: boolean) => void;
  setSpeed: (s: number) => void;
  advanceTick: () => void;
  setSettings: (s: Partial<GameSettings>) => void;
  setDifficulty: (d: Difficulty) => void;
  setSelectedAsteroid: (id: string) => void;
  setSelectedBuilding: (id: string | null) => void;
  placeBuilding: (cell: string, kind: string) => void;
  purchaseBlueprint: (id: string, cost: number) => boolean;
  updateReputation: (raceId: string, delta: number) => void;
  addSuspicion: (amount: number) => void;
  runMission: (agentId: string, mission: import('../sim/espionage').MissionType, targetSecurity: number) => import('../sim/espionage').MissionResult;
  loadSave: (slot: number) => void;
  saveGame: (slot: number, name: string) => void;
  buyOre: (ore: OreKind, qty: number) => void;
  sellOre: (ore: OreKind, qty: number) => void;
}

function makeDefaultAsteroids(): AsteroidState[] {
  return ASTEROIDS.map((a) => ({
    id: a.id,
    ownerId: a.ownerId,
    x: a.x,
    y: a.y,
    size: a.size,
    name: a.name,
    deposits: a.deposits,
    status: a.status,
    threat: a.threat,
    resources: {
      power: 0,
      food: 0,
      water: 0,
      air: 0,
      pop: a.pop,
      popCap: a.size === 'S' ? 100 : a.size === 'M' ? 300 : a.size === 'L' ? 700 : 1000,
      happiness: a.happiness,
      rad: a.rad,
      ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 },
    },
    placedBuildings: {},
    buildQueue: [],
    fleets: [],
  }));
}

const DEFAULT_ASTEROIDS: AsteroidState[] = makeDefaultAsteroids();

// Override player asteroids with specific data
const archI = DEFAULT_ASTEROIDS.find((a) => a.id === 'arch-i');
if (archI) {
  archI.resources = {
    power: 12, food: 8, water: 12, air: 4,
    pop: 480, popCap: 700, happiness: 78, rad: 8,
    ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 },
  };
  archI.placedBuildings = {
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
  archI.buildQueue = [
    { name: 'Mine Mk1', cell: '[1,3]', pct: 55, etaDays: 2, active: true },
    { name: 'Mine Mk1', cell: '[1,5]', pct: 32, etaDays: 3, active: true },
    { name: 'Storage Tower', cell: '[7,5]', pct: 0, etaDays: 4, active: false },
    { name: 'Laser Turret', cell: '[3,2]', pct: 0, etaDays: 5, active: false },
    { name: 'Mine Mk2', cell: '[7,3]', pct: 0, etaDays: 7, active: false },
    { name: 'Pleasure Dome', cell: '—', pct: 0, etaDays: 8, active: false, disabled: true, note: 'awaiting medical clear' },
  ];
}

const archII = DEFAULT_ASTEROIDS.find((a) => a.id === 'arch-ii');
if (archII) {
  archII.resources = { power: 0, food: 0, water: 0, air: 0, pop: 240, popCap: 300, happiness: 71, rad: 4, ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 } };
}

const forge3 = DEFAULT_ASTEROIDS.find((a) => a.id === 'forge-3');
if (forge3) {
  forge3.resources = { power: 0, food: 0, water: 0, air: 0, pop: 380, popCap: 400, happiness: 64, rad: 22, ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 } };
}

const kepler7 = DEFAULT_ASTEROIDS.find((a) => a.id === 'kepler-7');
if (kepler7) {
  kepler7.resources = { power: 0, food: 0, water: 0, air: 0, pop: 90, popCap: 100, happiness: 88, rad: 2, ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 } };
}

const longShot = DEFAULT_ASTEROIDS.find((a) => a.id === 'long-shot');
if (longShot) {
  longShot.resources = { power: 0, food: 0, water: 0, air: 0, pop: 0, popCap: 0, happiness: 50, rad: 38, ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 } };
}

const DEFAULT_SETTINGS: GameSettings = {
  accent: 'warn',
  density: 'regular',
  scanlines: false,
  vignette: true,
  difficulty: 'director',
  sound: true,
  pauseOnCrit: false,
};

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  paused: false,
  speed: 1,
  tick: 341,
  treasury: 142840,
  alerts: 3,
  settings: { ...DEFAULT_SETTINGS, ...(loadSettings() ?? {}) },
  selectedAsteroid: 'arch-i',
  selectedBuilding: 'mine2',
  asteroids: DEFAULT_ASTEROIDS,
  events: [],
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
  market: createInitialMarket(),
  relations: Object.fromEntries(
    RACES.filter((r) => r.id !== 'helion').map((r) => [r.id, createRelations(r.id)])
  ),
  achievements: [],

  setScreen: (s) => set({ screen: s }),
  setPaused: (p) => set({ paused: p }),
  setSpeed: (s) => set({ speed: s }),

  advanceTick: () => {
    const state = get();
    if (state.paused) return;

    const world = tickWorld({
      tick: state.tick,
      treasury: state.treasury,
      asteroids: state.asteroids,
      suspicion: state.suspicion,
      reputation: state.reputation,
      federationStanding: state.federationStanding,
      events: state.events,
      fleets: [],
      market: state.market,
      relations: state.relations,
    });

    const newlyUnlocked = checkAchievements(get(), new Set(get().achievements));
    if (newlyUnlocked.length > 0) {
      set({ achievements: [...get().achievements, ...newlyUnlocked] });
    }

    set({
      tick: world.world.tick,
      asteroids: world.world.asteroids,
      events: world.world.events,
      alerts: world.events.length,
      relations: world.world.relations,
      treasury: world.world.treasury,
      suspicion: world.world.suspicion,
      reputation: world.world.reputation,
      federationStanding: world.world.federationStanding,
      market: world.world.market,
    });
  },

  setSettings: (s) => {
    set((state) => {
      const next = { ...state.settings, ...s };
      persistSettings(next);
      return { settings: next };
    });
  },
  setDifficulty: (d) => {
    set((state) => {
      const next = { ...state.settings, difficulty: d };
      persistSettings(next);
      return { settings: next };
    });
  },
  setSelectedAsteroid: (id) => set({ selectedAsteroid: id }),
  setSelectedBuilding: (id) => set({ selectedBuilding: id }),

  placeBuilding: (cell, kind) => {
    set((state) => {
      const idx = state.asteroids.findIndex(a => a.id === state.selectedAsteroid);
      if (idx === -1) return state;
      const next = [...state.asteroids];
      next[idx] = {
        ...next[idx],
        placedBuildings: {
          ...next[idx].placedBuildings,
          [cell]: { kind, constructing: true, progress: 0 },
        },
      };
      return { asteroids: next };
    });
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

  runMission: (agentId: string, mission: import('../sim/espionage').MissionType, targetSecurity: number) => {
    const state = get();
    const agent = AGENTS.find((a) => a.id === agentId);
    if (!agent) return { success: false, message: 'Agent not found', suspicionGain: 0, creditsGain: 0 };
    const result = resolveMission(agent.stealth, agent.sab, agent.intel, mission, targetSecurity);
    set({
      suspicion: Math.min(100, state.suspicion + result.suspicionGain),
      treasury: state.treasury + result.creditsGain,
    });
    return result;
  },

  loadSave: (slot) => {
    const data = loadSaveData(slot);
    if (!data) {
      set({ screen: 'sector' });
      return;
    }
    const parsed = deserializeWorld(JSON.stringify(data));
    if (!parsed.success || !parsed.data) {
      set({ screen: 'sector' });
      return;
    }
    set({
      screen: 'sector',
      tick: parsed.data.world.tick,
      treasury: parsed.data.world.treasury,
      asteroids: parsed.data.world.asteroids,
      suspicion: parsed.data.world.suspicion,
      reputation: parsed.data.world.reputation,
      federationStanding: parsed.data.world.federationStanding,
      events: parsed.data.world.events,
      market: parsed.data.world.market,
      relations: parsed.data.world.relations,
    });
  },
  saveGame: (slot: number, name: string) => {
    const state = get();
    const world: WorldState = {
      tick: state.tick,
      treasury: state.treasury,
      asteroids: state.asteroids,
      suspicion: state.suspicion,
      reputation: state.reputation,
      federationStanding: state.federationStanding,
      events: state.events,
      fleets: [],
      market: state.market,
      relations: state.relations,
    };
    const json = serializeWorld(world, name);
    const data = deserializeWorld(json).data!;
    persistSave(slot, data);
    set({ saves: loadSaves() });
  },

  buyOre: (ore, qty) => {
    set((state) => {
      const asteroid = state.asteroids.find((a) => a.id === state.selectedAsteroid);
      if (!asteroid) return state;
      const stockpile = asteroid.resources.ores[ore];
      const result = buyOreSim(state.market, state.treasury, stockpile, ore, qty);
      if (!result.success) return state;
      const aIdx = state.asteroids.findIndex((a) => a.id === state.selectedAsteroid);
      const nextAsteroids = [...state.asteroids];
      nextAsteroids[aIdx] = {
        ...nextAsteroids[aIdx],
        resources: {
          ...nextAsteroids[aIdx].resources,
          ores: { ...nextAsteroids[aIdx].resources.ores, [ore]: result.newStockpile },
        },
      };
      return { treasury: result.newTreasury, asteroids: nextAsteroids };
    });
  },

  sellOre: (ore, qty) => {
    set((state) => {
      const asteroid = state.asteroids.find((a) => a.id === state.selectedAsteroid);
      if (!asteroid) return state;
      const stockpile = asteroid.resources.ores[ore];
      const result = sellOreSim(state.market, state.treasury, stockpile, ore, qty);
      if (!result.success) return state;
      const aIdx = state.asteroids.findIndex((a) => a.id === state.selectedAsteroid);
      const nextAsteroids = [...state.asteroids];
      nextAsteroids[aIdx] = {
        ...nextAsteroids[aIdx],
        resources: {
          ...nextAsteroids[aIdx].resources,
          ores: { ...nextAsteroids[aIdx].resources.ores, [ore]: result.newStockpile },
        },
      };
      return { treasury: result.newTreasury, asteroids: nextAsteroids };
    });
  },

  proposeTreaty: (raceId, treaty) => {
    set((state) => {
      const result = proposeTreatySim({ ...state, relations: state.relations } as any, raceId, treaty);
      if (!result.world) return state;
      const updates: any = { relations: result.world.relations };
      if (result.event) updates.events = [result.event, ...state.events].slice(0, 50);
      return updates;
    });
  },

  breakTreaty: (raceId, treaty) => {
    set((state) => {
      const result = breakTreatySim({ ...state, relations: state.relations } as any, raceId, treaty);
      if (!result.world) return state;
      const updates: any = { relations: result.world.relations };
      if (result.event) updates.events = [result.event, ...state.events].slice(0, 50);
      return updates;
    });
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
