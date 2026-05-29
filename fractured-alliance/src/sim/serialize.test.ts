import { describe, it, expect } from 'vitest';
import { serializeWorld, deserializeWorld } from './serialize';
import type { WorldState } from './types';

function makeWorld(): WorldState {
  return {
    tick: 100,
    treasury: 5000,
    asteroids: [],
    suspicion: 0,
    reputation: {},
    federationStanding: 50,
    events: [],
    fleets: [],
    market: {} as any,
    relations: {},
  };
}

describe('serializeWorld', () => {
  it('serializes and deserializes world state', () => {
    const world = makeWorld();
    const json = serializeWorld(world, 'Test Save');
    const result = deserializeWorld(json);
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Test Save');
    expect(result.data?.world.tick).toBe(100);
  });

  it('fails on corrupted data', () => {
    const result = deserializeWorld('not-json');
    expect(result.success).toBe(false);
  });
});
