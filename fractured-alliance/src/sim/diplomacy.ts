import type { TreatyKind } from '../types';
import type { WorldState, SimEvent } from './types';

export interface RaceRelations {
  raceId: string;
  reputation: number; // -100 to 100
  treaties: TreatyKind[];
  standing: 'hostile' | 'cold' | 'neutral' | 'warm' | 'allied';
  casusBelli: boolean;
}

export const TREATY_THRESHOLDS: Record<TreatyKind, number> = {
  nonAggression: 0,
  noCovert: 10,
  trade: 20,
  openBorders: 30,
  defensivePact: 40,
  jointWar: 60,
  peace: -20,
};

export function createRelations(raceId: string): RaceRelations {
  return {
    raceId,
    reputation: 0,
    treaties: [],
    standing: 'neutral',
    casusBelli: false,
  };
}

export function proposeTreaty(world: WorldState, raceId: string, treaty: TreatyKind): { world: WorldState; event?: SimEvent } {
  const rel = world.relations[raceId];
  if (!rel) return { world };
  const threshold = TREATY_THRESHOLDS[treaty];
  if (rel.reputation < threshold) {
    return {
      world,
      event: {
        id: Date.now(),
        t: `T+${Math.floor(world.tick / 30)}`,
        kind: 'warn',
        text: `${raceId}: Treaty ${treaty} rejected. Reputation ${rel.reputation} below ${threshold}.`,
      },
    };
  }
  if (rel.treaties.includes(treaty)) return { world };
  const nextRelations = { ...world.relations, [raceId]: { ...rel, treaties: [...rel.treaties, treaty] } };
  return {
    world: { ...world, relations: nextRelations },
    event: {
      id: Date.now(),
      t: `T+${Math.floor(world.tick / 30)}`,
      kind: 'ally',
      text: `${raceId}: Signed ${treaty}.`,
    },
  };
}

export function breakTreaty(world: WorldState, raceId: string, treaty: TreatyKind): { world: WorldState; event?: SimEvent } {
  const rel = world.relations[raceId];
  if (!rel) return { world };
  const nextTreaties = rel.treaties.filter((t) => t !== treaty);
  const nextRelations = {
    ...world.relations,
    [raceId]: { ...rel, treaties: nextTreaties, casusBelli: true, reputation: rel.reputation - 15 },
  };
  return {
    world: { ...world, relations: nextRelations },
    event: {
      id: Date.now(),
      t: `T+${Math.floor(world.tick / 30)}`,
      kind: 'crit',
      text: `${raceId}: ${treaty} broken! Reputation −15. Casus belli logged.`,
    },
  };
}

export function updateReputation(world: WorldState, raceId: string, delta: number): WorldState {
  const rel = world.relations[raceId];
  if (!rel) return world;
  const nextRep = Math.max(-100, Math.min(100, rel.reputation + delta));
  let standing: RaceRelations['standing'] = 'neutral';
  if (nextRep <= -60) standing = 'hostile';
  else if (nextRep <= -20) standing = 'cold';
  else if (nextRep >= 60) standing = 'allied';
  else if (nextRep >= 20) standing = 'warm';

  const nextRelations = {
    ...world.relations,
    [raceId]: { ...rel, reputation: nextRep, standing },
  };
  return { ...world, relations: nextRelations };
}
