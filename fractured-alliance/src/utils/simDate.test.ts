import { describe, it, expect } from 'vitest';
import { simDate, simDay, isLeapYear, TICKS_PER_DAY } from './simDate';

describe('simDate', () => {
  it('maps day 0 to the epoch date 25-05-2496', () => {
    expect(simDate(0)).toBe('25-05-2496');
  });

  it('ignores ticks within a day', () => {
    expect(simDate(1)).toBe('25-05-2496');
    expect(simDate(TICKS_PER_DAY - 1)).toBe('25-05-2496');
    expect(simDate(TICKS_PER_DAY)).toBe('26-05-2496');
  });

  it('rolls over months', () => {
    expect(simDate(6 * TICKS_PER_DAY)).toBe('31-05-2496');
    expect(simDate(7 * TICKS_PER_DAY)).toBe('01-06-2496');
  });

  it('rolls over years', () => {
    // 25 May 2496 + 220 days = 31 Dec 2496
    expect(simDate(220 * TICKS_PER_DAY)).toBe('31-12-2496');
    expect(simDate(221 * TICKS_PER_DAY)).toBe('01-01-2497');
  });

  it('handles leap day (2504 is divisible by 4, not by 100)', () => {
    // 25 May 2496 + 2835 days = 29 Feb 2504
    expect(simDate(2835 * TICKS_PER_DAY)).toBe('29-02-2504');
    expect(simDate(2836 * TICKS_PER_DAY)).toBe('01-03-2504');
  });

  it('skips leap day in 2500 (divisible by 100, not 400)', () => {
    // 25 May 2496 + 1374 days = 28 Feb 2500
    expect(simDate(1374 * TICKS_PER_DAY)).toBe('28-02-2500');
    expect(simDate(1375 * TICKS_PER_DAY)).toBe('01-03-2500');
  });

  it('clamps negative ticks to the epoch', () => {
    expect(simDate(-15)).toBe('25-05-2496');
  });
});

describe('simDay', () => {
  it('counts whole days', () => {
    expect(simDay(0)).toBe(0);
    expect(simDay(341)).toBe(11);
    expect(simDay(29)).toBe(0);
    expect(simDay(30)).toBe(1);
  });
});

describe('isLeapYear', () => {
  it('follows Gregorian rules', () => {
    expect(isLeapYear(2496)).toBe(true);
    expect(isLeapYear(2497)).toBe(false);
    expect(isLeapYear(2500)).toBe(false);
    expect(isLeapYear(2800)).toBe(true);
  });
});
