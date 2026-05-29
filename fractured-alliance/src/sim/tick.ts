import type { AsteroidState, SimEvent, WorldState } from './types';
import { getBuildingEffect } from './buildingEffects';
import { createShip, createFleet } from './fleet';
import { SHIP_CLASSES, ORES, RACES } from '../data/gameData';
import { tickMarket, createMarket } from './market';
import { createRelations, updateReputation } from './diplomacy';
import { tickAI } from './ai';

const TICKS_PER_DAY = 30;

export function tickAsteroid(state: AsteroidState, _tick: number): AsteroidState {
  const next: AsteroidState = {
    ...state,
    resources: { ...state.resources, ores: { ...state.resources.ores } },
    placedBuildings: { ...state.placedBuildings },
    buildQueue: state.buildQueue.map(q => ({ ...q })),
    fleets: [...state.fleets],
  };

  // 1. Sum building effects
  let netPwr = 0;
  let netFood = 0;
  let netWater = 0;
  let netAir = 0;
  let netPopCap = 0;
  let netHappiness = 0;
  let netRad = 0;

  for (const [, building] of Object.entries(next.placedBuildings)) {
    if (building.constructing) continue;
    const fx = getBuildingEffect(building.kind);
    netPwr += fx.pwr;
    netFood += fx.food;
    netWater += fx.water;
    netAir += fx.air;
    netPopCap += fx.popCap;
    netHappiness += fx.happiness;
    netRad += fx.rad;
    if (fx.mining) {
      next.resources.ores[fx.mining.ore] += fx.mining.rate;
    }
  }

  next.resources.power = netPwr;
  next.resources.food = netFood;
  next.resources.water = netWater;
  next.resources.air = netAir;
  next.resources.popCap = netPopCap || state.resources.popCap;
  next.resources.happiness = Math.max(0, Math.min(100, next.resources.happiness + netHappiness));
  next.resources.rad = Math.max(0, next.resources.rad + netRad);

  // 2. Cap population
  if (next.resources.pop > next.resources.popCap) {
    next.resources.pop = next.resources.popCap;
  }

  // 3. Advance construction
  if (next.buildQueue.length > 0) {
    const active = next.buildQueue[0];
    if (active.active && !active.disabled) {
      const buildTimeTicks = active.etaDays * TICKS_PER_DAY;
      const increment = buildTimeTicks > 0 ? (100 / buildTimeTicks) : 100;
      active.pct = Math.min(100, active.pct + increment);

      const cellKey = active.cell.replace(/[[\]]/g, '');
      if (!/^\d+,\d+$/.test(cellKey)) {
        // Invalid cell format — remove from queue or mark disabled
        next.buildQueue.shift();
      } else {
        const building = next.placedBuildings[cellKey];
        if (building) {
          building.progress = active.pct / 100;
          if (active.pct >= 100) {
            building.constructing = false;
            next.buildQueue.shift();
            if (building.kind === 'shipyard') {
              const scoutDef = SHIP_CLASSES.find((s) => s.id === 'scout');
              if (scoutDef) {
                const ship = createShip(scoutDef, next.ownerId ?? 'helion', next.id);
                const fleet = createFleet(`fleet-${next.id}`, `${next.id} Defence`, next.ownerId ?? 'helion', [ship]);
                next.fleets = [...next.fleets, fleet];
              }
            }
            if (building.kind === 'dock') {
              const cruiserDef = SHIP_CLASSES.find((s) => s.id === 'cruiser');
              if (cruiserDef) {
                const ship = createShip(cruiserDef, next.ownerId ?? 'helion', next.id);
                const fleet = createFleet(`fleet-${next.id}-cap`, `${next.id} Capital`, next.ownerId ?? 'helion', [ship]);
                next.fleets = [...next.fleets, fleet];
              }
            }
          }
        }
      }
    }
  }

  // Happiness consequences
  if (next.resources.happiness < 30 && next.resources.happiness >= 10) {
    next.resources.food = Math.floor(next.resources.food * 0.5);
  }
  if (next.resources.happiness < 10) {
    // Secession: clear buildings
    next.placedBuildings = {};
    next.buildQueue = [];
  }

  // Asteroid stability decay
  const engineCount = Object.values(next.placedBuildings).filter(b => b.kind === 'engine' && !b.constructing).length;
  if (engineCount > 0) {
    next.resources.rad += engineCount * 0.5;
  }

  return next;
}

export function createInitialMarket() {
  return createMarket(
    Object.fromEntries(ORES.map((o) => [o.id, o.price])) as Record<import('../types').OreKind, number>
  );
}

export function tickWorld(world: WorldState): { world: WorldState; events: SimEvent[] } {
  let nextWorldState: WorldState = { ...world };
  const nextTick = world.tick + 1;
  const newEvents: SimEvent[] = [];

  // Initialize relations if empty
  if (Object.keys(nextWorldState.relations).length === 0) {
    const initialRelations: Record<string, import('./diplomacy').RaceRelations> = {};
    for (const race of RACES) {
      if (race.id !== 'helion') {
        initialRelations[race.id] = createRelations(race.id);
      }
    }
    nextWorldState = { ...nextWorldState, relations: initialRelations };
  }

  const nextAsteroids = nextWorldState.asteroids.map(a => tickAsteroid(a, nextTick));
  const nextMarket = tickMarket(nextWorldState.market, nextTick);

  // Generate events based on state changes
  for (const asteroid of nextAsteroids) {
    if (asteroid.resources.power < 0) {
      newEvents.push({
        id: Date.now() + Math.random(),
        t: formatTick(nextTick),
        kind: 'warn',
        text: `${asteroid.id}: Power deficit detected. ${asteroid.resources.power} MW shortfall.`,
      });
    }
    if (asteroid.resources.happiness < 30) {
      newEvents.push({
        id: Date.now() + Math.random(),
        t: formatTick(nextTick),
        kind: 'crit',
        text: `${asteroid.id}: Colony happiness critical (${Math.floor(asteroid.resources.happiness)}%). Strikes imminent.`,
      });
    }
  }

  // Generate reputation events (placeholder logic)
  for (const race of RACES) {
    if (race.id === 'helion') continue;
    const rel = nextWorldState.relations[race.id];
    if (!rel) continue;
    const hasTradeTreaty = rel.treaties.includes('trade');
    if (hasTradeTreaty && nextTick % 30 === 0) {
      nextWorldState = updateReputation(nextWorldState, race.id, 2);
      newEvents.push({
        id: Date.now() + Math.random(),
        t: formatTick(nextTick),
        kind: 'ally',
        text: `${race.id}: Trade bonus. Reputation +2.`,
      });
    }
    const combatPenalty = nextAsteroids.some(a => a.fleets.some(f => f.ownerId === race.id && f.ships.length > 0));
    if (combatPenalty && nextTick % 30 === 0) {
      nextWorldState = updateReputation(nextWorldState, race.id, -3);
      newEvents.push({
        id: Date.now() + Math.random(),
        t: formatTick(nextTick),
        kind: 'warn',
        text: `${race.id}: Combat penalty. Reputation -3.`,
      });
    }
  }

  // AI tick
  const aiResult = tickAI(nextWorldState);
  nextWorldState = aiResult.world;
  for (const msg of aiResult.events) {
    newEvents.push({
      id: Date.now() + Math.random(),
      t: formatTick(nextTick),
      kind: 'warn',
      text: msg,
    });
  }

  const nextWorld: WorldState = {
    ...nextWorldState,
    tick: nextTick,
    asteroids: nextAsteroids,
    market: nextMarket,
    events: [...newEvents, ...nextWorldState.events].slice(0, 50),
    relations: nextWorldState.relations,
  };

  return { world: nextWorld, events: newEvents };
}

function formatTick(tick: number): string {
  const day = Math.floor(tick / TICKS_PER_DAY);
  const rem = tick % TICKS_PER_DAY;
  return `T+${day.toString().padStart(3, '0')}.${rem.toString().padStart(2, '0')}`;
}
