import { describe, it, expect } from 'vitest';
import { checkAchievements } from './achievements';

describe('checkAchievements', () => {
  it('unlocks corporate raider at 500k treasury', () => {
    const state = { treasury: 600000, tick: 1, asteroids: [{ ownerId: 'helion' }], events: [], relations: {}, blueprintsOwned: [], suspicion: 0 };
    const unlocked = new Set<string>();
    const result = checkAchievements(state, unlocked);
    expect(result).toContain('corporate-raider');
  });

  it('does not re-unlock already unlocked', () => {
    const state = { treasury: 600000, tick: 1, asteroids: [{ ownerId: 'helion' }], events: [], relations: {}, blueprintsOwned: [], suspicion: 0 };
    const unlocked = new Set<string>(['corporate-raider']);
    const result = checkAchievements(state, unlocked);
    expect(result).not.toContain('corporate-raider');
  });
});
