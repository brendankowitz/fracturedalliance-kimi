import type { Fleet, ShipInstance } from './fleet';

export interface CombatResult {
  attackerLosses: ShipInstance[];
  defenderLosses: ShipInstance[];
  log: string[];
}

export function resolveCombat(attacker: Fleet, defender: Fleet): CombatResult {
  const log: string[] = [];
  const attackerLosses: ShipInstance[] = [];
  const defenderLosses: ShipInstance[] = [];

  let aIdx = 0;
  let dIdx = 0;
  let round = 1;

  const aliveAttacker = () => attacker.ships.filter((s) => s.status !== 'destroyed');
  const aliveDefender = () => defender.ships.filter((s) => s.status !== 'destroyed');

  while (aliveAttacker().length > 0 && aliveDefender().length > 0 && round <= 20) {
    const aShips = aliveAttacker();
    const dShips = aliveDefender();

    for (const ship of aShips) {
      const target = dShips[dIdx % dShips.length];
      applyDamage(ship, target, log);
      if (target.status === 'destroyed') {
        defenderLosses.push(target);
      }
      dIdx++;
    }

    for (const ship of dShips) {
      if (ship.status === 'destroyed') continue;
      const target = aShips[aIdx % aShips.length];
      applyDamage(ship, target, log);
      if (target.status === 'destroyed') {
        attackerLosses.push(target);
      }
      aIdx++;
    }

    round++;
  }

  return { attackerLosses, defenderLosses, log };
}

function applyDamage(attacker: ShipInstance, target: ShipInstance, log: string[]) {
  let dmg = attacker.dmg;

  if (target.shield > 0) {
    const shieldAbsorb = Math.min(target.shield, dmg);
    target.shield -= shieldAbsorb;
    dmg -= shieldAbsorb;
    if (shieldAbsorb > 0) {
      log.push(`${attacker.name} hits ${target.name} shield for ${shieldAbsorb}`);
    }
  }

  if (dmg > 0) {
    target.hp -= dmg;
    log.push(`${attacker.name} deals ${dmg} hull damage to ${target.name}`);
  }

  if (target.hp <= 0) {
    target.hp = 0;
    target.status = 'destroyed';
    log.push(`${target.name} destroyed!`);
  }
}
