import type { OreKind } from '../types';
import type { Fleet } from './fleet';
import type { MarketState } from './market';
import type { RaceRelations } from './diplomacy';

export interface BuildingEffect {
  pwr: number;
  food: number;
  water: number;
  air: number;
  popCap: number;
  happiness: number;
  rad: number;
  mining?: { ore: OreKind; rate: number };
}

export interface AsteroidResources {
  power: number;
  food: number;
  water: number;
  air: number;
  pop: number;
  popCap: number;
  happiness: number;
  rad: number;
  ores: Record<OreKind, number>;
}

export interface AsteroidState {
  id: string;
  ownerId: string | null;
  resources: AsteroidResources;
  placedBuildings: Record<string, { kind: string; damaged?: boolean; constructing?: boolean; progress?: number }>;
  buildQueue: {
    name: string;
    cell: string;
    pct: number;
    etaDays: number;
    active: boolean;
    disabled?: boolean;
    note?: string;
  }[];
  fleets: Fleet[];
}

export interface SimEvent {
  id: number;
  t: string;
  kind: 'warn' | 'signal' | 'crit' | 'illegal' | 'ally';
  text: string;
}

export interface WorldState {
  tick: number;
  treasury: number;
  asteroids: AsteroidState[];
  suspicion: number;
  reputation: Record<string, number>;
  federationStanding: number;
  events: SimEvent[];
  fleets: Fleet[];
  market: MarketState;
  relations: Record<string, RaceRelations>;
}
