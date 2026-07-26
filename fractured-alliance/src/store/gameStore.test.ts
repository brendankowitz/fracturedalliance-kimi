import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore, intervalForSpeed } from './gameStore';
import { VICTORY_TREASURY } from '../sim/worldFactory';

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

describe('gameStore.newMatch', () => {
  it('resets world state wholesale and enters the sector screen', () => {
    // Dirty the store: advance state, buy a blueprint, place a building, push an event.
    useGameStore.setState({ selectedAsteroid: 'arch-i', paused: false });
    useGameStore.getState().advanceTick();
    useGameStore.getState().purchaseBlueprint('drillboss', 100);
    useGameStore.getState().placeBuilding('2,2', 'power1');
    useGameStore.setState({
      events: [{ id: 1, t: 'T+0', kind: 'warn', text: 'old news' }],
      suspicion: 90,
      reputation: { kryll: 99 },
      federationStanding: 5,
      screen: 'menu',
    });
    const dirtyTick = useGameStore.getState().tick;
    expect(dirtyTick).toBeGreaterThan(0);

    useGameStore.getState().newMatch();

    const state = useGameStore.getState();
    expect(state.screen).toBe('sector');
    expect(state.tick).toBe(0);
    expect(state.treasury).toBe(142840);
    expect(state.events).toEqual([]);
    expect(state.blueprintsOwned).toEqual(['mk2mine', 'mk2deep', 'seismic', 'hep', 'powamp', 'sensor']);
    expect(state.suspicion).toBe(42);
    expect(state.reputation).toEqual({ kryll: -42, motkaj: -18, achar: 64, brakkat: 8, rigal: 38, mauna: -80 });
    expect(state.federationStanding).toBe(62);
    expect(state.selectedAsteroid).toBe('arch-i');
    // The building placed before the reset is gone.
    const archI = state.asteroids.find((a) => a.id === 'arch-i')!;
    expect(archI.placedBuildings['2,2']).toBeUndefined();
    expect(archI.placedBuildings['4,4']).toEqual({ kind: 'cpu' });
  });

  it('applies the selected scenario treasury modifier', () => {
    useGameStore.getState().newMatch('rush');
    expect(useGameStore.getState().treasury).toBe(71420); // 142840 × 0.5
    useGameStore.getState().newMatch('expedition');
    expect(useGameStore.getState().treasury).toBe(142840);
  });

  it('preserves settings and save slots across a new match', () => {
    const settingsBefore = useGameStore.getState().settings;
    const savesBefore = useGameStore.getState().saves;
    useGameStore.getState().newMatch();
    expect(useGameStore.getState().settings).toBe(settingsBefore);
    expect(useGameStore.getState().saves).toBe(savesBefore);
  });

  it('two consecutive matches are independent worlds', () => {
    useGameStore.getState().newMatch();
    const first = useGameStore.getState().asteroids;
    useGameStore.getState().newMatch();
    const second = useGameStore.getState().asteroids;
    expect(second).not.toBe(first);
    expect(second.find((a) => a.id === 'arch-i')).not.toBe(first.find((a) => a.id === 'arch-i'));
  });
});

describe('gameStore verdict', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().newMatch();
  });

  it('triggers economic victory when the treasury reaches the threshold at a tick boundary', () => {
    useGameStore.setState({ treasury: VICTORY_TREASURY, paused: false });
    useGameStore.getState().advanceTick();
    const state = useGameStore.getState();
    expect(state.verdict).toBe('won');
    expect(state.verdictCause).toBe('Economic victory — ₡500,000 treasury');
    expect(state.screen).toBe('verdict');
    expect(state.paused).toBe(true);
  });

  it('does not trigger victory below the threshold', () => {
    useGameStore.setState({ treasury: VICTORY_TREASURY - 1, paused: false, screen: 'sector' });
    useGameStore.getState().advanceTick();
    const state = useGameStore.getState();
    expect(state.verdict).toBeNull();
    expect(state.screen).toBe('sector');
  });

  it('triggers defeat when the last colony secedes', () => {
    // Drive every helion colony to zero happiness with no happiness buildings.
    useGameStore.setState((s) => ({
      paused: false,
      asteroids: s.asteroids.map((a) =>
        a.ownerId === 'helion'
          ? { ...a, placedBuildings: {}, buildQueue: [], resources: { ...a.resources, happiness: 0 } }
          : a
      ),
    }));
    useGameStore.getState().advanceTick();
    const state = useGameStore.getState();
    expect(state.asteroids.some((a) => a.ownerId === 'helion')).toBe(false);
    expect(state.verdict).toBe('lost');
    expect(state.verdictCause).toBe('All colonies lost');
    expect(state.screen).toBe('verdict');
    expect(state.paused).toBe(true);
    expect(state.events.some((e) => e.kind === 'crit' && e.text.includes('COLONY SECEDED'))).toBe(true);
  });

  it('checks victory before defeat', () => {
    useGameStore.setState((s) => ({
      paused: false,
      treasury: VICTORY_TREASURY,
      asteroids: s.asteroids.map((a) => ({ ...a, ownerId: null })),
    }));
    useGameStore.getState().advanceTick();
    expect(useGameStore.getState().verdict).toBe('won');
  });

  it('does not advance the sim after the match has ended', () => {
    useGameStore.setState({ treasury: VICTORY_TREASURY, paused: false });
    useGameStore.getState().advanceTick();
    const endTick = useGameStore.getState().tick;
    useGameStore.getState().advanceTick();
    expect(useGameStore.getState().tick).toBe(endTick);
    expect(useGameStore.getState().verdict).toBe('won');
  });

  it('newMatch resets verdict fields', () => {
    useGameStore.setState({ treasury: VICTORY_TREASURY, paused: false });
    useGameStore.getState().advanceTick();
    expect(useGameStore.getState().verdict).toBe('won');

    useGameStore.getState().newMatch();
    const state = useGameStore.getState();
    expect(state.verdict).toBeNull();
    expect(state.verdictCause).toBeNull();
    expect(state.screen).toBe('sector');
    expect(state.paused).toBe(false);
  });

  it('endMatch stamps the verdict onto occupied save slots', () => {
    useGameStore.getState().saveGame(1, 'mid-match');
    useGameStore.setState({ treasury: VICTORY_TREASURY, paused: false });
    useGameStore.getState().advanceTick();
    const slot = useGameStore.getState().saves.find((s) => s.slot === 1);
    expect(slot?.verdict).toBe('Won');
  });
});
