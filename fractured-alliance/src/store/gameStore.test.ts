import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore, intervalForSpeed } from './gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({
      treasury: 100000,
      blueprintsOwned: ['mk2mine'],
      reputation: { kryll: 0 },
      suspicion: 0,
      tick: 341,
      paused: true,
      asteroids: [
        {
          id: 'arch-i',
          ownerId: 'helion',
          resources: {
            power: 12, food: 8, water: 12, air: 4,
            pop: 480, popCap: 700, happiness: 78, rad: 8,
            ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 },
          },
          placedBuildings: {
            '4,4': { kind: 'cpu' },
            '3,4': { kind: 'air' },
            '5,4': { kind: 'hydration' },
            '4,3': { kind: 'living' },
            '4,5': { kind: 'living' },
            '3,3': { kind: 'power1' },
            '5,5': { kind: 'power1' },
            '2,4': { kind: 'mine1' },
            '6,4': { kind: 'mine2' },
            '3,5': { kind: 'hydroponics' },
            '5,3': { kind: 'medical' },
            '2,3': { kind: 'storage' },
            '6,5': { kind: 'storage' },
            '2,5': { kind: 'laser' },
            '6,3': { kind: 'laser' },
            '4,6': { kind: 'silo' },
            '1,4': { kind: 'deep' },
            '7,4': { kind: 'security' },
            '4,2': { kind: 'resiblock' },
            '3,6': { kind: 'pleasure', damaged: true },
            '1,3': { kind: 'mine1', constructing: true, progress: 0.55 },
            '1,5': { kind: 'mine1', constructing: true, progress: 0.32 },
          },
          buildQueue: [
            { name: 'Mine Mk1', cell: '[1,3]', pct: 55, etaDays: 2, active: true },
            { name: 'Mine Mk1', cell: '[1,5]', pct: 32, etaDays: 3, active: true },
            { name: 'Storage Tower', cell: '[7,5]', pct: 0, etaDays: 4, active: false },
            { name: 'Laser Turret', cell: '[3,2]', pct: 0, etaDays: 5, active: false },
            { name: 'Mine Mk2', cell: '[7,3]', pct: 0, etaDays: 7, active: false },
            { name: 'Pleasure Dome', cell: '—', pct: 0, etaDays: 8, active: false, disabled: true, note: 'awaiting medical clear' },
          ],
          fleets: [],
        },
      ],
      events: [],
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

  it('advanceTick runs simulation and updates resources', () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.setPaused(false));
    const initialPower = result.current.asteroids[0].resources.power;
    act(() => result.current.advanceTick());
    expect(result.current.asteroids[0].resources.power).not.toBe(initialPower);
    expect(result.current.tick).toBe(342);
  });

  it('placeBuilding adds a building to the selected asteroid', () => {
    useGameStore.setState({ selectedAsteroid: 'arch-i' });
    useGameStore.getState().placeBuilding('2,2', 'mine2');
    const asteroid = useGameStore.getState().asteroids[0];
    expect(asteroid.placedBuildings['2,2']).toEqual({ kind: 'mine2', constructing: true, progress: 0 });
  });

  it('placeBuilding charges cost and queues construction when affordable', () => {
    useGameStore.setState({ selectedAsteroid: 'arch-i', treasury: 100000 });
    const result = useGameStore.getState().placeBuilding('2,2', 'power1');
    expect(result).toBe(true);
    const state = useGameStore.getState();
    expect(state.treasury).toBe(99300); // 100000 - 700
    const asteroid = state.asteroids[0];
    expect(asteroid.placedBuildings['2,2']).toEqual({ kind: 'power1', constructing: true, progress: 0 });
    const entry = asteroid.buildQueue[asteroid.buildQueue.length - 1];
    expect(entry).toEqual({ name: 'Power Plant', cell: '[2,2]', pct: 0, etaDays: 5, active: false });
  });

  it('placeBuilding marks the queue entry active when the queue was empty', () => {
    useGameStore.setState({ selectedAsteroid: 'arch-i', treasury: 100000 });
    useGameStore.setState((state) => ({
      asteroids: [{ ...state.asteroids[0], buildQueue: [] }],
    }));
    const result = useGameStore.getState().placeBuilding('2,2', 'power1');
    expect(result).toBe(true);
    const queue = useGameStore.getState().asteroids[0].buildQueue;
    expect(queue).toHaveLength(1);
    expect(queue[0]).toEqual({ name: 'Power Plant', cell: '[2,2]', pct: 0, etaDays: 5, active: true });
  });

  it('placeBuilding is rejected when treasury is insufficient', () => {
    useGameStore.setState({ selectedAsteroid: 'arch-i', treasury: 100 });
    const before = useGameStore.getState().asteroids;
    const result = useGameStore.getState().placeBuilding('2,2', 'power1');
    expect(result).toBe(false);
    const state = useGameStore.getState();
    expect(state.treasury).toBe(100);
    expect(state.asteroids).toBe(before);
    expect(state.asteroids[0].placedBuildings['2,2']).toBeUndefined();
  });

  it('placeBuilding is rejected for an unknown building kind', () => {
    useGameStore.setState({ selectedAsteroid: 'arch-i', treasury: 100000 });
    const result = useGameStore.getState().placeBuilding('2,2', 'death-star');
    expect(result).toBe(false);
    expect(useGameStore.getState().treasury).toBe(100000);
    expect(useGameStore.getState().asteroids[0].placedBuildings['2,2']).toBeUndefined();
  });

  it('intervalForSpeed scales the base 6000ms tick interval', () => {
    expect(intervalForSpeed(1)).toBe(6000);
    expect(intervalForSpeed(8)).toBe(750);
    expect(intervalForSpeed(0.5)).toBe(12000);
  });

  it('buyOre deducts treasury and adds ore', () => {
    const { result } = renderHook(() => useGameStore());
    const initialTreasury = result.current.treasury;
    act(() => result.current.buyOre('selenium', 1));
    expect(result.current.treasury).toBeLessThan(initialTreasury);
    expect(result.current.asteroids[0].resources.ores.selenium).toBeGreaterThan(0);
  });

  it('sellOre adds treasury and deducts ore', () => {
    const { result } = renderHook(() => useGameStore());
    // First buy some ore
    act(() => result.current.buyOre('selenium', 5));
    const treasuryAfterBuy = result.current.treasury;
    // Then sell it
    act(() => result.current.sellOre('selenium', 3));
    expect(result.current.treasury).toBeGreaterThan(treasuryAfterBuy);
    expect(result.current.asteroids[0].resources.ores.selenium).toBe(2);
  });
});
