import type { WorldState } from './types';
import { createShip, createFleet } from './fleet';
import { SHIP_CLASSES } from '../data/gameData';
import { updateReputation } from './diplomacy';

export interface AIPersonality {
  raceId: string;
  aggression: number; // 0-1, chance to declare war
  economyBias: number; // 0-1, prioritizes building over fleet
  breakNAPThreshold: number; // reputation at which they break NAP
  doubleRetaliation: boolean; // Brakkat trait
  accusationBonus: number; // Kryll trait
}

export const AI_PERSONALITIES: Record<string, AIPersonality> = {
  kryll:   { raceId: 'kryll', aggression: 0.7, economyBias: 0.4, breakNAPThreshold: -30, doubleRetaliation: false, accusationBonus: 0.25 },
  motkaj:  { raceId: 'motkaj', aggression: 0.6, economyBias: 0.5, breakNAPThreshold: -10, doubleRetaliation: false, accusationBonus: 0 },
  achar:   { raceId: 'achar', aggression: 0.1, economyBias: 0.8, breakNAPThreshold: -50, doubleRetaliation: false, accusationBonus: 0 },
  brakkat: { raceId: 'brakkat', aggression: 0.3, economyBias: 0.6, breakNAPThreshold: -40, doubleRetaliation: true, accusationBonus: 0 },
  rigal:   { raceId: 'rigal', aggression: 0.2, economyBias: 0.7, breakNAPThreshold: -50, doubleRetaliation: false, accusationBonus: 0 },
  mauna:   { raceId: 'mauna', aggression: 0.9, economyBias: 0.2, breakNAPThreshold: 0, doubleRetaliation: false, accusationBonus: 0 },
};

export function tickAI(world: WorldState): { world: WorldState; events: string[] } {
  const events: string[] = [];
  let nextWorld = world;

  for (const raceId of Object.keys(AI_PERSONALITIES)) {
    nextWorld = tickRaceAI(nextWorld, raceId, events);
  }

  return { world: nextWorld, events };
}

function tickRaceAI(world: WorldState, raceId: string, events: string[]): WorldState {
  const personality = AI_PERSONALITIES[raceId];
  if (!personality) return world;

  const raceAsteroids = world.asteroids.filter((a) => a.ownerId === raceId);
  if (raceAsteroids.length === 0) return world;

  // 1. Economy: mine ore from all owned asteroids
  for (const asteroid of raceAsteroids) {
    for (const building of Object.values(asteroid.placedBuildings)) {
      if (building.constructing) continue;
      // Simple mining logic
      if (building.kind === 'mine1') {
        asteroid.resources.ores.selenium += 1;
      } else if (building.kind === 'mine2') {
        asteroid.resources.ores.selenium += 2;
      }
    }
  }

  // 2. Fleet building: if they have shipyards and treasury > threshold, build ships
  const hasShipyard = raceAsteroids.some((a) =>
    Object.values(a.placedBuildings).some((b) => b.kind === 'shipyard' && !b.constructing)
  );

  if (hasShipyard && world.tick % 30 === 0) {
    const asteroid = raceAsteroids[0];
    const scoutDef = SHIP_CLASSES.find((s) => s.id === 'scout');
    if (scoutDef) {
      const ship = createShip(scoutDef, raceId, asteroid.id);
      const fleet = createFleet(`fleet-${raceId}-${world.tick}`, `${raceId} Patrol`, raceId, [ship]);
      asteroid.fleets = [...asteroid.fleets, fleet];
      events.push(`${raceId}: Constructed ${ship.name} at ${asteroid.id}`);
    }
  }

  // 3. Aggression: evaluate targets
  if (world.tick % 60 === 0 && Math.random() < personality.aggression) {
    const playerAsteroids = world.asteroids.filter((a) => a.ownerId === 'helion');
    if (playerAsteroids.length > 0) {
      const target = playerAsteroids[0];
      // Update threat status
      const aIdx = world.asteroids.findIndex((a) => a.id === target.id);
      if (aIdx >= 0) {
        world.asteroids[aIdx] = { ...world.asteroids[aIdx], threat: 'fleet' };
      }
      events.push(`${raceId}: Fleet detected approaching ${target.id}`);

      // Reputation penalty
      world = updateReputation(world, raceId, -5);
    }
  }

  return world;
}
