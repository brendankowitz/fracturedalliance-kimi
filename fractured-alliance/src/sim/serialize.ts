import type { WorldState } from './types';

const SCHEMA_VERSION = 1;

export interface SaveData {
  version: number;
  world: WorldState;
  name: string;
  day: number;
  verdict: string | null;
  stamp: string;
}

export function serializeWorld(world: WorldState, name: string, verdict: string | null = null): string {
  const data: SaveData = {
    version: SCHEMA_VERSION,
    world,
    name,
    day: Math.floor(world.tick / 30),
    verdict,
    stamp: new Date().toISOString(),
  };
  return JSON.stringify(data);
}

export function deserializeWorld(json: string): { success: boolean; data?: SaveData; error?: string } {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.world || !Array.isArray(parsed.world.asteroids) || typeof parsed.world.tick !== 'number') {
      return { success: false, error: 'Save file missing required fields' };
    }
    if (!parsed.version || parsed.version > SCHEMA_VERSION || parsed.version < 1) {
      return { success: false, error: 'Unsupported save version' };
    }
    return { success: true, data: parsed };
  } catch (e) {
    return { success: false, error: 'Corrupted save file' };
  }
}
