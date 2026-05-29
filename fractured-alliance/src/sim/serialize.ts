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

export function serializeWorld(world: WorldState, name: string): string {
  const data: SaveData = {
    version: SCHEMA_VERSION,
    world,
    name,
    day: Math.floor(world.tick / 30),
    verdict: null,
    stamp: new Date().toISOString(),
  };
  return JSON.stringify(data);
}

export function deserializeWorld(json: string): { success: boolean; data?: SaveData; error?: string } {
  try {
    const parsed = JSON.parse(json);
    if (!parsed.version || parsed.version > SCHEMA_VERSION) {
      return { success: false, error: 'Unsupported save version' };
    }
    return { success: true, data: parsed };
  } catch (e) {
    return { success: false, error: 'Corrupted save file' };
  }
}
