/* ============================================================
   beltBadges — derive per-asteroid map overlays (fleet presence,
   armed engines, merchant dock) from existing sim state. Pure
   module, no React/DOM deps. Renders only what the sim knows:
   no ship world-positions, no ETAs, no satellite tracking.
   ============================================================ */

import type { AsteroidState } from '../../sim/types';
import type { Fleet, ShipInstance } from '../../sim/fleet';
import type { MarketState } from '../../sim/market';

/** Fleet tint key — mirrors ownerColorKey in BeltCanvas / glow idiom. */
export type FleetTone = 'warn' | 'crit' | 'signal';

/** ownerId → tint (helion amber, mauna crit-red, others signal-cyan). */
export function fleetToneFor(ownerId: string): FleetTone {
  if (ownerId === 'helion') return 'warn';
  if (ownerId === 'mauna') return 'crit';
  return 'signal';
}

/** Silhouette size bucket for a ship class (glyph language of ShipGlyph). */
export type SilhouetteSize = 'S' | 'M' | 'L';

export function silhouetteSizeFor(classId: string): SilhouetteSize {
  switch (classId) {
    case 'terminator':
    case 'cruiser':
      return 'L';
    case 'eagle':
    case 'battleship':
    case 'destructor':
      return 'M';
    default:
      return 'S';
  }
}

const SIZE_RANK: Record<SilhouetteSize, number> = { S: 0, M: 1, L: 2 };

export interface FleetBadge {
  /** Active (non-destroyed) hulls stationed at the asteroid. */
  hulls: number;
  /** Owner of the largest stationed fleet (drives the chip tint). */
  ownerId: string;
  tone: FleetTone;
  /** Any stationed fleet has attack orders → pulsing red underline. */
  attacking: boolean;
  /** Any stationed fleet has patrol orders → slow orbit drift. */
  patrolling: boolean;
  /** Up to 3 silhouettes, largest class first. */
  silhouettes: SilhouetteSize[];
}

function activeShips(fleet: Fleet): ShipInstance[] {
  return fleet.ships.filter((s) => s.status !== 'destroyed');
}

/**
 * Fleet-presence badge for a set of stationed fleets, or null when
 * nothing active is stationed. Destroyed hulls never render.
 */
export function fleetBadgeFromFleets(fleets: Fleet[]): FleetBadge | null {
  const stationed: { fleet: Fleet; active: ShipInstance[] }[] = [];
  let hulls = 0;
  for (const fleet of fleets) {
    const active = activeShips(fleet);
    if (active.length > 0) stationed.push({ fleet, active });
    hulls += active.length;
  }
  if (hulls === 0) return null;

  /* Dominant owner: fleet with the most active hulls (first wins ties). */
  const dominant = stationed.reduce((a, b) => (b.active.length > a.active.length ? b : a));

  const silhouettes = stationed
    .flatMap((p) => p.active.map((s) => silhouetteSizeFor(s.classId)))
    .sort((a, b) => SIZE_RANK[b] - SIZE_RANK[a])
    .slice(0, 3);

  return {
    hulls,
    ownerId: dominant.fleet.ownerId,
    tone: fleetToneFor(dominant.fleet.ownerId),
    attacking: stationed.some((p) => p.fleet.orders === 'attack'),
    patrolling: stationed.some((p) => p.fleet.orders === 'patrol'),
    silhouettes,
  };
}

/** Fleet-presence badge for one asteroid, or null when none stationed. */
export function fleetBadgeFor(a: AsteroidState): FleetBadge | null {
  return fleetBadgeFromFleets(a.fleets);
}

/**
 * Count of built (non-constructing) Asteroid Engines — mirrors the
 * sim's own radiation rule in tick.ts. 0 → no badge.
 */
export function enginesArmedFor(a: AsteroidState): number {
  return Object.values(a.placedBuildings).filter(
    (b) => b.kind === 'engine' && !b.constructing
  ).length;
}

export interface MerchantDock {
  asteroidId: string;
  /** Number of distinct stock lots the merchant carries. */
  stockCount: number;
}

/**
 * Where the merchant hauler is docked, or null while the merchant is
 * inactive (no fake transit animation). Docks at the home asteroid,
 * falling back to the first helion rock.
 */
export function merchantDockFor(
  asteroids: AsteroidState[],
  market: MarketState
): MerchantDock | null {
  if (!market.merchantActive) return null;
  const home =
    asteroids.find((a) => a.status === 'home') ??
    asteroids.find((a) => a.ownerId === 'helion');
  if (!home) return null;
  return { asteroidId: home.id, stockCount: Object.keys(market.merchantStock).length };
}
