import type { ShipClassDef } from '../types';

export interface ShipInstance {
  id: string;
  classId: string;
  name: string;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  speed: number;
  dmg: number;
  ownerId: string;
  loc: string; // asteroid id or 'sector'
  status: 'idle' | 'moving' | 'engaged' | 'destroyed';
}

export interface Fleet {
  id: string;
  name: string;
  ownerId: string;
  ships: ShipInstance[];
  orders: 'hold' | 'patrol' | 'attack' | 'retreat';
  targetFleetId?: string;
}

let shipIdCounter = 0;
export function createShip(classDef: ShipClassDef, ownerId: string, loc: string): ShipInstance {
  shipIdCounter += 1;
  return {
    id: `ship-${shipIdCounter}`,
    classId: classDef.id,
    name: classDef.name,
    hp: classDef.hp,
    maxHp: classDef.hp,
    shield: classDef.shield,
    maxShield: classDef.shield,
    speed: classDef.speed,
    dmg: classDef.dmg,
    ownerId,
    loc,
    status: 'idle',
  };
}

export function createFleet(id: string, name: string, ownerId: string, ships: ShipInstance[]): Fleet {
  return { id, name, ownerId, ships, orders: 'hold' };
}

export function resetShipIdCounter() {
  shipIdCounter = 0;
}
