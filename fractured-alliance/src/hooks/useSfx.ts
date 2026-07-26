/* ============================================================
   useSfx — single tick/event watcher that turns sim state into
   feedback: day chimes, critical-event stingers, the optional
   pause-on-crit behavior, and the taskbar day-rollover flash.
   Mounted once in App; components elsewhere fire sounds
   directly from their own event handlers.
   ============================================================ */

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { simDay } from '../utils/simDate';
import { dayChime, alertStinger } from '../audio/sfx';

/** How long the taskbar date pulses after a day rollover. */
export const DAY_FLASH_MS = 1200;

export function useSfx() {
  const tick = useGameStore((s) => s.tick);
  const events = useGameStore((s) => s.events);
  const pauseOnCrit = useGameStore((s) => s.settings.pauseOnCrit);
  const setPaused = useGameStore((s) => s.setPaused);

  const [dayFlash, setDayFlash] = useState(false);
  const lastDayRef = useRef(simDay(useGameStore.getState().tick));
  const lastEventIdRef = useRef<number | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Day rollover: soft chime + taskbar flash. */
  useEffect(() => {
    const day = simDay(tick);
    if (day === lastDayRef.current) return;
    lastDayRef.current = day;
    dayChime();
    setDayFlash(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setDayFlash(false), DAY_FLASH_MS);
  }, [tick]);

  useEffect(
    () => () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    },
    []
  );

  /* New critical events: stinger (+ optional auto-pause). */
  useEffect(() => {
    const newest = events[0];
    if (!newest) return;
    const lastId = lastEventIdRef.current;
    lastEventIdRef.current = newest.id;
    if (lastId === null || newest.id === lastId) return;
    const fresh = [];
    for (const e of events) {
      if (e.id === lastId) break;
      fresh.push(e);
    }
    if (fresh.some((e) => e.kind === 'crit')) {
      alertStinger();
      if (pauseOnCrit) setPaused(true);
    }
  }, [events, pauseOnCrit, setPaused]);

  return { dayFlash };
}
