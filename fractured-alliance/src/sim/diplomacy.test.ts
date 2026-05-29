import { describe, it, expect } from 'vitest';
import { createRelations, proposeTreaty, breakTreaty, updateReputation } from './diplomacy';
import type { WorldState } from './types';

function makeWorld(): WorldState {
  return {
    tick: 0,
    treasury: 0,
    asteroids: [],
    suspicion: 0,
    reputation: {},
    federationStanding: 50,
    events: [],
    fleets: [],
    market: {} as any,
    relations: {
      kryll: createRelations('kryll'),
    },
  };
}

describe('proposeTreaty', () => {
  it('signs treaty if reputation is high enough', () => {
    let world = makeWorld();
    world = updateReputation(world, 'kryll', 25);
    const result = proposeTreaty(world, 'kryll', 'trade');
    expect(result.world.relations.kryll.treaties).toContain('trade');
    expect(result.event).toBeDefined();
  });

  it('rejects treaty if reputation too low', () => {
    const world = makeWorld();
    const result = proposeTreaty(world, 'kryll', 'trade');
    expect(result.world.relations.kryll.treaties).not.toContain('trade');
    expect(result.event?.kind).toBe('warn');
  });
});

describe('breakTreaty', () => {
  it('removes treaty and logs casus belli', () => {
    let world = makeWorld();
    world = updateReputation(world, 'kryll', 10);
    world = proposeTreaty(world, 'kryll', 'nonAggression').world;
    const result = breakTreaty(world, 'kryll', 'nonAggression');
    expect(result.world.relations.kryll.treaties).not.toContain('nonAggression');
    expect(result.world.relations.kryll.casusBelli).toBe(true);
    expect(result.event?.kind).toBe('crit');
  });
});

describe('updateReputation', () => {
  it('clamps to -100..100', () => {
    let world = makeWorld();
    world = updateReputation(world, 'kryll', 150);
    expect(world.relations.kryll.reputation).toBe(100);
    world = updateReputation(world, 'kryll', -300);
    expect(world.relations.kryll.reputation).toBe(-100);
  });

  it('sets standing based on reputation', () => {
    let world = makeWorld();
    world = updateReputation(world, 'kryll', 70);
    expect(world.relations.kryll.standing).toBe('allied');
    world = updateReputation(world, 'kryll', -170);
    expect(world.relations.kryll.standing).toBe('hostile');
  });
});
