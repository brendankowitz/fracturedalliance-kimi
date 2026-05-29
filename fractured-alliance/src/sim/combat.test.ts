import { describe, it, expect, beforeEach } from 'vitest';
import { resolveCombat } from './combat';
import { createShip, createFleet, resetShipIdCounter } from './fleet';
import { SHIP_CLASSES } from '../data/gameData';

describe('resolveCombat', () => {
  beforeEach(() => resetShipIdCounter());

  it('resolves a 1v1 combat', () => {
    const scoutDef = SHIP_CLASSES.find((s) => s.id === 'scout')!;
    const a = createFleet('fa', 'A', 'helion', [createShip(scoutDef, 'helion', 'arch-i')]);
    const b = createFleet('fb', 'B', 'kryll', [createShip(scoutDef, 'kryll', 'pyre')]);

    const result = resolveCombat(a, b);
    expect(result.log.length).toBeGreaterThan(0);
    expect(result.attackerLosses.length + result.defenderLosses.length).toBeGreaterThan(0);
  });

  it('shield absorbs damage before hull', () => {
    const eagleDef = SHIP_CLASSES.find((s) => s.id === 'eagle')!;
    const scoutDef = SHIP_CLASSES.find((s) => s.id === 'scout')!;
    const a = createFleet('fa', 'A', 'helion', [createShip(eagleDef, 'helion', 'arch-i')]);
    const b = createFleet('fb', 'B', 'kryll', [createShip(scoutDef, 'kryll', 'pyre')]);

    resolveCombat(a, b);
    expect(a.ships[0].shield).toBeLessThan(60);
    expect(a.ships[0].hp).toBe(240);
  });

  it('destroys ships at 0 hp', () => {
    const scoutDef = SHIP_CLASSES.find((s) => s.id === 'scout')!;
    const battleshipDef = SHIP_CLASSES.find((s) => s.id === 'battleship')!;
    const a = createFleet('fa', 'A', 'helion', [createShip(battleshipDef, 'helion', 'arch-i')]);
    const b = createFleet('fb', 'B', 'kryll', [createShip(scoutDef, 'kryll', 'pyre')]);

    const result = resolveCombat(a, b);
    expect(result.defenderLosses.length).toBe(1);
    expect(b.ships[0].status).toBe('destroyed');
  });
});
