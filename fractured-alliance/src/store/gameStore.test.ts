import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({
      treasury: 100000,
      blueprintsOwned: ['mk2mine'],
      reputation: { kryll: 0 },
      suspicion: 0,
    });
  });

  it('purchases a blueprint when treasury is sufficient', () => {
    const result = useGameStore.getState().purchaseBlueprint('sensor', 4400);
    expect(result).toBe(true);
    expect(useGameStore.getState().treasury).toBe(95600);
    expect(useGameStore.getState().blueprintsOwned).toContain('sensor');
  });

  it('refuses purchase when treasury is insufficient', () => {
    useGameStore.setState({ treasury: 1000 });
    const result = useGameStore.getState().purchaseBlueprint('sensor', 4400);
    expect(result).toBe(false);
    expect(useGameStore.getState().treasury).toBe(1000);
  });

  it('refuses purchase when already owned', () => {
    useGameStore.setState({ blueprintsOwned: ['sensor'], treasury: 100000 });
    const result = useGameStore.getState().purchaseBlueprint('sensor', 4400);
    expect(result).toBe(false);
  });

  it('updates reputation', () => {
    useGameStore.getState().updateReputation('kryll', 10);
    expect(useGameStore.getState().reputation.kryll).toBe(10);
  });

  it('caps suspicion at 100', () => {
    useGameStore.getState().addSuspicion(80);
    expect(useGameStore.getState().suspicion).toBe(80);
    useGameStore.getState().addSuspicion(30);
    expect(useGameStore.getState().suspicion).toBe(100);
  });

  it('advances tick when not paused', () => {
    useGameStore.setState({ tick: 100, paused: false });
    useGameStore.getState().advanceTick();
    expect(useGameStore.getState().tick).toBe(101);
  });

  it('does not advance tick when paused', () => {
    useGameStore.setState({ tick: 100, paused: true });
    useGameStore.getState().advanceTick();
    expect(useGameStore.getState().tick).toBe(100);
  });
});
