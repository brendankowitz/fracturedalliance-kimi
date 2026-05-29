import { BuildingGlyph } from './BuildingGlyph';
import { ShipGlyph } from './ShipGlyph';
import { MissileGlyph } from './MissileGlyph';

export function BlueprintSchematic({ bpId, width = 280, height = 200 }: { bpId: string; width?: number; height?: number }) {
  // Decide which body to draw
  let body: React.ReactNode = null;
  let label = '';

  // Map blueprint ids to bodies
  const map: Record<string, { building?: string; ship?: string; missile?: string }> = {
    mk2mine: { building: 'mine2' },
    mk2deep: { building: 'deep' },
    seismic: { building: 'seismic' },
    hep:     { building: 'power2' },
    powamp:  { building: 'power1' },
    sensor:  { building: 'security' },
    fusion:  { building: 'power2' },
    shield40:{ building: 'gravnull' },
    shield50:{ building: 'gravnull' },
    photon:  { ship: 'eagle' },
    plasma:  { ship: 'battleship' },
    nuke:    { missile: 'nuke' },
    stasis:  { missile: 'stasis' },
    virus:   { missile: 'virus' },
    nexoswar:{ missile: 'nexos' },
    gravnull:{ building: 'gravnull' },
    engine:  { building: 'engine' },
    droids:  { building: 'shipyard' },
    satellite:{ building: 'security' },
    turretopt:{ building: 'laser' },
    staticind:{ building: 'silo' },
    antivirus:{ missile: 'virus' },
    autonomy:{ building: 'cpu' },
    oreteleport:{ building: 'storage' },
  };

  if (bpId && map[bpId]) {
    const m = map[bpId];
    if (m.building) { body = <g transform="translate(80, 56) scale(3.5)"><BuildingGlyph id={m.building} size={24} /></g>; label = m.building.toUpperCase(); }
    if (m.ship)     { body = <g transform="translate(76, 50) scale(3)"><ShipGlyph kind={m.ship} size={32} /></g>; label = m.ship.toUpperCase(); }
    if (m.missile)  { body = <g transform="translate(94, 50) scale(3.5)"><MissileGlyph kind={m.missile} size={24} /></g>; label = m.missile.toUpperCase(); }
  }

  // Ticks along the edges
  const ticks: number[] = [];
  for (let i = 0; i < 14; i++) ticks.push(i * 20);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet"
         style={{ display: 'block', color: 'var(--warn)' }}
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="bp-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="oklch(0.28 0.014 240)" strokeWidth="0.4" />
        </pattern>
        <pattern id="bp-major" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.34 0.018 240)" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="oklch(0.16 0.012 240)" />
      <rect width={width} height={height} fill="url(#bp-grid)" />
      <rect width={width} height={height} fill="url(#bp-major)" />

      {/* Crosshair */}
      <line x1={width/2} y1="0" x2={width/2} y2={height} stroke="oklch(0.40 0.018 240)" strokeWidth="0.4" strokeDasharray="2,2" />
      <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="oklch(0.40 0.018 240)" strokeWidth="0.4" strokeDasharray="2,2" />

      {/* Body */}
      {body}

      {/* Callouts — dimension marks */}
      <line x1="30" y1="40" x2="50" y2="40" stroke="currentColor" strokeWidth="0.6" />
      <line x1="30" y1="38" x2="30" y2="42" stroke="currentColor" strokeWidth="0.6" />
      <line x1="50" y1="38" x2="50" y2="42" stroke="currentColor" strokeWidth="0.6" />
      <text x="40" y="35" fontFamily="JetBrains Mono" fontSize="6" fill="currentColor" textAnchor="middle">A.20m</text>

      <line x1="230" y1="60" x2="230" y2="120" stroke="currentColor" strokeWidth="0.6" />
      <line x1="228" y1="60" x2="232" y2="60" stroke="currentColor" strokeWidth="0.6" />
      <line x1="228" y1="120" x2="232" y2="120" stroke="currentColor" strokeWidth="0.6" />
      <text x="244" y="92" fontFamily="JetBrains Mono" fontSize="6" fill="currentColor">B.84m</text>

      {/* Border + label */}
      <rect x="0.5" y="0.5" width={width - 1} height={height - 1} fill="none" stroke="var(--warn)" strokeWidth="0.6" />
      <rect x="6" y="6" width={width - 12} height="14" fill="oklch(0.18 0.012 240)" stroke="var(--warn)" strokeWidth="0.4" />
      <text x="12" y="16" fontFamily="JetBrains Mono" fontSize="7" fill="var(--warn)" letterSpacing="2">SCHEMATIC // {label}</text>
      <text x={width - 12} y="16" fontFamily="JetBrains Mono" fontSize="7" fill="oklch(0.55 0.012 240)" textAnchor="end">REV-4</text>

      <rect x="6" y={height - 20} width={width - 12} height="14" fill="oklch(0.18 0.012 240)" stroke="var(--warn)" strokeWidth="0.4" />
      <text x="12" y={height - 10} fontFamily="JetBrains Mono" fontSize="6" fill="oklch(0.66 0.012 240)">HELION SCI-TEK · CLEAR — 7</text>
      <text x={width - 12} y={height - 10} fontFamily="JetBrains Mono" fontSize="6" fill="oklch(0.55 0.012 240)" textAnchor="end">SHEET 1/3</text>
    </svg>
  );
}
