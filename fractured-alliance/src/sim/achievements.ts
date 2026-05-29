export interface Achievement {
  id: string;
  name: string;
  desc: string;
  predicate: (state: any) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-blood', name: 'First Blood', desc: 'Win first match', predicate: (s) => s.tick > 0 && s.asteroids.some((a: any) => a.ownerId === 'helion') },
  { id: 'corporate-raider', name: 'Corporate Raider', desc: 'Economic victory', predicate: (s) => s.treasury > 500000 },
  { id: 'warlord', name: 'Warlord', desc: 'Military victory', predicate: (s) => s.events.some((e: any) => e.text?.includes('destroyed') && e.text?.includes('enemy')) },
  { id: 'diplomat', name: 'Diplomat', desc: 'Diplomatic victory', predicate: (s) => Object.values(s.relations).some((r: any) => r.standing === 'allied') },
  { id: 'mad-scientist', name: 'Mad Scientist', desc: 'Scientific victory', predicate: (s) => s.blueprintsOwned.length >= 10 },
  { id: 'outlaw', name: 'Outlaw', desc: 'Independence victory', predicate: (s) => s.suspicion >= 100 },
  { id: 'paranoid', name: 'Paranoid', desc: 'Survive Federation expedition (90 days)', predicate: (s) => s.tick >= 2700 },
  { id: 'ghost', name: 'Ghost', desc: 'Complete match without being attacked', predicate: (s) => !s.events.some((e: any) => e.text?.includes('approaching')) },
  { id: 'betrayer', name: 'Betrayer', desc: 'Break 3 treaties in one match', predicate: (s) => s.events.filter((e: any) => e.text?.includes('broken')).length >= 3 },
  { id: 'kingmaker', name: 'Kingmaker', desc: 'Liberate 5 colonies', predicate: () => false }, // placeholder
  { id: 'extortionist', name: 'Extortionist', desc: 'Collect blackmail tribute 10 times', predicate: () => false },
  { id: 'asteroid-surfer', name: 'Asteroid Surfer', desc: 'Ram 3 asteroids with engines', predicate: () => false },
];

export function checkAchievements(state: any, unlocked: Set<string>): string[] {
  const newlyUnlocked: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!unlocked.has(ach.id) && ach.predicate(state)) {
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
}
