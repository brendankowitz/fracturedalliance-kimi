import type { BuildingEffect } from './types';

export const BUILDING_EFFECTS: Record<string, BuildingEffect> = {
  cpu:     { pwr: -5, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  air:     { pwr: -4, food: 0, water: 0, air: 4, popCap: 0, happiness: 0, rad: 0 },
  hydration:{ pwr: -3, food: 0, water: 12, air: 0, popCap: 0, happiness: 0, rad: 0 },
  hydroponics:{ pwr: -4, food: 8, water: -2, air: 2, popCap: 0, happiness: 0, rad: 0 },
  living:  { pwr: -1, food: 0, water: 0, air: 0, popCap: 50, happiness: 0, rad: 0 },
  resiblock:{ pwr: -3, food: 0, water: 0, air: 0, popCap: 150, happiness: -5, rad: 0 },
  pleasure:{ pwr: -5, food: 0, water: 0, air: 0, popCap: 0, happiness: 10, rad: 0 },
  medical: { pwr: -3, food: 0, water: 0, air: 0, popCap: 0, happiness: 2, rad: 0 },
  security:{ pwr: -2, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  mine1:   { pwr: -2, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0, mining: { ore: 'selenium', rate: 2 } },
  mine2:   { pwr: -3, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0, mining: { ore: 'selenium', rate: 4 } },
  deep:    { pwr: -4, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0, mining: { ore: 'barium', rate: 1 } },
  seismic: { pwr: -8, food: 0, water: 0, air: 0, popCap: 0, happiness: -8, rad: 4, mining: { ore: 'traxium', rate: 0.5 } },
  power1:  { pwr: 10, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  power2:  { pwr: 30, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  storage: { pwr: -1, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  radfilter:{ pwr: -2, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: -6 },
  laser:   { pwr: -3, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  silo:    { pwr: -4, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  shipyard:{ pwr: -5, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  dock:    { pwr: -10, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  gravnull:{ pwr: -6, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
  engine:  { pwr: -12, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 },
};

export function getBuildingEffect(kind: string): BuildingEffect {
  return BUILDING_EFFECTS[kind] ?? { pwr: 0, food: 0, water: 0, air: 0, popCap: 0, happiness: 0, rad: 0 };
}
