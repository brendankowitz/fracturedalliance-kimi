import type { Difficulty, MatchVerdict } from '../types';
import type { AsteroidState, SimEvent } from './types';
import type { MarketState } from './market';
import type { RaceRelations } from './diplomacy';
import { ASTEROIDS, RACES } from '../data/gameData';
import { createInitialMarket } from './tick';
import { createRelations } from './diplomacy';

export interface ScenarioDef {
  difficulty: Difficulty;
  /** Multiplier applied to the base starting treasury. */
  treasuryModifier: number;
}

export const DEFAULT_SCENARIO_ID = 'expedition';

// Minimal honest scenario table — numeric modifiers only, no fabricated content.
// Ids match the scenario list rendered in MainMenu.
export const SCENARIOS: Record<string, ScenarioDef> = {
  expedition: { difficulty: 'manager', treasuryModifier: 1.0 }, // Fragmented Sectors — standard match
  rich: { difficulty: 'intern', treasuryModifier: 1.25 }, // Outer Veins — resource-rich, forgiving
  siege: { difficulty: 'director', treasuryModifier: 0.9 }, // The Mauna Question — hostile pressure
  rush: { difficulty: 'manager', treasuryModifier: 0.5 }, // Lunch-Break Belt — lean start
  ironman: { difficulty: 'board', treasuryModifier: 1.0 }, // Board Review — standard treasury, ironman rules
};

export const BASE_TREASURY = 142840;
export const STARTER_BLUEPRINTS = ['mk2mine', 'mk2deep', 'seismic', 'hep', 'powamp', 'sensor'];
const START_SUSPICION = 42;
const START_FEDERATION_STANDING = 62;

/** Race id of the player corporation. */
export const PLAYER_ID = 'helion';

/** Economic victory: match is won when the treasury reaches this at a tick boundary. */
export const VICTORY_TREASURY = 500_000;

// Legacy flat reputation fixture — mirrors the historic initial store values.
// Relations (per-race) are the real model; this record is kept in sync until M4.
const START_REPUTATION: Record<string, number> = {
  kryll: -42,
  motkaj: -18,
  achar: 64,
  brakkat: 8,
  rigal: 38,
  mauna: -80,
};

export interface NewMatchState {
  tick: number;
  treasury: number;
  asteroids: AsteroidState[];
  events: SimEvent[];
  blueprintsOwned: string[];
  selectedAsteroid: string;
  suspicion: number;
  reputation: Record<string, number>;
  federationStanding: number;
  market: MarketState;
  relations: Record<string, RaceRelations>;
  verdict: MatchVerdict | null;
  verdictCause: string | null;
}

const EMPTY_ORES = () => ({
  selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0,
  bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0,
});

function makeAsteroids(): AsteroidState[] {
  const asteroids: AsteroidState[] = ASTEROIDS.map((a) => ({
    id: a.id,
    ownerId: a.ownerId,
    x: a.x,
    y: a.y,
    size: a.size,
    name: a.name,
    deposits: [...a.deposits],
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
      ores: EMPTY_ORES(),
    },
    placedBuildings: {},
    buildQueue: [],
    fleets: [],
  }));

  // Starting fixtures for player-held asteroids.
  const archI = asteroids.find((a) => a.id === 'arch-i');
  if (archI) {
    archI.resources = {
      power: 12, food: 8, water: 12, air: 4,
      pop: 480, popCap: 700, happiness: 78, rad: 8,
      ores: EMPTY_ORES(),
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

  const archII = asteroids.find((a) => a.id === 'arch-ii');
  if (archII) {
    archII.resources = { power: 0, food: 0, water: 0, air: 0, pop: 240, popCap: 300, happiness: 71, rad: 4, ores: EMPTY_ORES() };
  }

  const forge3 = asteroids.find((a) => a.id === 'forge-3');
  if (forge3) {
    forge3.resources = { power: 0, food: 0, water: 0, air: 0, pop: 380, popCap: 400, happiness: 64, rad: 22, ores: EMPTY_ORES() };
  }

  const kepler7 = asteroids.find((a) => a.id === 'kepler-7');
  if (kepler7) {
    kepler7.resources = { power: 0, food: 0, water: 0, air: 0, pop: 90, popCap: 100, happiness: 88, rad: 2, ores: EMPTY_ORES() };
  }

  const longShot = asteroids.find((a) => a.id === 'long-shot');
  if (longShot) {
    longShot.resources = { power: 0, food: 0, water: 0, air: 0, pop: 0, popCap: 0, happiness: 50, rad: 38, ores: EMPTY_ORES() };
  }

  return asteroids;
}

/**
 * Build a fully independent fresh-match state. Every call constructs new
 * objects/arrays from the static game data — mutating one result never
 * affects another result or the source data.
 */
export function createNewMatch(scenarioId: string = DEFAULT_SCENARIO_ID): NewMatchState {
  const scenario = SCENARIOS[scenarioId] ?? SCENARIOS[DEFAULT_SCENARIO_ID];
  return {
    tick: 0,
    treasury: Math.round(BASE_TREASURY * scenario.treasuryModifier),
    asteroids: makeAsteroids(),
    events: [],
    blueprintsOwned: [...STARTER_BLUEPRINTS],
    selectedAsteroid: 'arch-i',
    suspicion: START_SUSPICION,
    reputation: { ...START_REPUTATION },
    federationStanding: START_FEDERATION_STANDING,
    market: createInitialMarket(),
    relations: Object.fromEntries(
      RACES.filter((r) => r.id !== 'helion').map((r) => [r.id, createRelations(r.id)])
    ),
    verdict: null,
    verdictCause: null,
  };
}
