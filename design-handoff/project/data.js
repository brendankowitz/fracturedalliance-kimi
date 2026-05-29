// data.js — all game data for Fractured Alliance prototype
// Loaded as a plain script; exports onto window.GameData.

window.GameData = (function () {

  // ============= RACES =============
  const RACES = [
    {
      id: 'helion',  short: 'HEL', name: 'Helion Corp',
      title: 'TetraCorp Successor — Player Faction',
      disposition: 'player',
      desc: 'Mining megacorp. Federation member. You report to the Board.',
      ambassador: 'V. Marquez',
      reputation: 100,
      treaties: [],
    },
    {
      id: 'kryll',   short: 'KRY', name: 'Kryll Collective',
      title: 'Principled-Aggressive',
      disposition: 'aggressive',
      desc: 'Moral-grandstanding ideologues. They will accuse you in council, then strike.',
      ambassador: 'Voskres-9',
      reputation: -42,
      treaties: ['nonAggression'],
    },
    {
      id: 'motkaj',  short: 'MOT', name: 'Motkaj Clans',
      title: 'Opportunist-Aggressive',
      disposition: 'aggressive',
      desc: 'Will break a Non-Aggression Pact for the right amount of Korellium.',
      ambassador: 'Khora Tal-Vex',
      reputation: -18,
      treaties: ['nonAggression', 'noCovert'],
    },
    {
      id: 'achar',   short: 'ACH', name: 'Achar Gatherings',
      title: 'Peaceful-Trader',
      disposition: 'peaceful',
      desc: 'Federation-friendly merchants. +30% trade prices. Will not declare war within 30 days of signing.',
      ambassador: 'Cael Estarn',
      reputation: 64,
      treaties: ['nonAggression', 'trade', 'noCovert'],
    },
    {
      id: 'brakkat', short: 'BRK', name: 'Brakkat Dominion',
      title: 'Neutral-Reactive',
      disposition: 'neutral',
      desc: 'Peaceful by default. Doubles retaliation after first insult. Don\u2019t insult them.',
      ambassador: 'Magister Tul',
      reputation: 8,
      treaties: ['nonAggression'],
    },
    {
      id: 'rigal',   short: 'RIG', name: 'Rigal Conclave',
      title: 'Peaceful-Scientist',
      disposition: 'peaceful',
      desc: 'Trades tech-steal intel at half price. Refuses to buy Nexos.',
      ambassador: 'Dr. Yrrn Ses',
      reputation: 38,
      treaties: ['nonAggression', 'trade'],
    },
    {
      id: 'mauna',   short: 'MAU', name: 'Mauna',
      title: 'Hostile-Outlaw',
      disposition: 'hostile',
      desc: 'Not in the Federation. Trading with them is illegal under Article 12. They love Traxium and Nexos.',
      ambassador: '\u2014 unknown \u2014',
      reputation: -80,
      treaties: [],
    },
  ];

  // ============= ORES =============
  const ORES = [
    { id: 'selenium',   name: 'Selenium',   tier: 1, price: 12,    color: 'oklch(0.78 0.04 80)'  },
    { id: 'asteros',    name: 'Asteros',    tier: 1, price: 18,    color: 'oklch(0.74 0.06 60)'  },
    { id: 'barium',     name: 'Barium',     tier: 2, price: 24,    color: 'oklch(0.78 0.08 130)' },
    { id: 'crystalite', name: 'Crystalite', tier: 2, price: 38,    color: 'oklch(0.82 0.12 200)' },
    { id: 'quazinc',    name: 'Quazinc',    tier: 2, price: 52,    color: 'oklch(0.78 0.10 240)' },
    { id: 'bytanium',   name: 'Bytanium',   tier: 3, price: 88,    color: 'oklch(0.74 0.14 280)' },
    { id: 'korellium',  name: 'Korellium',  tier: 3, price: 142,   color: 'oklch(0.78 0.16 30)'  },
    { id: 'dragonium',  name: 'Dragonium',  tier: 3, price: 240,   color: 'oklch(0.76 0.16 340)' },
    { id: 'traxium',    name: 'Traxium',    tier: 4, price: 520,   color: 'oklch(0.74 0.18 70)'  },
    { id: 'nexos',      name: 'Nexos',      tier: 4, price: 980,   color: 'oklch(0.72 0.20 18)'  },
  ];

  // ============= BUILDINGS =============
  const BUILDINGS = [
    { id: 'cpu',         name: 'CPU Core',          glyph: '\u25A0', cat: 'core',    cost: 0,    pwr: -5,  build: 0,  desc: 'Mandatory. One per asteroid. Connects all systems.' },
    { id: 'air',         name: 'Air Processor',     glyph: 'A',  cat: 'life',    cost: 400,  pwr: -4,  build: 3,  desc: 'Critical life support.' },
    { id: 'hydration',   name: 'Hydration Plant',   glyph: 'H',  cat: 'life',    cost: 400,  pwr: -3,  build: 3,  desc: '+30 water/day.' },
    { id: 'hydroponics', name: 'Hydroponics',       glyph: 'F',  cat: 'life',    cost: 600,  pwr: -4,  build: 4,  desc: '+20 food/day.' },
    { id: 'living',      name: 'Living Quarters',   glyph: 'L',  cat: 'pop',     cost: 300,  pwr: -1,  build: 3,  desc: 'Houses +50 pop.' },
    { id: 'resiblock',   name: 'Resiblock',         glyph: 'R',  cat: 'pop',     cost: 900,  pwr: -3,  build: 6,  desc: 'Houses +150 pop. +5 unrest/day.' },
    { id: 'pleasure',    name: 'Pleasure Dome',     glyph: 'P',  cat: 'pop',     cost: 1500, pwr: -5,  build: 8,  desc: '+10 happiness in radius.' },
    { id: 'medical',     name: 'Medical Centre',    glyph: 'M',  cat: 'pop',     cost: 1200, pwr: -3,  build: 6,  desc: '\u221250% disease events.' },
    { id: 'security',    name: 'Security Centre',   glyph: 'S',  cat: 'def',     cost: 1000, pwr: -2,  build: 5,  desc: '+25% spy detection.' },
    { id: 'mine1',       name: 'Mine Mk1',          glyph: '\u25BC', cat: 'mine',    cost: 500,  pwr: -2,  build: 4,  desc: '1.0\u00d7 surface ore extraction.' },
    { id: 'mine2',       name: 'Mine Mk2',          glyph: '\u25BC\u25BC', cat: 'mine', cost: 1400, pwr: -3, build: 7, desc: '2.0\u00d7 ore. Blueprint required.' },
    { id: 'deep',        name: 'Deep Bore',         glyph: '\u25BC*', cat: 'mine', cost: 1200, pwr: -4, build: 6, desc: 'Mid-depth ores.' },
    { id: 'seismic',     name: 'Seismic Penetrator',glyph: '\u2738', cat: 'mine', cost: 3000, pwr: -8, build: 12, desc: 'Traxium / Nexos. Radiation hazard.' },
    { id: 'power1',      name: 'Power Plant',       glyph: '+',  cat: 'power',   cost: 700,  pwr: 10,  build: 5,  desc: 'Standard generator.' },
    { id: 'power2',      name: 'High-Energy Power', glyph: '++', cat: 'power',   cost: 2000, pwr: 30,  build: 9,  desc: 'Blueprint-gated.' },
    { id: 'storage',     name: 'Storage Tower',     glyph: '\u25A1', cat: 'log',  cost: 600, pwr: -1, build: 4, desc: '+500 ore capacity.' },
    { id: 'radfilter',   name: 'Radiation Filter',  glyph: '\u22C8', cat: 'life', cost: 1100, pwr: -2, build: 6, desc: 'Mandatory for Seismic.' },
    { id: 'laser',       name: 'Laser Turret',      glyph: '\u25C6', cat: 'def',  cost: 800,  pwr: -3, build: 5, desc: 'Anti-ship.' },
    { id: 'silo',        name: 'Missile Silo',      glyph: '\u25B2', cat: 'def',  cost: 1500, pwr: -4, build: 8, desc: 'Launches player missiles.' },
    { id: 'shipyard',    name: 'Ship Yard',         glyph: '\u29C8', cat: 'prod', cost: 2500, pwr: -5, build: 10, desc: 'Constructs small hulls.' },
    { id: 'dock',        name: 'Space Dock',        glyph: '\u29C9', cat: 'prod', cost: 6000, pwr: -10, build: 15, desc: 'Capital hulls. Orbital.' },
    { id: 'gravnull',    name: 'Gravity Nullifier', glyph: '\u2206', cat: 'def',  cost: 4000, pwr: -6, build: 12, desc: 'Asteroid-ram counter.' },
    { id: 'engine',      name: 'Asteroid Engine',   glyph: '\u25C0\u25C0', cat: 'prop', cost: 8000, pwr: -12, build: 18, desc: 'Move your asteroid. Or ram theirs.' },
  ];

  // ============= BLUEPRINTS =============
  const BLUEPRINTS = [
    { id: 'mk2mine',    name: 'Mine Mk2',              disc: 'Extraction', tier: 1, cost: 5200,  bought: true,  must: true,  desc: 'Doubles surface ore yield.' },
    { id: 'mk2deep',    name: 'Deep Bore Mk2',         disc: 'Extraction', tier: 2, cost: 14800, bought: true,  must: true,  desc: 'Mid-depth optimisation. Req: Mine Mk2.' },
    { id: 'seismic',    name: 'Seismic Penetrator',    disc: 'Extraction', tier: 2, cost: 22000, bought: true,  must: true,  desc: 'Access Traxium and Nexos.' },
    { id: 'oreteleport',name: 'Ore Teleporter',        disc: 'Logistics',  tier: 3, cost: 48000, bought: false,           desc: 'Inter-asteroid ore routing.' },
    { id: 'hep',        name: 'High-Energy Power',     disc: 'Power',      tier: 2, cost: 18000, bought: true,  must: true,  desc: '3\u00d7 base output.' },
    { id: 'powamp',     name: 'Power Amp',             disc: 'Power',      tier: 1, cost: 6800,  bought: true,  must: true,  desc: 'Compounds with HEP.' },
    { id: 'fusion',     name: 'Fusion Lattice',        disc: 'Power',      tier: 3, cost: 62000, bought: false,           desc: 'Replaces solar dependency.' },
    { id: 'sensor',     name: 'Improved Sensor',       disc: 'Logistics',  tier: 1, cost: 4400,  bought: true,  must: true,  desc: 'Scout range +2 sectors.' },
    { id: 'shield40',   name: 'Shield x40',            disc: 'Defence',    tier: 2, cost: 28000, bought: false,           desc: 'Cap city defence layer.' },
    { id: 'shield50',   name: 'Shield x50',            disc: 'Defence',    tier: 4, cost: 180000,bought: false,  trap: false,desc: 'Endgame defence.' },
    { id: 'photon',     name: 'Photon Cannon',         disc: 'Offence',    tier: 2, cost: 24000, bought: false,           desc: 'Hardpoint upgrade. 2\u00d7 laser damage.' },
    { id: 'plasma',     name: 'Plasma Cannon',         disc: 'Offence',    tier: 3, cost: 72000, bought: false,           desc: '3\u00d7 laser damage.' },
    { id: 'nuke',       name: 'Nuclear Missile',       disc: 'Offence',    tier: 2, cost: 32000, bought: false,           desc: 'Heavy single-strike. Triggers Federation alert.' },
    { id: 'stasis',     name: 'Stasis Missile',        disc: 'Offence',    tier: 3, cost: 56000, bought: false,           desc: 'Freezes target asteroid for 8 days.' },
    { id: 'virus',      name: 'Virus Missile',         disc: 'Offence',    tier: 3, cost: 44000, bought: false,  trap: true, desc: 'Trap-tier: Anti-Virus arms race ends in mutual loss.' },
    { id: 'nexoswar',   name: 'Nexos Warhead',         disc: 'Offence',    tier: 4, cost: 240000,bought: false,           desc: 'Annihilates an asteroid. Federation ostracism.' },
    { id: 'gravnull',   name: 'Gravity Nullifier',     disc: 'Defence',    tier: 3, cost: 36000, bought: false,           desc: 'Stops incoming asteroid rams.' },
    { id: 'engine',     name: 'Asteroid Engine',       disc: 'Offence',    tier: 4, cost: 160000,bought: false,           desc: 'Bolt-on propulsion. Move \u2014 or ram.' },
    { id: 'autonomy',   name: 'Autonomy Manifesto',    disc: 'Logistics',  tier: 4, cost: 200000,bought: false, special: true, desc: 'Enables Declare Independence. Permanent Federation hostility.' },
    { id: 'droids',     name: 'Construction Droids',   disc: 'Logistics',  tier: 2, cost: 16000, bought: false,           desc: '2\u00d7 build speed.' },
    { id: 'satellite',  name: 'Spy Satellite',         disc: 'Logistics',  tier: 2, cost: 12000, bought: true, must: false, desc: 'Reveals enemy grids from orbit.' },
    { id: 'turretopt',  name: 'Turret Optimiser',      disc: 'Defence',    tier: 2, cost: 18800, bought: false,           desc: '+25% turret rate of fire.' },
    { id: 'staticind',  name: 'Static Inducer',        disc: 'Defence',    tier: 3, cost: 42000, bought: false,           desc: 'Disables incoming missiles in radius.' },
    { id: 'antivirus',  name: 'Anti-Virus',            disc: 'Defence',    tier: 2, cost: 14000, bought: false,           desc: 'Hard counter to Virus Missiles.' },
  ];

  // ============= ASTEROIDS (sector belt) =============
  const ASTEROIDS = [
    { id: 'arch-i',     name: 'Arch-I',     ownerId: 'helion',  size: 'L',  x: 26, y: 38, deposits: ['crystalite','barium','quazinc'], pop: 480, status: 'home',    rad: 8,  happiness: 78, threat: 'none' },
    { id: 'arch-ii',    name: 'Arch-II',    ownerId: 'helion',  size: 'M',  x: 34, y: 32, deposits: ['quazinc','barium'], pop: 240, status: 'colony',           rad: 4,  happiness: 71, threat: 'none' },
    { id: 'forge-3',    name: 'Forge-3',    ownerId: 'helion',  size: 'L',  x: 22, y: 56, deposits: ['korellium','bytanium','dragonium'], pop: 380, status: 'colony', rad: 22, happiness: 64, threat: 'engines' },
    { id: 'kepler-7',   name: 'Kepler-7',   ownerId: 'helion',  size: 'S',  x: 14, y: 28, deposits: ['selenium','asteros'], pop: 90, status: 'colony',          rad: 2,  happiness: 88, threat: 'none' },
    { id: 'long-shot',  name: 'Long Shot',  ownerId: 'helion',  size: 'M',  x: 42, y: 60, deposits: ['dragonium','traxium'], pop: 0, status: 'building',         rad: 38, happiness: 50, threat: 'none' },
    { id: 'lattice',    name: 'Lattice',    ownerId: null,      size: 'M',  x: 50, y: 30, deposits: ['quazinc','korellium'], pop: 0, status: 'unclaimed',       rad: 0,  happiness: 0,  threat: 'none' },
    { id: 'salt',       name: 'Salt',       ownerId: null,      size: 'S',  x: 9,  y: 70, deposits: ['selenium'], pop: 0, status: 'unclaimed',                  rad: 0,  happiness: 0,  threat: 'none' },
    { id: 'thresh',     name: 'Thresh',     ownerId: 'achar',   size: 'L',  x: 60, y: 48, deposits: ['crystalite','dragonium'], pop: 410, status: 'foreign',     rad: 6,  happiness: 80, threat: 'none' },
    { id: 'pyre',       name: 'Pyre',       ownerId: 'kryll',   size: 'L',  x: 70, y: 28, deposits: ['barium','korellium'], pop: 360, status: 'foreign',         rad: 12, happiness: 60, threat: 'fleet' },
    { id: 'gallow',     name: 'Gallow',     ownerId: 'kryll',   size: 'M',  x: 78, y: 38, deposits: ['quazinc'], pop: 220, status: 'foreign',                   rad: 8,  happiness: 64, threat: 'ramming' },
    { id: 'mol',        name: 'Mol',        ownerId: 'motkaj',  size: 'M',  x: 82, y: 64, deposits: ['barium','crystalite'], pop: 260, status: 'foreign',         rad: 4,  happiness: 50, threat: 'fleet' },
    { id: 'taproot',    name: 'Taproot',    ownerId: 'rigal',   size: 'L',  x: 64, y: 76, deposits: ['dragonium','bytanium'], pop: 420, status: 'foreign',       rad: 4,  happiness: 84, threat: 'none' },
    { id: 'aspen',      name: 'Aspen',      ownerId: 'brakkat', size: 'M',  x: 46, y: 78, deposits: ['quazinc','barium'], pop: 280, status: 'foreign',           rad: 6,  happiness: 70, threat: 'none' },
    { id: 'nyx',        name: 'Nyx',        ownerId: 'mauna',   size: 'L',  x: 86, y: 12, deposits: ['traxium','nexos'], pop: 320, status: 'hostile',            rad: 56, happiness: 30, threat: 'fleet' },
    { id: 'broken',     name: 'Broken',     ownerId: null,      size: 'XL', x: 38, y: 14, deposits: ['traxium'], pop: 0, status: 'unclaimed',                  rad: 24, happiness: 0, threat: 'none' },
  ];

  // ============= SHIPS =============
  const SHIP_CLASSES = [
    { id: 'scout',      name: 'Scout',           hp: 60,   shield: 0,   speed: 12, dmg: 4,  cost: 800,    glyph: '\u25B8' },
    { id: 'assault',    name: 'Assault Craft',   hp: 140,  shield: 20,  speed: 9,  dmg: 14, cost: 2200,   glyph: '\u25B6' },
    { id: 'eagle',      name: 'Combat Eagle',    hp: 240,  shield: 60,  speed: 8,  dmg: 28, cost: 5800,   glyph: '\u25B6\u25B6' },
    { id: 'battleship', name: 'Fleet Battleship',hp: 920,  shield: 240, speed: 5,  dmg: 88, cost: 18400,  glyph: '\u2588' },
    { id: 'destructor', name: 'Destructor',      hp: 640,  shield: 180, speed: 6,  dmg: 124,cost: 16200,  glyph: '\u25A0' },
    { id: 'terminator', name: 'Terminator',      hp: 1280, shield: 320, speed: 4,  dmg: 180,cost: 32000,  glyph: '\u2588\u2588' },
    { id: 'cruiser',    name: 'Command Cruiser', hp: 1640, shield: 480, speed: 4,  dmg: 220,cost: 48000,  glyph: '\u2588\u2588\u2588' },
  ];

  // ============= AGENTS =============
  const AGENTS = [
    { id: 'mira',    name: 'Mira Vell',          stealth: 82, sab: 71, intel: 88, status: 'idle',        loc: 'Arch-I',  fee: 4200 },
    { id: 'pollux',  name: 'Pollux Ohr',         stealth: 64, sab: 92, intel: 54, status: 'mission',     loc: 'Pyre',    fee: 5400 },
    { id: 'wren',    name: 'Wren Ash',           stealth: 78, sab: 60, intel: 78, status: 'mission',     loc: 'Mol',     fee: 3800 },
    { id: 'cas',     name: 'Cas L\u00e1zaro',    stealth: 91, sab: 48, intel: 84, status: 'cooldown',    loc: 'Arch-I',  fee: 6200 },
    { id: 'borek',   name: 'Borek Tym',          stealth: 56, sab: 88, intel: 50, status: 'idle',        loc: 'Forge-3', fee: 3400 },
    { id: 'nadir',   name: 'Nadir Quill',        stealth: 70, sab: 70, intel: 70, status: 'idle',        loc: 'Kepler-7',fee: 4000 },
    { id: 'sable',   name: 'Sable Korr',         stealth: 88, sab: 64, intel: 80, status: 'captured',    loc: 'Gallow',  fee: 5200 },
    { id: 'iyo',     name: 'Iyo Banno',          stealth: 74, sab: 80, intel: 62, status: 'idle',        loc: 'Arch-II', fee: 4400 },
  ];

  // ============= MERCHANT INVENTORY =============
  const MERCHANT_STOCK = [
    { id: 'medkit',   name: 'Medical Pack',     qty: 14, price: 240,  rare: false, illegal: false },
    { id: 'luxury',   name: 'Luxury Goods',     qty: 8,  price: 1100, rare: false, illegal: false },
    { id: 'tools',    name: 'Specialist Tools', qty: 22, price: 320,  rare: false, illegal: false },
    { id: 'antiv',    name: 'Anti-Virus',       qty: 4,  price: 4800, rare: true,  illegal: false },
    { id: 'satellite',name: 'Spy Satellite',    qty: 2,  price: 2600, rare: true,  illegal: false },
    { id: 'drago',    name: 'Dragonium (rare)', qty: 12, price: 280,  rare: true,  illegal: false },
  ];

  const BLACK_MARKET = [
    { id: 'nexos',     name: 'Nexos (raw)',      qty: 4,  price: 1450, illegal: true, risk: 35 },
    { id: 'manifesto', name: 'Autonomy Manifesto fragment', qty: 1, price: 38000, illegal: true, risk: 88 },
    { id: 'maunaint',  name: 'Mauna Intel',      qty: 1,  price: 8200, illegal: true, risk: 64 },
    { id: 'mole',      name: 'Federation Mole',  qty: 1,  price: 22000, illegal: true, risk: 92 },
  ];

  // ============= LIVE EVENT FEED =============
  const EVENT_FEED = [
    { id: 1, t: 'T+0341.06', kind: 'warn',    text: 'Kryll Collective accuses Helion of \u201cextraction crimes\u201d in council. Standing \u22125.' },
    { id: 2, t: 'T+0340.22', kind: 'signal',  text: 'Trade convoy arrived at Arch-I. 12 inventory lots available.' },
    { id: 3, t: 'T+0339.18', kind: 'crit',    text: 'Asteroid GALLOW detected with active propulsion. Heading: Forge-3. ETA 42 days.' },
    { id: 4, t: 'T+0338.44', kind: 'signal',  text: 'Long Shot construction queue auto-resumed.' },
    { id: 5, t: 'T+0337.02', kind: 'illegal', text: '[REDACTED] willing to broker Mauna shipment. Contact at +12C.' },
    { id: 6, t: 'T+0336.50', kind: 'ally',    text: 'Achar Gatherings signed Trade Agreement.' },
    { id: 7, t: 'T+0335.10', kind: 'warn',    text: 'Forge-3 radiation rising. Install Radiation Filter.' },
  ];

  return {
    RACES, ORES, BUILDINGS, BLUEPRINTS, ASTEROIDS, SHIP_CLASSES, AGENTS,
    MERCHANT_STOCK, BLACK_MARKET, EVENT_FEED,
    byId: (arr, id) => arr.find(x => x.id === id),
  };
})();
