export type MissionType = 'stealTech' | 'sabotage' | 'infiltrate' | 'blackmail' | 'liberate';

export interface MissionResult {
  success: boolean;
  message: string;
  suspicionGain: number;
  creditsGain: number;
  techStolen?: string;
}

export function resolveMission(
  agentStealth: number,
  agentSab: number,
  agentIntel: number,
  mission: MissionType,
  targetSecurity: number, // 0-100, higher = harder
): MissionResult {
  let roll = Math.random() * 100;
  let threshold = targetSecurity;

  switch (mission) {
    case 'stealTech':
      threshold -= agentIntel * 0.3;
      break;
    case 'sabotage':
      threshold -= agentSab * 0.3;
      break;
    case 'infiltrate':
      threshold -= agentStealth * 0.3;
      break;
    case 'blackmail':
      threshold -= agentIntel * 0.2 + agentStealth * 0.1;
      break;
    case 'liberate':
      threshold -= agentSab * 0.2 + agentStealth * 0.1;
      break;
  }

  const success = roll > threshold;

  if (success) {
    return {
      success: true,
      message: `${mission} succeeded`,
      suspicionGain: 5,
      creditsGain: mission === 'blackmail' ? 2000 : 0,
      techStolen: mission === 'stealTech' ? 'random-tech' : undefined,
    };
  } else {
    return {
      success: false,
      message: `${mission} failed — agent compromised`,
      suspicionGain: 15,
      creditsGain: 0,
    };
  }
}
