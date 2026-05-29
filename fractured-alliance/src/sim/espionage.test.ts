import { describe, it, expect } from 'vitest';
import { resolveMission } from './espionage';

describe('resolveMission', () => {
  it('high stealth agent usually succeeds on infiltrate', () => {
    let successes = 0;
    for (let i = 0; i < 20; i++) {
      const result = resolveMission(90, 50, 50, 'infiltrate', 30);
      if (result.success) successes++;
    }
    expect(successes).toBeGreaterThan(10);
  });

  it('low stats usually fail against high security', () => {
    let successes = 0;
    for (let i = 0; i < 20; i++) {
      const result = resolveMission(20, 20, 20, 'stealTech', 80);
      if (result.success) successes++;
    }
    expect(successes).toBeLessThan(10);
  });
});
