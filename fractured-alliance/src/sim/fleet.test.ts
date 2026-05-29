import { describe, it, expect, beforeEach } from 'vitest';
import { createShip, createFleet, resetShipIdCounter } from './fleet';
import { SHIP_CLASSES } from '../data/gameData';

beforeEach(() => resetShipIdCounter());

describe('createShip', () => {
  it('creates a ship with stats from class def', () => {
    const scout = SHIP_CLASSES.find((s) => s.id === 'scout')!;
    const ship = createShip(scout, 'helion', 'arch-i');
    expect(ship.classId).toBe('scout');
    expect(ship.hp).toBe(60);
    expect(ship.shield).toBe(0);
    expect(ship.ownerId).toBe('helion');
    expect(ship.status).toBe('idle');
  });

  it('assigns unique ids', () => {
    const scout = SHIP_CLASSES.find((s) => s.id === 'scout')!;
    const a = createShip(scout, 'helion', 'arch-i');
    const b = createShip(scout, 'helion', 'arch-i');
    expect(a.id).not.toBe(b.id);
  });
});

describe('createFleet', () => {
  it('creates a fleet with ships', () => {
    const scout = SHIP_CLASSES.find((s) => s.id === 'scout')!;
    const ship = createShip(scout, 'helion', 'arch-i');
    const fleet = createFleet('f1', 'Alpha', 'helion', [ship]);
    expect(fleet.ships).toHaveLength(1);
    expect(fleet.orders).toBe('hold');
  });
});
