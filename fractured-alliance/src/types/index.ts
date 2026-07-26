export type AsteroidId = string & { readonly __brand: 'AsteroidId' };
export type BuildingId = string & { readonly __brand: 'BuildingId' };
export type ShipId = string & { readonly __brand: 'ShipId' };
export type PlayerId = string & { readonly __brand: 'PlayerId' };
export type BlueprintId = string & { readonly __brand: 'BlueprintId' };
export type AgentId = string & { readonly __brand: 'AgentId' };

export type OreKind =
  | 'selenium' | 'asteros' | 'barium' | 'crystalite' | 'quazinc'
  | 'bytanium' | 'korellium' | 'dragonium' | 'traxium' | 'nexos';

export type ScreenId =
  | 'menu' | 'sector' | 'colony' | 'scitek' | 'diplomacy' | 'trade' | 'combat' | 'espionage'
  | 'verdict';

export type MatchVerdict = 'won' | 'lost';

export type TreatyKind =
  | 'nonAggression' | 'noCovert' | 'trade' | 'openBorders'
  | 'defensivePact' | 'jointWar' | 'peace';

export type Difficulty = 'intern' | 'manager' | 'director' | 'ceo' | 'board';

export interface RaceDef {
  id: string;
  short: string;
  name: string;
  title: string;
  disposition: 'player' | 'aggressive' | 'peaceful' | 'neutral' | 'hostile';
  desc: string;
  ambassador: string;
  reputation: number;
  treaties: TreatyKind[];
}

export interface OreDef {
  id: OreKind;
  name: string;
  tier: number;
  price: number;
  color: string;
}

export interface BuildingDef {
  id: string;
  name: string;
  glyph: string;
  cat: 'core' | 'life' | 'pop' | 'mine' | 'power' | 'log' | 'def' | 'prod' | 'prop';
  cost: number;
  pwr: number;
  build: number;
  desc: string;
}

export interface BlueprintDef {
  id: string;
  name: string;
  disc: 'Extraction' | 'Power' | 'Defence' | 'Offence' | 'Logistics';
  tier: number;
  cost: number;
  bought: boolean;
  must?: boolean;
  trap?: boolean;
  special?: boolean;
  desc: string;
}

export interface AsteroidDef {
  id: string;
  name: string;
  ownerId: string | null;
  size: 'S' | 'M' | 'L' | 'XL';
  x: number;
  y: number;
  deposits: OreKind[];
  pop: number;
  status: 'home' | 'colony' | 'building' | 'unclaimed' | 'foreign' | 'hostile';
  rad: number;
  happiness: number;
  threat: 'none' | 'fleet' | 'ramming' | 'engines';
}

export interface ShipClassDef {
  id: string;
  name: string;
  hp: number;
  shield: number;
  speed: number;
  dmg: number;
  cost: number;
  glyph: string;
}

export interface AgentDef {
  id: string;
  name: string;
  stealth: number;
  sab: number;
  intel: number;
  status: 'idle' | 'mission' | 'cooldown' | 'captured';
  loc: string;
  fee: number;
}

export interface MerchantItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  rare: boolean;
  illegal: boolean;
}

export interface BlackMarketItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  illegal: boolean;
  risk: number;
}

export interface EventFeedItem {
  id: number;
  t: string;
  kind: 'warn' | 'signal' | 'crit' | 'illegal' | 'ally';
  text: string;
}

export interface PlacedBuilding {
  kind: string;
  damaged?: boolean;
  constructing?: boolean;
  progress?: number;
}

export interface BuildQueueItem {
  name: string;
  cell: string;
  pct: number;
  eta: string;
  active: boolean;
  disabled?: boolean;
  note?: string;
}

export interface GameSettings {
  accent: 'warn' | 'cyan' | 'crimson' | 'verdant';
  density: 'compact' | 'regular' | 'spacious';
  scanlines: boolean;
  vignette: boolean;
  difficulty: Difficulty;
  sound: boolean;
  pauseOnCrit: boolean;
}

export interface SaveSlot {
  slot: number;
  name: string;
  day: number | null;
  verdict: string | null;
  stamp: string | null;
}
