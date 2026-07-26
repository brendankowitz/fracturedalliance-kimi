// store.js — Fractured Alliance simulation engine.
// PLAIN JavaScript (no JSX / Babel). Loaded with a normal <script> tag BEFORE
// the Babel-compiled JSX components, AFTER data.js.
//
// Everything lives on window.GameStore:
//   state            — all live game state (mutated in place)
//   subscribe(fn)    — fn() called on every notify
//   unsubscribe(fn)
//   dispatch(action) — { type, payload }
//   advanceTick(days)— sim step, called from app.jsx setInterval
//
// Re-render strategy: state is mutated in place; subscribers are notified after
// every change. app.jsx bumps a version counter on notify so React always
// re-renders (it never compares state object identity).

(function () {
  'use strict';

  // ---- helpers -------------------------------------------------------------

  var ORE_IDS = ['selenium', 'asteros', 'barium', 'crystalite', 'quazinc',
    'bytanium', 'korellium', 'dragonium', 'traxium', 'nexos'];

  function emptyOres() {
    var o = {};
    for (var i = 0; i < ORE_IDS.length; i++) o[ORE_IDS[i]] = 0;
    return o;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // Mid-tier ores that Deep Bore can reach (used by recompute).
  var MID_TIER_ORES = { barium: 1, crystalite: 1, quazinc: 1, bytanium: 1 };

  // ---- initial state -------------------------------------------------------

  var state = {
    day: 1,
    speed: 1,
    paused: false,
    credits: 1200,
    totalEarned: 0,
    federationStanding: 62,
    suspicion: 0,
    incomePerDay: 0,

    scouts: [],

    asteroids: {
      'arch-i': {
        id: 'arch-i', name: 'Arch-I', ownerId: 'helion', size: 'L',
        x: 26, y: 38, status: 'home', threat: 'none',
        rad: 8, happiness: 70,
        revealed: true, scouted: true,
        pop: 20, maxPop: 50,
        airPct: 60, waterPct: 60, foodPct: 40,
        powerSurplus: 1,
        airPerDay: 30, waterPerDay: 30, foodPerDay: 0,
        powerGenerated: 10, powerConsumed: 9,
        ores: { selenium: 0, asteros: 0, barium: 0, crystalite: 0, quazinc: 0, bytanium: 0, korellium: 0, dragonium: 0, traxium: 0, nexos: 0 },
        maxOreStorage: 1000,
        oreRates: { crystalite: 1 },
        deposits: { crystalite: 800, barium: 600, quazinc: 400 },
        grid: {
          '4,4': 'cpu',
          '3,4': 'air',
          '5,4': 'hydration',
          '3,3': 'power1',
          '4,3': 'mine1'
        },
        buildQueue: []
      },
      'arch-ii': {
        id: 'arch-ii', name: 'Arch-II', ownerId: null, size: 'M',
        x: 34, y: 32, status: 'unclaimed', threat: 'none', rad: 4, happiness: 0,
        revealed: true, scouted: false,
        pop: 0, maxPop: 0,
        airPct: 0, waterPct: 0, foodPct: 0,
        powerSurplus: 0, powerGenerated: 0, powerConsumed: 0,
        airPerDay: 0, waterPerDay: 0, foodPerDay: 0,
        ores: {}, maxOreStorage: 0, oreRates: {},
        deposits: { quazinc: 600, barium: 300 },
        grid: {}, buildQueue: []
      },
      'forge-3': {
        id: 'forge-3', name: 'Forge-3', ownerId: null, size: 'L',
        x: 22, y: 56, status: 'unclaimed', threat: 'none', rad: 22, happiness: 0,
        revealed: false, scouted: false,
        pop: 0, maxPop: 0,
        airPct: 0, waterPct: 0, foodPct: 0,
        powerSurplus: 0, powerGenerated: 0, powerConsumed: 0,
        airPerDay: 0, waterPerDay: 0, foodPerDay: 0,
        ores: {}, maxOreStorage: 0, oreRates: {},
        deposits: { korellium: 500, bytanium: 700, dragonium: 200 },
        grid: {}, buildQueue: []
      },
      'kepler-7': {
        id: 'kepler-7', name: 'Kepler-7', ownerId: null, size: 'S',
        x: 14, y: 28, status: 'unclaimed', threat: 'none', rad: 2, happiness: 0,
        revealed: true, scouted: false,
        pop: 0, maxPop: 0,
        airPct: 0, waterPct: 0, foodPct: 0,
        powerSurplus: 0, powerGenerated: 0, powerConsumed: 0,
        airPerDay: 0, waterPerDay: 0, foodPerDay: 0,
        ores: {}, maxOreStorage: 0, oreRates: {},
        deposits: { selenium: 400, asteros: 250 },
        grid: {}, buildQueue: []
      },
      'long-shot': {
        id: 'long-shot', name: 'Long Shot', ownerId: null, size: 'M',
        x: 42, y: 60, status: 'unclaimed', threat: 'none', rad: 38, happiness: 0,
        revealed: false, scouted: false,
        pop: 0, maxPop: 0,
        airPct: 0, waterPct: 0, foodPct: 0,
        powerSurplus: 0, powerGenerated: 0, powerConsumed: 0,
        airPerDay: 0, waterPerDay: 0, foodPerDay: 0,
        ores: {}, maxOreStorage: 0, oreRates: {},
        deposits: { dragonium: 300, traxium: 150 },
        grid: {}, buildQueue: []
      },
      'lattice': {
        id: 'lattice', name: 'Lattice', ownerId: null, size: 'M',
        x: 50, y: 30, status: 'unclaimed', threat: 'none', rad: 0, happiness: 0,
        revealed: true, scouted: false,
        pop: 0, maxPop: 0, airPct: 0, waterPct: 0, foodPct: 0,
        powerSurplus: 0, powerGenerated: 0, powerConsumed: 0,
        airPerDay: 0, waterPerDay: 0, foodPerDay: 0,
        ores: {}, maxOreStorage: 0, oreRates: {},
        deposits: { quazinc: 700, korellium: 400 },
        grid: {}, buildQueue: []
      },
      'salt': {
        id: 'salt', name: 'Salt', ownerId: null, size: 'S',
        x: 9, y: 70, status: 'unclaimed', threat: 'none', rad: 0, happiness: 0,
        revealed: true, scouted: false,
        pop: 0, maxPop: 0, airPct: 0, waterPct: 0, foodPct: 0,
        powerSurplus: 0, powerGenerated: 0, powerConsumed: 0,
        airPerDay: 0, waterPerDay: 0, foodPerDay: 0,
        ores: {}, maxOreStorage: 0, oreRates: {},
        deposits: { selenium: 300 },
        grid: {}, buildQueue: []
      },
      'broken': {
        id: 'broken', name: 'Broken', ownerId: null, size: 'XL',
        x: 38, y: 14, status: 'unclaimed', threat: 'none', rad: 24, happiness: 0,
        revealed: false, scouted: false,
        pop: 0, maxPop: 0, airPct: 0, waterPct: 0, foodPct: 0,
        powerSurplus: 0, powerGenerated: 0, powerConsumed: 0,
        ores: {}, maxOreStorage: 0, oreRates: {},
        deposits: { traxium: 600 },
        grid: {}, buildQueue: []
      },
      'thresh': { id: 'thresh', name: 'Thresh', ownerId: 'achar', size: 'L', x: 60, y: 48, status: 'foreign', threat: 'none', rad: 6, happiness: 80, revealed: false, scouted: false, pop: 410, maxPop: 500, ores: {}, maxOreStorage: 0, oreRates: {}, deposits: {}, grid: {}, buildQueue: [], airPct: 80, waterPct: 80, foodPct: 80, powerSurplus: 10, powerGenerated: 0, powerConsumed: 0, airPerDay: 0, waterPerDay: 0, foodPerDay: 0 },
      'pyre': { id: 'pyre', name: 'Pyre', ownerId: 'kryll', size: 'L', x: 70, y: 28, status: 'foreign', threat: 'fleet', rad: 12, happiness: 60, revealed: false, scouted: false, pop: 360, maxPop: 450, ores: {}, maxOreStorage: 0, oreRates: {}, deposits: {}, grid: {}, buildQueue: [], airPct: 60, waterPct: 60, foodPct: 60, powerSurplus: 8, powerGenerated: 0, powerConsumed: 0, airPerDay: 0, waterPerDay: 0, foodPerDay: 0 },
      'gallow': { id: 'gallow', name: 'Gallow', ownerId: 'kryll', size: 'M', x: 78, y: 38, status: 'foreign', threat: 'none', rad: 8, happiness: 64, revealed: false, scouted: false, pop: 220, maxPop: 280, ores: {}, maxOreStorage: 0, oreRates: {}, deposits: {}, grid: {}, buildQueue: [], airPct: 64, waterPct: 64, foodPct: 64, powerSurplus: 5, powerGenerated: 0, powerConsumed: 0, airPerDay: 0, waterPerDay: 0, foodPerDay: 0, rammingEtaDays: null },
      'mol': { id: 'mol', name: 'Mol', ownerId: 'motkaj', size: 'M', x: 82, y: 64, status: 'foreign', threat: 'fleet', rad: 4, happiness: 50, revealed: false, scouted: false, pop: 260, maxPop: 320, ores: {}, maxOreStorage: 0, oreRates: {}, deposits: {}, grid: {}, buildQueue: [], airPct: 50, waterPct: 50, foodPct: 50, powerSurplus: 6, powerGenerated: 0, powerConsumed: 0, airPerDay: 0, waterPerDay: 0, foodPerDay: 0 },
      'taproot': { id: 'taproot', name: 'Taproot', ownerId: 'rigal', size: 'L', x: 64, y: 76, status: 'foreign', threat: 'none', rad: 4, happiness: 84, revealed: false, scouted: false, pop: 420, maxPop: 520, ores: {}, maxOreStorage: 0, oreRates: {}, deposits: {}, grid: {}, buildQueue: [], airPct: 84, waterPct: 84, foodPct: 84, powerSurplus: 12, powerGenerated: 0, powerConsumed: 0, airPerDay: 0, waterPerDay: 0, foodPerDay: 0 },
      'aspen': { id: 'aspen', name: 'Aspen', ownerId: 'brakkat', size: 'M', x: 46, y: 78, status: 'foreign', threat: 'none', rad: 6, happiness: 70, revealed: false, scouted: false, pop: 280, maxPop: 350, ores: {}, maxOreStorage: 0, oreRates: {}, deposits: {}, grid: {}, buildQueue: [], airPct: 70, waterPct: 70, foodPct: 70, powerSurplus: 7, powerGenerated: 0, powerConsumed: 0, airPerDay: 0, waterPerDay: 0, foodPerDay: 0 },
      'nyx': { id: 'nyx', name: 'Nyx', ownerId: 'mauna', size: 'L', x: 86, y: 12, status: 'hostile', threat: 'fleet', rad: 56, happiness: 30, revealed: false, scouted: false, pop: 320, maxPop: 400, ores: {}, maxOreStorage: 0, oreRates: {}, deposits: {}, grid: {}, buildQueue: [], airPct: 30, waterPct: 30, foodPct: 30, powerSurplus: 15, powerGenerated: 0, powerConsumed: 0, airPerDay: 0, waterPerDay: 0, foodPerDay: 0 }
    },

    blueprints: {
      'mk2mine': { owned: true, cost: 5200 },
      'mk2deep': { owned: true, cost: 14800 },
      'seismic': { owned: true, cost: 22000 },
      'oreteleport': { owned: false, cost: 48000 },
      'hep': { owned: true, cost: 18000 },
      'powamp': { owned: true, cost: 6800 },
      'fusion': { owned: false, cost: 62000 },
      'sensor': { owned: true, cost: 4400 },
      'shield40': { owned: false, cost: 28000 },
      'shield50': { owned: false, cost: 180000 },
      'photon': { owned: false, cost: 24000 },
      'plasma': { owned: false, cost: 72000 },
      'nuke': { owned: false, cost: 32000 },
      'stasis': { owned: false, cost: 56000 },
      'virus': { owned: false, cost: 44000 },
      'nexoswar': { owned: false, cost: 240000 },
      'gravnull': { owned: false, cost: 36000 },
      'engine': { owned: false, cost: 160000 },
      'autonomy': { owned: false, cost: 200000 },
      'droids': { owned: false, cost: 16000 },
      'satellite': { owned: true, cost: 12000 },
      'turretopt': { owned: false, cost: 18800 },
      'staticind': { owned: false, cost: 42000 },
      'antivirus': { owned: false, cost: 14000 }
    },

    merchantDocked: false,
    merchantDockAsteroid: 'arch-i',
    merchantDaysLeft: 8,
    merchantStock: [
      { id: 'medkit', name: 'Medical Pack', qty: 14, price: 240, rare: false, illegal: false },
      { id: 'luxury', name: 'Luxury Goods', qty: 8, price: 1100, rare: false, illegal: false },
      { id: 'tools', name: 'Specialist Tools', qty: 22, price: 320, rare: false, illegal: false },
      { id: 'antiv', name: 'Anti-Virus', qty: 4, price: 4800, rare: true, illegal: false },
      { id: 'satellite', name: 'Spy Satellite', qty: 2, price: 2600, rare: true, illegal: false },
      { id: 'drago', name: 'Dragonium (rare)', qty: 12, price: 280, rare: true, illegal: false }
    ],
    blackMarketStock: [
      { id: 'nexos', name: 'Nexos (raw)', qty: 4, price: 1450, illegal: true, risk: 35 },
      { id: 'manifesto', name: 'Autonomy Manifesto fragment', qty: 1, price: 38000, illegal: true, risk: 88 },
      { id: 'maunaint', name: 'Mauna Intel', qty: 1, price: 8200, illegal: true, risk: 64 },
      { id: 'mole', name: 'Federation Mole', qty: 1, price: 22000, illegal: true, risk: 92 }
    ],

    events: [
      { id: 1, day: 1, kind: 'signal', text: 'Helion Corp operations online. Home base Arch-I established. Launch a scout to chart the belt.' }
    ],

    gameOver: false,
    victory: null,

    corporateStreakDays: 0,
    totalOreValueSold: 0,
    totalEarnedAllTime: 0,

    gallowEtaDays: null,
    gallowTriggered: false,

    marketPrices: {
      selenium: 12, asteros: 18, barium: 24, crystalite: 38, quazinc: 52,
      bytanium: 88, korellium: 142, dragonium: 240, traxium: 520, nexos: 980
    },

    selectedAsteroidId: 'arch-i',
    colonyViewBuildingSelected: 'mine1'
  };

  // ---- subscription --------------------------------------------------------

  var subscribers = [];
  var nextEventId = 100;

  function subscribe(fn) { if (subscribers.indexOf(fn) === -1) subscribers.push(fn); }
  function unsubscribe(fn) {
    var i = subscribers.indexOf(fn);
    if (i !== -1) subscribers.splice(i, 1);
  }
  function notify() {
    for (var i = 0; i < subscribers.length; i++) {
      try { subscribers[i](); } catch (e) { /* one bad subscriber must not stop the rest */ }
    }
  }

  function pushEvent(kind, text) {
    state.events.unshift({ id: nextEventId++, day: Math.floor(state.day), kind: kind, text: text });
    if (state.events.length > 20) state.events.length = 20;
  }

  // Euclidean distance between two asteroids on the sector grid (x,y in 0..100).
  function asteroidDistance(id1, id2) {
    var a1 = state.asteroids[id1];
    var a2 = state.asteroids[id2];
    if (!a1 || !a2) return Infinity;
    var dx = a1.x - a2.x;
    var dy = a1.y - a2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ---- derived: building effects ------------------------------------------

  // Recompute an asteroid's resource production + capacity + power from its
  // completed grid. Called whenever a building completes or is added.
  // recomputeAsteroid recomputes the unambiguous derived values (life-support
  // production, population/ore capacity, mine extraction rates) from the grid.
  //
  // Power is handled differently: the spec gives each asteroid an authored
  // powerGenerated/powerConsumed baseline that does NOT equal a naive sum of
  // every building's pwr (the authored grids run a deficit under raw BUILDINGS
  // numbers). To keep authored colonies stable while still reacting to new
  // construction, power is adjusted incrementally via applyPowerDelta() when a
  // building actually completes — not re-summed here.
  function recomputeAsteroid(a) {
    var airPerDay = 0, waterPerDay = 0, foodPerDay = 0;
    var maxPop = 0, maxOreStorage = 0;
    var mineMk1 = 0, mineMk2 = 0, deepBore = 0;

    var keys = Object.keys(a.grid);
    for (var k = 0; k < keys.length; k++) {
      var kind = a.grid[keys[k]];
      switch (kind) {
        case 'air': airPerDay += 30; break;
        case 'hydration': waterPerDay += 30; break;
        case 'hydroponics': foodPerDay += 20; break;
        case 'living': maxPop += 50; break;
        case 'resiblock': maxPop += 150; break;
        case 'mine1': mineMk1 += 1; break;
        case 'mine2': mineMk2 += 1; break;
        case 'deep': deepBore += 1; break;
        case 'storage': maxOreStorage += 500; break;
        default: break;
      }
    }

    a.airPerDay = airPerDay;
    a.waterPerDay = waterPerDay;
    a.foodPerDay = foodPerDay;
    a.maxPop = maxPop;
    a.maxOreStorage = maxOreStorage;

    // Recompute ore extraction rates from deposits + mine counts.
    // Surface mines (mk1/mk2) extract every deposit ore; deep bores add to
    // mid-tier ores only.
    var rates = {};
    var depKeys = Object.keys(a.deposits || {});
    for (var d = 0; d < depKeys.length; d++) {
      var ore = depKeys[d];
      if (a.deposits[ore] <= 0) continue;
      var r = mineMk1 * 1 + mineMk2 * 2;
      if (MID_TIER_ORES[ore]) r += deepBore * 1;
      if (r > 0) rates[ore] = r;
    }
    a.oreRates = rates;
  }

  // Adjust an asteroid's power books by one building's pwr value. Positive pwr
  // is generation, negative is consumption. Keeps the authored baseline intact.
  function applyPowerDelta(a, kind) {
    var BUILD = (window.GameData && window.GameData.BUILDINGS) || [];
    var pwr = 0;
    for (var i = 0; i < BUILD.length; i++) if (BUILD[i].id === kind) { pwr = BUILD[i].pwr || 0; break; }
    if (pwr >= 0) a.powerGenerated += pwr;
    else a.powerConsumed += -pwr;
    a.powerSurplus = a.powerGenerated - a.powerConsumed;
  }

  // ---- simulation tick -----------------------------------------------------

  function isHelion(a) { return a.ownerId === 'helion'; }

  function happinessFor(a) {
    var base = a.airPct * 0.3 + a.waterPct * 0.25 + a.foodPct * 0.25 + (a.powerSurplus >= 0 ? 20 : 0);
    var h = Math.min(100, base) - (a.rad > 20 ? (a.rad - 20) * 0.5 : 0);
    return clamp(h, 0, 100);
  }

  // Drift a resource pct toward 100 when producing, toward 0 when not.
  function driftPct(pct, perDay, days) {
    var target = perDay > 0 ? 100 : 0;
    var rate = (perDay > 0 ? Math.min(perDay, 30) : 12) * 0.5; // pct points/day
    if (pct < target) return Math.min(target, pct + rate * days);
    if (pct > target) return Math.max(target, pct - rate * days);
    return pct;
  }

  function tickAsteroid(a, days) {
    // 1. Build queue: advance the first item only.
    if (a.buildQueue.length > 0) {
      var item = a.buildQueue[0];
      item.progress += days / item.totalDays;
      if (item.progress >= 1) {
        a.grid[item.cell] = item.kind;
        a.buildQueue.shift();
        recomputeAsteroid(a);
        applyPowerDelta(a, item.kind);
        if (a.status === 'building' && a.buildQueue.length === 0) a.status = 'colony';
        pushEvent('signal', a.name + ': ' + (item.label || item.kind) + ' construction complete at [' + item.cell + '].');
      }
    }

    // 2. Ore production from mines; deplete deposits.
    var rk = Object.keys(a.oreRates);
    for (var i = 0; i < rk.length; i++) {
      var ore = rk[i];
      var rate = a.oreRates[ore];
      if (!rate) continue;
      var produced = rate * days;
      if (a.deposits[ore] != null) {
        produced = Math.min(produced, a.deposits[ore]);
        a.deposits[ore] = Math.max(0, a.deposits[ore] - produced);
      }
      a.ores[ore] = Math.min(a.maxOreStorage, (a.ores[ore] || 0) + produced);
    }
    // Clamp every stored ore to capacity (capacity may have shrunk).
    var ok = Object.keys(a.ores);
    for (var j = 0; j < ok.length; j++) {
      if (a.ores[ok[j]] > a.maxOreStorage) a.ores[ok[j]] = a.maxOreStorage;
    }

    // 3. Resource drift + happiness.
    a.airPct = driftPct(a.airPct, a.airPerDay, days);
    a.waterPct = driftPct(a.waterPct, a.waterPerDay, days);
    a.foodPct = driftPct(a.foodPct, a.foodPerDay, days);

    // Population grows slowly toward maxPop when life support is healthy.
    if (a.maxPop > 0 && a.pop < a.maxPop && a.airPct > 30 && a.foodPct > 30) {
      a.pop = Math.min(a.maxPop, a.pop + a.maxPop * 0.01 * days);
    }

    a.happiness = happinessFor(a);
  }

  // Auto-sell cheap ores (selenium, asteros) to the Federal Transporter each
  // tick; returns credits earned this step.
  var AUTO_SELL = ['selenium', 'asteros'];
  function autoSellIncome(a, days) {
    var income = 0;
    for (var i = 0; i < AUTO_SELL.length; i++) {
      var ore = AUTO_SELL[i];
      var have = a.ores[ore] || 0;
      if (have <= 0) continue;
      // Sell at a modest fraction per day so stock visibly trickles out.
      var sell = Math.min(have, (a.oreRates[ore] || have) * days);
      var price = (state.marketPrices[ore] || 0) * 0.7; // federal 0.7x
      var gain = sell * price;
      a.ores[ore] = have - sell;
      income += gain;
      state.totalOreValueSold += sell * (state.marketPrices[ore] || 0);
    }
    return income;
  }

  function fluctuateMarket(days) {
    var keys = Object.keys(state.marketPrices);
    for (var i = 0; i < keys.length; i++) {
      var base = state.marketPrices[keys[i]];
      // +-1.5% random walk, clamped to +-25% of nominal isn't tracked; keep gentle.
      var delta = base * (Math.random() - 0.5) * 0.03 * days;
      state.marketPrices[keys[i]] = Math.max(1, Math.round((base + delta) * 100) / 100);
    }
  }

  var randomEventCooldown = 30; // sim-days until next random event

  function maybeRandomEvent(days) {
    randomEventCooldown -= days;
    if (randomEventCooldown > 0) return;
    randomEventCooldown = 28 + Math.random() * 12;
    var roll = Math.random();
    if (roll < 0.34) {
      state.federationStanding = clamp(state.federationStanding - 5, 0, 100);
      pushEvent('warn', 'Kryll Collective accuses Helion of extraction crimes in council. Standing -5.');
    } else if (roll < 0.67) {
      state.merchantDocked = true;
      state.merchantDaysLeft = 8;
      pushEvent('signal', 'Independent trade convoy docked at ' + (state.asteroids[state.merchantDockAsteroid] || {}).name + '. New inventory available.');
    } else {
      state.federationStanding = clamp(state.federationStanding + 3, 0, 100);
      pushEvent('ally', 'Achar Gatherings reaffirm trade agreement. Standing +3.');
    }
  }

  // Gallow ramming threat: a late-game hazard. Around day 60-80, if it hasn't
  // already fired, Gallow lights its engines and aims for Forge-3.
  function maybeTriggerGallow(days) {
    if (state.gallowTriggered || typeof state.gallowEtaDays === 'number') return;
    if (state.day < 60) return;
    // Roll once per tick after day 60; force it by day 80.
    var force = state.day >= 80;
    if (!force && Math.random() > 0.04 * days * 30) return;
    state.gallowTriggered = true;
    var gallow = state.asteroids.gallow;
    var forge = state.asteroids['forge-3'];
    state.gallowEtaDays = 42;
    if (gallow) {
      gallow.revealed = true;
      gallow.threat = 'ramming';
      gallow.rammingEtaDays = 42;
    }
    if (forge) { forge.revealed = true; forge.threat = 'engines'; }
    pushEvent('crit', 'Asteroid GALLOW detected with active propulsion. Heading: Forge-3. ETA 42 days.');
  }

  function checkVictory() {
    if (state.victory) return;

    // Scientific: all blueprints owned.
    var bp = state.blueprints;
    var bpKeys = Object.keys(bp);
    var allOwned = true;
    for (var i = 0; i < bpKeys.length; i++) if (!bp[bpKeys[i]].owned) { allOwned = false; break; }
    if (allOwned) {
      state.victory = 'scientific'; state.gameOver = true;
      pushEvent('ally', 'SCIENTIFIC VICTORY — full blueprint vault acquired.');
      return;
    }

    // Military: own >= 60% of all asteroids.
    var ak = Object.keys(state.asteroids);
    var helion = 0;
    for (var m = 0; m < ak.length; m++) if (state.asteroids[ak[m]].ownerId === 'helion') helion++;
    if (helion / ak.length >= 0.6) {
      state.victory = 'military'; state.gameOver = true;
      pushEvent('ally', 'MILITARY VICTORY — Helion controls 60% of the belt.');
      return;
    }

    // Corporate: 10M ore value sold AND 60 days of Fed Standing >= 75.
    if (state.totalOreValueSold >= 10000000 && state.corporateStreakDays >= 60) {
      state.victory = 'corporate'; state.gameOver = true;
      pushEvent('ally', 'CORPORATE VICTORY — the Board is pleased.');
    }
  }

  // Advance every in-flight scout. When one arrives, scout+reveal its target and
  // reveal (without scouting) any asteroid within distance 15 of that target.
  function tickScouts(days) {
    if (!state.scouts || state.scouts.length === 0) return;
    var still = [];
    for (var i = 0; i < state.scouts.length; i++) {
      var sc = state.scouts[i];
      sc.daysRemaining -= days;
      if (sc.daysRemaining > 0) { still.push(sc); continue; }

      var target = state.asteroids[sc.targetAsteroidId];
      if (!target) continue;
      target.revealed = true;
      target.scouted = true;

      // Nearby bodies come into view (revealed) but stay unscouted.
      var ak = Object.keys(state.asteroids);
      for (var n = 0; n < ak.length; n++) {
        var other = state.asteroids[ak[n]];
        if (other.id === target.id || other.revealed) continue;
        if (asteroidDistance(target.id, other.id) <= 15) other.revealed = true;
      }

      var depNames = Object.keys(target.deposits || {}).map(function (oreId) {
        var def = window.GameData && window.GameData.byId(window.GameData.ORES, oreId);
        return def ? def.name : oreId;
      });
      var depText = depNames.length ? depNames.join(', ') : 'none surveyed';
      pushEvent('signal', 'Scout reached ' + target.name + '. Deposits: ' + depText + '. Size: ' + target.size + '.');
    }
    state.scouts = still;
  }

  // Passive observation: every ~25-35 days, one hidden body adjacent to an
  // already-revealed body slips into view, so the belt slowly comes into focus.
  var passiveRevealCooldown = 25 + Math.random() * 10;
  function maybePassiveReveal(days) {
    passiveRevealCooldown -= days;
    if (passiveRevealCooldown > 0) return;
    passiveRevealCooldown = 25 + Math.random() * 10;

    var ak = Object.keys(state.asteroids);
    var revealed = [];
    for (var i = 0; i < ak.length; i++) if (state.asteroids[ak[i]].revealed) revealed.push(state.asteroids[ak[i]]);

    // Candidates: hidden bodies within distance 22 of any revealed body.
    var candidates = [];
    for (var h = 0; h < ak.length; h++) {
      var cand = state.asteroids[ak[h]];
      if (cand.revealed) continue;
      for (var r = 0; r < revealed.length; r++) {
        if (asteroidDistance(cand.id, revealed[r].id) <= 22) { candidates.push(cand); break; }
      }
    }
    if (candidates.length === 0) return;
    var pick = candidates[Math.floor(Math.random() * candidates.length)];
    pick.revealed = true;
    pushEvent('signal', 'Long-range sensors detect a new body at the edge of charted space. Scout it to survey.');
  }

  function advanceTick(days) {
    if (state.paused || state.gameOver) return;
    if (!days || days <= 0) days = 1 / 30;

    state.day += days;

    var income = 0;
    var ak = Object.keys(state.asteroids);
    for (var i = 0; i < ak.length; i++) {
      var a = state.asteroids[ak[i]];
      if (!isHelion(a)) continue;
      tickAsteroid(a, days);
      income += autoSellIncome(a, days);
    }

    // Income -> credits.
    state.incomePerDay = days > 0 ? income / days : 0;
    state.credits += income;
    state.totalEarned += income;
    state.totalEarnedAllTime += income;

    // Suspicion decays toward 0.
    if (state.suspicion > 0) state.suspicion = Math.max(0, state.suspicion - 0.4 * days);

    // Corporate streak: days with Fed Standing >= 75.
    if (state.federationStanding >= 75) state.corporateStreakDays += days;
    else state.corporateStreakDays = 0;

    // Gallow ramming countdown (only active once the threat has been triggered).
    if (typeof state.gallowEtaDays === 'number' && state.gallowEtaDays > 0) {
      state.gallowEtaDays -= days;
      if (state.gallowEtaDays <= 0) {
        state.gallowEtaDays = 0;
        var forge = state.asteroids['forge-3'];
        if (forge) {
          forge.rad = Math.min(100, forge.rad + 20);
          forge.happiness = clamp(forge.happiness - 20, 0, 100);
        }
        pushEvent('crit', 'GALLOW impact on Forge-3. Heavy structural and radiation damage.');
      }
      if (state.asteroids.gallow) state.asteroids.gallow.rammingEtaDays = Math.max(0, Math.ceil(state.gallowEtaDays));
    }

    tickScouts(days);
    maybePassiveReveal(days);
    fluctuateMarket(days);
    maybeRandomEvent(days);
    maybeTriggerGallow(days);
    checkVictory();

    notify();
  }

  // ---- actions -------------------------------------------------------------

  var BASIC_COLONY_QUEUE = [
    { kind: 'air', cell: '2,3', totalDays: 3, label: 'Air Processor' },
    { kind: 'hydration', cell: '4,3', totalDays: 3, label: 'Hydration Plant' },
    { kind: 'power1', cell: '3,2', totalDays: 5, label: 'Power Plant' },
    { kind: 'mine1', cell: '3,4', totalDays: 4, label: 'Mine Mk1' }
  ];

  var qCounter = 1000;

  function buildingDef(kind) {
    var B = (window.GameData && window.GameData.BUILDINGS) || [];
    for (var i = 0; i < B.length; i++) if (B[i].id === kind) return B[i];
    return null;
  }

  function helionAsteroidList() {
    var out = [];
    var ak = Object.keys(state.asteroids);
    for (var i = 0; i < ak.length; i++) {
      var a = state.asteroids[ak[i]];
      if (a.ownerId === 'helion') out.push(a);
    }
    return out;
  }

  var scoutCounter = 1;

  var handlers = {
    launchScout: function (p) {
      var from = state.asteroids[p.fromAsteroidId];
      var target = state.asteroids[p.targetAsteroidId];
      if (!from || !target) return;
      if (target.scouted) { pushEvent('warn', target.name + ' is already surveyed.'); return; }
      if (state.scouts.some(function (s) { return s.targetAsteroidId === target.id; })) {
        pushEvent('warn', 'A scout is already en route to ' + target.name + '.'); return;
      }
      if (state.credits < 800) { pushEvent('warn', 'Scout launch failed: insufficient funds (800 cr).'); return; }
      state.credits -= 800;

      var travelDays = clamp(Math.ceil(asteroidDistance(from.id, target.id) / 5), 3, 20);
      state.scouts.push({
        id: 'scout' + (scoutCounter++),
        fromAsteroidId: from.id,
        targetAsteroidId: target.id,
        daysRemaining: travelDays,
        totalDays: travelDays
      });
      pushEvent('signal', 'Scout launched toward ' + target.name + '. ETA ' + travelDays + ' days. -800 cr.');
    },

    colonize: function (p) {
      var a = state.asteroids[p.asteroidId];
      if (!a || a.ownerId) return;
      if (state.credits < 14000) { pushEvent('warn', 'Colonisation of ' + a.name + ' failed: insufficient funds.'); return; }
      state.credits -= 14000;
      a.ownerId = 'helion';
      a.revealed = true;
      a.scouted = true;
      a.status = 'building';
      a.pop = 0;
      a.maxPop = 0;
      a.airPct = 0; a.waterPct = 0; a.foodPct = 0;
      a.ores = emptyOres();
      a.maxOreStorage = 0;
      a.oreRates = {};
      a.grid = { '3,3': 'cpu' };
      // Fresh power books: only the CPU core draws power until the queue builds.
      a.powerGenerated = 0;
      a.powerConsumed = 5;
      a.powerSurplus = -5;
      a.buildQueue = BASIC_COLONY_QUEUE.map(function (b) {
        return { id: 'q_col' + (qCounter++), kind: b.kind, cell: b.cell, progress: 0, totalDays: b.totalDays, label: b.label };
      });
      recomputeAsteroid(a);
      state.selectedAsteroidId = a.id;
      pushEvent('ally', 'Colonisation of ' + a.name + ' authorised. Construction underway. -14,000 cr.');
    },

    placeBuilding: function (p) {
      var a = state.asteroids[p.asteroidId];
      if (!a || a.ownerId !== 'helion') return;
      if (a.grid[p.cell]) return; // occupied
      if (a.buildQueue.some(function (q) { return q.cell === p.cell; })) return; // already queued here
      var def = buildingDef(p.kind);
      if (!def) return;
      var cost = def.cost || 0;
      if (state.credits < cost) { pushEvent('warn', 'Cannot build ' + def.name + ': insufficient funds (' + cost + ' cr).'); return; }
      state.credits -= cost;
      a.buildQueue.push({
        id: 'q_pb' + (qCounter++), kind: p.kind, cell: p.cell,
        progress: 0, totalDays: def.build || 4, label: def.name
      });
      pushEvent('signal', a.name + ': ' + def.name + ' queued at [' + p.cell + ']. -' + cost.toLocaleString() + ' cr.');
    },

    buyBlueprint: function (p) {
      var bp = state.blueprints[p.blueprintId];
      if (!bp || bp.owned) return;
      if (state.credits < bp.cost) { pushEvent('warn', 'Blueprint acquisition failed: insufficient funds.'); return; }
      state.credits -= bp.cost;
      bp.owned = true;
      var def = window.GameData && window.GameData.byId(window.GameData.BLUEPRINTS, p.blueprintId);
      pushEvent('ally', 'Blueprint acquired: ' + (def ? def.name : p.blueprintId) + '. -' + bp.cost.toLocaleString() + ' cr.');
    },

    sellOre: function (p) {
      var a = state.asteroids[p.asteroidId];
      if (!a) return;
      var have = a.ores[p.oreId] || 0;
      var qty = Math.min(have, p.qty || 0);
      if (qty <= 0) return;
      var base = state.marketPrices[p.oreId] || 0;
      var mult = p.channel === 'black' ? 1.6 : p.channel === 'merchant' ? 1.0 : 0.7;
      var gain = Math.round(qty * base * mult);
      a.ores[p.oreId] = have - qty;
      state.credits += gain;
      state.totalEarned += gain;
      state.totalEarnedAllTime += gain;
      state.totalOreValueSold += qty * base;
      if (p.channel === 'black') {
        state.suspicion = clamp(state.suspicion + 5 + Math.random() * 13, 0, 100);
        pushEvent('illegal', 'Black-market sale: ' + Math.round(qty) + 't ' + p.oreId + ' for ' + gain.toLocaleString() + ' cr. Suspicion rising.');
        if (state.suspicion >= 70) pushEvent('crit', 'Federation investigation triggered. Suspicion ' + Math.round(state.suspicion) + '/100.');
      } else {
        var label = p.channel === 'merchant' ? 'Merchant' : 'Federal';
        pushEvent('signal', label + ' sale: ' + Math.round(qty) + 't ' + p.oreId + ' for ' + gain.toLocaleString() + ' cr.');
      }
    },

    buyMerchantItem: function (p) {
      var item = null;
      for (var i = 0; i < state.merchantStock.length; i++) if (state.merchantStock[i].id === p.itemId) { item = state.merchantStock[i]; break; }
      if (!item || item.qty <= 0) return;
      if (state.credits < item.price) { pushEvent('warn', 'Purchase failed: insufficient funds.'); return; }
      state.credits -= item.price;
      item.qty -= 1;
      pushEvent('signal', 'Purchased ' + item.name + ' from merchant. -' + item.price.toLocaleString() + ' cr.');
    },

    newGame: function () {
      // Reset all scalars
      state.day = 1; state.speed = 1; state.paused = false;
      state.credits = 1200; state.totalEarned = 0;
      state.federationStanding = 62; state.suspicion = 0; state.incomePerDay = 0;
      state.scouts = [];
      state.merchantDocked = false; state.merchantDockAsteroid = null; state.merchantDaysLeft = 0;
      state.gameOver = false; state.victory = null;
      state.corporateStreakDays = 0; state.totalOreValueSold = 0; state.totalEarnedAllTime = 0;
      state.gallowEtaDays = null; state.gallowTriggered = false;
      state.selectedAsteroidId = 'arch-i'; state.colonyViewBuildingSelected = 'mine1';
      // Reset market prices
      state.marketPrices = { selenium: 12, asteros: 18, barium: 24, crystalite: 38, quazinc: 52,
        bytanium: 88, korellium: 142, dragonium: 240, traxium: 520, nexos: 980 };
      // Reset blueprints
      var bpOwned = { 'mk2mine': true, 'mk2deep': true, 'seismic': true, 'hep': true,
        'powamp': true, 'sensor': true, 'satellite': true };
      var bp = state.blueprints;
      Object.keys(bp).forEach(function (k) { bp[k].owned = !!bpOwned[k]; });
      // Reset merchant stock quantities
      var msInit = { medkit: 14, luxury: 8, tools: 22, antiv: 4, satellite: 2, drago: 12 };
      state.merchantStock.forEach(function (i) { if (msInit[i.id] !== undefined) i.qty = msInit[i.id]; });
      var bmInit = { nexos: 4, manifesto: 1, maunaint: 1, mole: 1 };
      state.blackMarketStock.forEach(function (i) { if (bmInit[i.id] !== undefined) i.qty = bmInit[i.id]; });
      // Reset home asteroid
      var h = state.asteroids['arch-i'];
      h.ownerId = 'helion'; h.status = 'home'; h.threat = 'none';
      h.revealed = true; h.scouted = true;
      h.rad = 8; h.happiness = 70; h.pop = 20; h.maxPop = 50;
      h.airPct = 60; h.waterPct = 60; h.foodPct = 40;
      h.powerSurplus = 1; h.powerGenerated = 10; h.powerConsumed = 9;
      h.airPerDay = 30; h.waterPerDay = 30; h.foodPerDay = 0;
      h.ores = emptyOres(); h.maxOreStorage = 1000;
      h.oreRates = { crystalite: 1 };
      h.deposits = { crystalite: 800, barium: 600, quazinc: 400 };
      h.grid = { '4,4': 'cpu', '3,4': 'air', '5,4': 'hydration', '3,3': 'power1', '4,3': 'mine1' };
      h.buildQueue = [];
      // Reset all other asteroids to unclaimed/foreign defaults
      var startVis = { 'arch-i': true, 'arch-ii': true, 'kepler-7': true, 'lattice': true, 'salt': true };
      Object.keys(state.asteroids).forEach(function (id) {
        if (id === 'arch-i') return;
        var a = state.asteroids[id];
        a.revealed = !!startVis[id]; a.scouted = false;
        if (a.ownerId === 'helion') {
          a.ownerId = null; a.status = 'unclaimed';
          a.pop = 0; a.maxPop = 0;
          a.airPct = 0; a.waterPct = 0; a.foodPct = 0;
          a.powerSurplus = 0; a.powerGenerated = 0; a.powerConsumed = 0;
          a.airPerDay = 0; a.waterPerDay = 0; a.foodPerDay = 0;
          a.ores = emptyOres(); a.maxOreStorage = 0; a.oreRates = {};
          a.grid = {}; a.buildQueue = []; a.threat = 'none';
        }
        if (id === 'gallow') { a.threat = 'none'; a.rammingEtaDays = null; }
        if (id === 'forge-3') { a.threat = 'none'; }
      });
      recomputeAsteroid(h);
      h.maxOreStorage = Math.max(h.maxOreStorage, 1000);
      h.maxPop = Math.max(h.maxPop, 50);
      // Reset events
      nextEventId = 100;
      state.events = [{ id: nextEventId++, day: 1, kind: 'signal',
        text: 'New mission begun. Home base Arch-I established. Launch a scout to chart the belt.' }];
    },

    setPaused: function (p) { state.paused = !!p.paused; },
    setSpeed: function (p) { if (p.speed > 0) state.speed = p.speed; },
    selectAsteroid: function (p) { if (state.asteroids[p.asteroidId]) state.selectedAsteroidId = p.asteroidId; },
    selectBuilding: function (p) { state.colonyViewBuildingSelected = p.kind; }
  };

  function dispatch(action) {
    if (!action || !action.type) return;
    var h = handlers[action.type];
    if (!h) return;
    h(action.payload || {});
    checkVictory();
    notify();
  }

  // ---- normalise initial derived values -----------------------------------
  // Recompute each Helion asteroid once so power/rates/caps reflect the grid.
  (function init() {
    var list = helionAsteroidList();
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      var savedMax = a.maxOreStorage;
      var savedPop = a.maxPop;
      recomputeAsteroid(a);
      // Preserve hand-authored capacity/population floors if the grid yields less.
      // (The starting home has no living quarters yet but still houses its crew.)
      if (savedMax > a.maxOreStorage) a.maxOreStorage = savedMax;
      if (savedPop > a.maxPop) a.maxPop = savedPop;
    }
  })();

  // ---- expose --------------------------------------------------------------

  window.GameStore = {
    state: state,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    dispatch: dispatch,
    advanceTick: advanceTick,
    // utility for components
    helionAsteroids: helionAsteroidList,
    asteroidDistance: asteroidDistance,
    oreIds: ORE_IDS
  };
})();
