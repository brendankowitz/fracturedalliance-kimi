/**
 * In-fiction calendar for the ops console.
 * Day 0 = 25 May 2496 (Fragile Allegiance's opening date), 30 sim ticks per day.
 */

export const TICKS_PER_DAY = 30;

const EPOCH_YEAR = 2496;
const EPOCH_MONTH = 5; // 1-based
const EPOCH_DAY = 25;

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function monthLength(year: number, month: number): number {
  if (month === 2 && isLeapYear(year)) return 29;
  return MONTH_LENGTHS[month - 1];
}

/** Whole days elapsed since the epoch (25-05-2496). */
export function simDay(tick: number): number {
  return Math.floor(Math.max(0, tick) / TICKS_PER_DAY);
}

/** Format a sim tick as an in-fiction calendar date, `DD-MM-YYYY`. */
export function simDate(tick: number): string {
  let remaining = simDay(tick);
  let year = EPOCH_YEAR;
  let month = EPOCH_MONTH;
  let day = EPOCH_DAY;

  while (remaining > 0) {
    const daysLeftInMonth = monthLength(year, month) - day;
    if (remaining <= daysLeftInMonth) {
      day += remaining;
      remaining = 0;
    } else {
      remaining -= daysLeftInMonth + 1;
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
  }

  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  return `${dd}-${mm}-${year}`;
}
