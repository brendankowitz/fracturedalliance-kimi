import { create } from 'zustand';
import type { ScreenId, GameSettings, SaveSlot, OreKind, TreatyKind, Difficulty } from '../types';
import type { AsteroidState, SimEvent, WorldState } from '../sim/types';
import type { MarketState } from '../sim/market';
import { tickWorld } from '../sim/tick';
import { buyOre as buyOreSim, sellOre as sellOreSim } from '../sim/market';
import { proposeTreaty as proposeTreatySim, breakTreaty as breakTreatySim } from '../sim/diplomacy';
import { serializeWorld, deserializeWorld } from '../sim/serialize';
import { persistSave, loadSaveData, loadSettings, persistSettings, loadSaves } from './saveLoad';
import { checkAchievements } from '../sim/achievements';
import { AGENTS, BUILDINGS } from '../data/gameData';
import { createNewMatch } from '../sim/worldFactory';
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
  newMatch: (scenarioId?: string) => void;
  setSettings: (s: Partial<GameSettings>) => void;
  setDifficulty: (d: Difficulty) => void;
  setSelectedAsteroid: (id: string) => void;
  setSelectedBuilding: (id: string | null) => void;
  placeBuilding: (cell: string, kind: string) => boolean;
  purchaseBlueprint: (id: string, cost: number) => boolean;
  updateReputation: (raceId: string, delta: number) => void;
  addSuspicion: (amount: number) => void;
  runMission: (agentId: string, mission: import('../sim/espionage').MissionType, targetSecurity: number) => import('../sim/espionage').MissionResult;
  loadSave: (slot: number) => void;
  saveGame: (slot: number, name: string) => void;
  buyOre: (ore: OreKind, qty: number) => void;
  sellOre: (ore: OreKind, qty: number) => void;
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

// Single source of truth for fresh-match state — see sim/worldFactory.
const initialMatch = createNewMatch();

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  paused: false,
  speed: 1,
  tick: initialMatch.tick,
  treasury: initialMatch.treasury,
  alerts: 3,
  settings: { ...DEFAULT_SETTINGS, ...(loadSettings() ?? {}) },
  selectedAsteroid: initialMatch.selectedAsteroid,
  selectedBuilding: 'mine2',
  asteroids: initialMatch.asteroids,
  events: initialMatch.events,
  blueprintsOwned: initialMatch.blueprintsOwned,
  suspicion: initialMatch.suspicion,
  reputation: initialMatch.reputation,
  federationStanding: initialMatch.federationStanding,
  saves: loadSaves(),
  market: initialMatch.market,
  relations: initialMatch.relations,
  achievements: [],

  setScreen: (s) => set({ screen: s }),
  setPaused: (p) => set({ paused: p }),
  setSpeed: (s) => set({ speed: s }),

  newMatch: (scenarioId) => {
    const match = createNewMatch(scenarioId);
    // Replace world state wholesale; settings and save slots are preserved.
    set({
      screen: 'sector',
      paused: false,
      alerts: 0,
      ...match,
    });
  },

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
    const state = get();
    const def = BUILDINGS.find((b) => b.id === kind);
    if (!def) return false;
    if (state.treasury < def.cost) return false;
    const idx = state.asteroids.findIndex((a) => a.id === state.selectedAsteroid);
    if (idx === -1) return false;
    const asteroid = state.asteroids[idx];
    const next = [...state.asteroids];
    next[idx] = {
      ...asteroid,
      placedBuildings: {
        ...asteroid.placedBuildings,
        [cell]: { kind, constructing: true, progress: 0 },
      },
      buildQueue: [
        ...asteroid.buildQueue,
        {
          name: def.name,
          cell: `[${cell}]`,
          pct: 0,
          etaDays: def.build,
          active: asteroid.buildQueue.length === 0,
        },
      ],
    };
    set({ treasury: state.treasury - def.cost, asteroids: next });
    return true;
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
const BASE_TICK_MS = 6000;

export function intervalForSpeed(speed: number): number {
  return BASE_TICK_MS / speed;
}

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export function startTickLoop() {
  if (timeoutId) clearTimeout(timeoutId);
  const schedule = () => {
    // Read speed at each schedule so mid-game speed changes apply
    // without restarting the loop.
    timeoutId = setTimeout(() => {
      try {
        useGameStore.getState().advanceTick();
      } finally {
        // Keep the chain alive even if a tick throws (setInterval parity).
        schedule();
      }
    }, intervalForSpeed(useGameStore.getState().speed));
  };
  schedule();
}

export function stopTickLoop() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}
