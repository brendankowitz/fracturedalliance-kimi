import { describe, it, expect } from 'vitest';
import { createNewMatch, SCENARIOS, BASE_TREASURY, STARTER_BLUEPRINTS, DEFAULT_SCENARIO_ID } from './worldFactory';
import { ASTEROIDS } from '../data/gameData';

describe('worldFactory.createNewMatch', () => {
  it('produces sane defaults for the default scenario', () => {
    const match = createNewMatch();
    expect(match.tick).toBe(0);
    expect(match.treasury).toBe(BASE_TREASURY);
    expect(match.selectedAsteroid).toBe('arch-i');
    expect(match.events).toEqual([]);
    expect(match.blueprintsOwned).toEqual(STARTER_BLUEPRINTS);
    expect(match.suspicion).toBe(42);
    expect(match.federationStanding).toBe(62);
    expect(match.asteroids).toHaveLength(ASTEROIDS.length);
    expect(Object.keys(match.relations)).not.toContain('helion');
    expect(Object.keys(match.relations).length).toBeGreaterThan(0);
    // Arch-I carries its starting fixture (buildings + queue).
    const archI = match.asteroids.find((a) => a.id === 'arch-i')!;
    expect(archI.placedBuildings['4,4']).toEqual({ kind: 'cpu' });
    expect(archI.buildQueue.length).toBeGreaterThan(0);
  });

  it('applies the scenario treasury modifier', () => {
    const rush = createNewMatch('rush');
    expect(rush.treasury).toBe(Math.round(BASE_TREASURY * SCENARIOS.rush.treasuryModifier));
    expect(rush.treasury).toBeLessThan(BASE_TREASURY);
    const standard = createNewMatch('ironman');
    expect(standard.treasury).toBe(BASE_TREASURY);
  });

  it('falls back to the default scenario for an unknown id', () => {
    const unknown = createNewMatch('does-not-exist');
    const dflt = createNewMatch(DEFAULT_SCENARIO_ID);
    expect(unknown.treasury).toBe(dflt.treasury);
  });

  it('returns fully independent copies — mutating one affects neither the other nor the source data', () => {
    const a = createNewMatch();
    const b = createNewMatch();

    const archIBefore = ASTEROIDS.find((x) => x.id === 'arch-i')!;
    const depositsBefore = [...archIBefore.deposits];

    // Mutate every mutable layer of result A.
    a.treasury = 1;
    a.blueprintsOwned.push('hacked-bp');
    a.reputation.kryll = 999;
    a.events.push({ id: 1, t: 'T+0', kind: 'warn', text: 'mutated' });
    const aArchI = a.asteroids.find((x) => x.id === 'arch-i')!;
    aArchI.resources.power = -500;
    aArchI.resources.ores.selenium = 777;
    aArchI.placedBuildings['0,0'] = { kind: 'death-ray' };
    aArchI.buildQueue[0].pct = 99;
    aArchI.deposits!.push('nexos');
    a.relations.kryll.reputation = -100;
    a.relations.kryll.treaties.push('peace');

    // Result B is untouched.
    expect(b.treasury).toBe(BASE_TREASURY);
    expect(b.blueprintsOwned).toEqual(STARTER_BLUEPRINTS);
    expect(b.reputation.kryll).toBe(-42);
    expect(b.events).toEqual([]);
    const bArchI = b.asteroids.find((x) => x.id === 'arch-i')!;
    expect(bArchI.resources.power).toBe(12);
    expect(bArchI.resources.ores.selenium).toBe(0);
    expect(bArchI.placedBuildings['0,0']).toBeUndefined();
    expect(bArchI.buildQueue[0].pct).toBe(55);
    expect(bArchI.deposits).toEqual(depositsBefore);
    expect(b.relations.kryll.reputation).toBe(0);
    expect(b.relations.kryll.treaties).toEqual([]);

    // Source game data is untouched.
    expect(archIBefore.deposits).toEqual(depositsBefore);

    // A fresh call after the mutation is also pristine.
    const c = createNewMatch();
    expect(c.asteroids.find((x) => x.id === 'arch-i')!.placedBuildings['0,0']).toBeUndefined();
  });

  it('every scenario id used by the menu has a definition', () => {
    for (const id of ['expedition', 'rich', 'siege', 'rush', 'ironman']) {
      expect(SCENARIOS[id]).toBeDefined();
      expect(SCENARIOS[id].treasuryModifier).toBeGreaterThan(0);
    }
  });
});
