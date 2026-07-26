# Playability Audit — Fractured Alliance (2026-07-26)

**Scope:** read-only audit of `fractured-alliance/` (Vite 8 + React 19 + Zustand 5). Static trace of every screen, store action and sim module, plus a scripted browser playthrough (playwright-core + headless chromium against the dev server) confirming behavior at runtime.

**Verdict up front:** the user is right. This is a dressed-up prototype. The tick loop runs and a handful of transactions are real, but there is no match: no start, no end, no win, no loss, no opponent that acts on the world, and the single most important player action in a colony builder — *place a building and have it finish* — silently never completes.

Classification legend:

- **WIRED** — real, persistent sim effect
- **PARTIAL** — does something, but fake/decorated/incomplete (details noted)
- **DEAD** — no handler / no-op
- **MOCK** — renders hardcoded values not derived from sim state

---

## 1. What the tick actually advances (and what it doesn't)

`startTickLoop()` (`src/store/gameStore.ts:400`) fires `advanceTick()` every **6,000 ms, fixed**. The `speed` setting (0.5×–8×) is stored and displayed but **never read by the loop** — 8× is identical to 1× (confirmed at runtime: 0.167 t/s measured over a 3-minute run with speed set to 8× — exactly 1 tick / 6 s). Pause works (the only real time control).

Per tick (`src/sim/tick.ts`):

| Subsystem | Real per-tick effect |
|---|---|
| Building effects | Recomputed sums for power/food/water/air/popCap; mines add ore to stockpiles (mine1 +2 selenium, mine2 +4, deep +1 barium, seismic +0.5 traxium). **Real.** |
| Construction | Advances **only `buildQueue[0]` and only if `active: true`**. The two fixture mines on Arch-I do complete. Everything queued behind them has `active: false` and never starts. Player-placed buildings are **never added to the queue at all** (see P0-1). |
| Market | Ore prices random-walk ±2%/tick around base. `demand` never changes from 1.0, so all "trend" indicators are permanently flat. Merchant convoy cycle (150 ticks ≈ 15 real minutes) works. |
| Diplomacy | +2 rep per 30 ticks for trade-treaty holders (unreachable in practice, see §Diplomacy). |
| AI (`src/sim/ai.ts`) | **Effectively cosmetic.** `tickWorld` calls `tickAI(nextWorldState)` *after* computing `nextAsteroids`, and the AI mutates the **stale pre-tick asteroid array** — its mining, fleet spawns and threat-flag writes are all discarded when `nextWorld.asteroids = nextAsteroids` (`tick.ts:139,190,204`). Only the −5 reputation change and event strings survive. Runtime-confirmed: after a 30-tick run, Kryll-owned Pyre had 0 mined ore, zero fleets existed anywhere, threat flags unchanged (while motkaj/rigal/mauna each logged the surviving −5 rep). |
| Events | Power-deficit and happiness-critical warnings generated from live state; real but repetitive — the run showed **every-tick spam**: Arch-I "power deficit −34 MW" (the fixture's own building set is power-negative) and happiness-critical alerts for *unclaimed, unpopulated* rocks (Lattice, Salt, Broken, happiness 0). `alerts` in the taskbar is just "events generated this tick", not an unread count. |
| Win/lose | **Nothing. No victory check, no defeat check, no match end, no game-over screen, anywhere in the codebase.** |

Never changes no matter how long you run: `federationStanding` (no writer exists; 62→62 over the audit run), `demand` (stays 1.0), agent statuses, black-market stock (except via direct mutation), flat `reputation` record (write-only, displayed nowhere), AI asteroid/fleet state, `difficulty` (stored, never read by the sim), **treasury** (no income or upkeep exists — 125,378 cr unchanged across 30 ticks; the only treasury movements are player-initiated). Population never grows; it is only *clamped* — the fixture's Arch-I pop 480 was silently clamped to 250 because popCap is recomputed from living-quarter buildings (250) each tick, ignoring the fixture's stated 700.

---

## 2. Core-loop verdict

**Can a player win or lose? No.** There is no victory or defeat condition in the sim. The achievements module name-drops six "victory" paths (economic, military, diplomatic, scientific, independence, survival) but they unlock cosmetic badges — e.g. `first-blood` fires on tick 1 for merely owning an asteroid, and `ghost` ("complete match without being attacked") unlocks immediately because the event list starts empty. Three achievements are hardcoded `() => false` placeholders, and `betrayer` ("break 3 treaties") miscounts: it matches any event text containing "broken", which includes the every-tick happiness alerts for the asteroid literally named **Broken** — it unlocked in the audit run after a single treaty break. Save slots have a `verdict` field that is always written as `null`.

**Is there a match arc? No.** NEW MATCH does not start a match (see below), scenarios don't configure anything, there is no end state, and the Federation "90-day punitive expedition", "Corporate victory in N days", "incoming asteroid ETA 42d" are all static text that never counts down.

**The attempted core loop, as actually playable:**

1. **Place building** → appears on the grid instantly, for free, and stays `constructing: true, progress: 0` **forever** — `placeBuilding` (`gameStore.ts:246`) never appends to `buildQueue`, and the tick only progresses queue entries. It never produces power/ore. **Broken at step 1.**
2. **Mine ore** → works, but only from the *fixture* buildings (the two pre-placed mines that complete, plus the pre-built mine1/mine2/deep). Ore accumulates. **Works by accident of the fixture.**
3. **Sell ore** → works; treasury increases via `sim/market.sellOre`. But the Federal channel displays a 0.7× "fed price" while charging/paying the **full** market price — the shown price is a lie. **Partial.**
4. **Buy blueprint** → works (treasury deducted, ownership recorded, tier prerequisites enforced). But blueprints gate **nothing**: the build palette offers all 23 buildings regardless, and no blueprint modifies any stat. **Dead end.**
5. **Interact with a race** → treaties propose/break through the sim, but all relations start at reputation 0, so only the NAP (threshold 0) is ever signable; the gift/tribute/war buttons write to a parallel `reputation` record that **no UI and no sim module reads**. **Partial/hollow.**
6. **Fight something** → impossible. `resolveCombat` exists and is unit-tested but is never called by the tick or any UI. Fleets only spawn when a shipyard/dock finishes construction (which player-built ones never do) or from AI (whose spawns are discarded). The Combat screen is a static diorama with hardcoded "STRIKE-1 vs KRYLL PICKET" art. **Absent.**

---

## 3. Per-screen inventory

### MainMenu (`src/screens/menu/MainMenu.tsx`)

| Element | Claim | Reality | Class |
|---|---|---|---|
| ▶ CONTINUE | Resume last game | Loads first save slot with `day != null` via `loadSave`; if none, just enters sector screen | WIRED |
| + NEW MATCH | Start a fresh match | `setScreen('sector')` only. **No state reset** — tick, treasury, buildings, reputation all carry over from the fixture/previous session. Confirmed at runtime: tick 341→341, treasury unchanged | DEAD |
| TUTORIAL | Run tutorial | No `onClick`. No tutorial exists anywhere | DEAD |
| SETTINGS | Open settings | No `onClick` | DEAD |
| CREDITS / QUIT | — | No `onClick` | DEAD |
| 5 scenario buttons | Choose different match types | Only set local hover highlight; selection is never consumed. All "starts" (via NEW MATCH) produce the identical fixture world | DEAD |
| Save slot rows | Load a save | Click loads slot when `day != null`; save/load roundtrip works (see §Save/Load for what it drops) | WIRED |
| Achievements grid | Meta progression | Displays session-state achievements; **not persisted** across reload; 3 of 12 are `() => false` placeholders; 2 unlock spuriously at tick 1 | PARTIAL |
| "tutorial available" tag, boot log text | — | Static decoration ("sci-tek index 24/40", "1 incoming asteroid trajectory") | MOCK |

### SectorMap (`src/screens/sector/SectorMap.tsx` + `BeltCanvas.tsx`)

| Element | Claim | Reality | Class |
|---|---|---|---|
| Belt canvas click | Select asteroid | Hit-tests and sets `selectedAsteroid` | WIRED |
| Double-click rock | Jump to colony | Works for helion-owned only | WIRED |
| Drag / wheel | Pan / zoom | Works | WIRED |
| FILTER / PROBE / LAUNCH SCOUT | Belt actions | No `onClick` | DEAD |
| Inspector vitals (pop/happiness/rad) | Live stats | Reads live asteroid resources | WIRED |
| Inspector "Stability" block chars | Asteroid stability | `status === 'building' ? '▰▰▱▱' : '████'` — two hardcoded strings | MOCK |
| Deposits list | Survey results | Ore kinds real; **yield `400t` is a `// deterministic mock` constant** (`SectorMap.tsx:195`) | MOCK |
| Threat intel text | Incoming dangers | Hardcoded strings incl. "ETA 42 sim-days"; threat flags are static fixture values (AI writes to them are discarded) | MOCK |
| MANAGE COLONY | Go to colony | Works | WIRED |
| LAUNCH FLEET | — | No `onClick` | DEAD |
| REASSIGN SUPERVISOR | — | No `onClick` (no supervisor system exists) | DEAD |
| COLONISE — 14,000 cr | Claim unclaimed rock | No `onClick`; no colonisation mechanic exists | DEAD |
| DETAILED GEO SURVEY — 800 cr | Reveal deposits | No `onClick` | DEAD |
| OPEN DIPLOMACY | — | No `onClick` (doesn't even navigate) | DEAD |
| LAUNCH SPY PROBE | — | No `onClick` | DEAD |
| DECLARE ATTACK | — | No `onClick` | DEAD |
| "⚠ TRAJ: GALLOW → FORGE-3 · ETA 42d" + route lanes | Live trajectories | Decorative canvas constants (`BeltCanvas.tsx:556`, `ROUTES_*`); the ETA never ticks down | MOCK |
| Merchant dock badge | Convoy position | Derived from real market cycle | WIRED |

### ColonyView (`src/screens/colony/ColonyView.tsx` + `IsoSurface.tsx`)

| Element | Claim | Reality | Class |
|---|---|---|---|
| Build palette select | Choose building | Sets `selectedBuilding`; shows cost but **cost is never charged** | PARTIAL |
| Palette search input | Filter buildings | No `onChange`/state | DEAD |
| Grid cell click (empty) | Construct building | `placeBuilding` inserts instantly at `progress: 0`, **never adds a build-queue entry → never completes, never produces anything**. Runtime-confirmed: still `p=0.00` after 5+ ticks | PARTIAL (core break) |
| Grid cell click (occupied) | Inspect | Selection ring + readout | WIRED (cosmetic) |
| ‹ Forge-3 / Kepler-7 › | Cycle colonies | No `onClick` | DEAD |
| SUPERVISORS | — | No `onClick` | DEAD |
| Resource stat bars | Colony vitals | Live from sim resources; update per tick | WIRED |
| VIEW SURFACE / DEEP / ORBITAL | Layer views | No `onClick`; only SURFACE styled active | DEAD |
| Build queue list | Construction status | Real for the fixture queue, but only slot 0 advances; the 4 queued items behind it have `active: false` and never start; header hardcoded "ARCH-I" even when viewing another asteroid | PARTIAL |
| Queue ▲▼ buttons | Reorder | No `onClick` | DEAD |
| LIVE FEED | Sim event log | **Static `EVENT_FEED` array from `gameData.ts`** — fabricated events (Kryll accusations, GALLOW trajectory) unrelated to sim state. The real `events` store is shown only in Diplomacy's council log | MOCK |
| IsoSurface pan/zoom/hover | — | Works | WIRED |

### SciTek (`src/screens/scitek/SciTek.tsx`)

| Element | Claim | Reality | Class |
|---|---|---|---|
| Discipline tabs | Filter | Local state, works | WIRED |
| Blueprint card | Inspect | Selection works | WIRED |
| PURCHASE | Buy tech | Deducts treasury, records ownership, enforces same-discipline tier prerequisite (runtime-confirmed: Photon Cannon correctly disabled with no Offence T1 owned). **But ownership has zero gameplay effect**: buildings aren't blueprint-gated, no stats change. Worse: **Offence and Defence disciplines have no T1 blueprint in the data at all**, so their entire trees (Photon, Plasma, Nuke, shields…) are permanently unpurchasable | PARTIAL |
| QUEUE FOR LATER | — | No `onClick` | DEAD |
| SORT: PRICE / VIEW: GRID | — | No `onClick` | DEAD |
| 4 filter checkboxes | Filter list | Local checkbox state only; the list is never filtered | DEAD |
| "+1,820 /day · 7-day avg" | Income stat | Hardcoded; no income model exists | MOCK |
| Trap-tier / secession / Federation-impact texts | Consequences | Pure flavor; nothing implements them | MOCK |

### Trade (`src/screens/trade/Trade.tsx`)

| Element | Claim | Reality | Class |
|---|---|---|---|
| Channel tabs | Switch market | Works | WIRED |
| Federal BUY 1/10, SELL 1/10 | Trade ore at 0.7× federal rate | Real treasury/stockpile mutation via `sim/market`, **but priced at full market rate** — the displayed 0.7× "FED PRICE" is not the executed price. Runtime-confirmed: SELL 10 selenium credited 10× full price | PARTIAL |
| NEXT TRANSPORTER panel | Docking schedule | "14 days / 2,400 t / 1,180 t / 640 t" all hardcoded | MOCK |
| PRICE FORECAST sparkline + caption | 30-day forecast | Hardcoded data points and text | MOCK |
| 30D trend arrows | Price trend | Computed from `demand`, which never leaves 1.0 — always "—" | PARTIAL (dead signal) |
| Merchant BUY | Buy goods | Real treasury/stock decrement, but items (medkit/luxury/tools/antiv) have no inventory and no effect; uses `alert()` for errors; bypasses store actions via direct `setState` | PARTIAL |
| BARTER / REPUTATION CHECK / REQUEST DEPARTURE | — | No `onClick` | DEAD |
| Black-market BUY | Illegal goods, +suspicion | Treasury + suspicion changes are real; items do nothing; **mutates the module-level `BLACK_MARKET` const** (`item.qty = stock - 1`), so stock changes leak across sessions in the same page lifetime; claimed "−0.4/day decay" does not exist; "investigation at 70" never triggers | PARTIAL |
| STOCKPILE · ALL ASTEROIDS | Empire-wide cargo | Shows only the selected asteroid; `cap = 1000` hardcoded (storage buildings don't affect it) | PARTIAL |
| MARKET TICK prices | Live prices | Real random-walk prices | WIRED |

### Diplomacy (`src/screens/diplomacy/Diplomacy.tsx`)

| Element | Claim | Reality | Class |
|---|---|---|---|
| Race list | Relations overview | Live `relations` (rep/standing/treaties) | WIRED |
| PROPOSE treaty | Sign pact | Real sim call with threshold check — **but all reps start at 0** (fixture reputations in `gameData.RACES` are ignored; `createRelations` zeroes them) so only NAP (≥0) is ever signable; Trade (≥20) is unreachable since the only rep-gain path requires a trade treaty. Runtime-confirmed | PARTIAL |
| BREAK | End pact | Real: treaty removed, rep −15, `casusBelli: true` set — a flag nothing ever reads | WIRED |
| SEND GIFT (1,000 cr) | +rep for cash | **Charges 0 cr** and adds +5 to the flat `reputation` record — which no screen displays and no sim module reads. Visible effect: none. Runtime-confirmed | PARTIAL (hollow) |
| DEMAND TRIBUTE | — | Same: −8 to the invisible flat record; no credits gained | PARTIAL (hollow) |
| DECLARE WAR | Start war | −40 to the invisible flat record; no war state, no AI reaction, no combat trigger | PARTIAL (hollow) |
| SABOTAGE / TRADE ILLEGAL | — | No `onClick` | DEAD |
| OPEN CHANNEL / MUTE | — | No `onClick` | DEAD |
| "Signed T+0218 · 124 days active · Penalty 8,000 cr" | Treaty terms | Hardcoded; break charges no penalty | MOCK |
| "Corporate victory in N days" | Victory countdown | `daysHeld = 28 // placeholder` (`Diplomacy.tsx:123`) | MOCK |
| "Recent: −5 council accusation…" | Rep history | Hardcoded | MOCK |
| Council log | Diplomatic events | Real sim event feed | WIRED |
| Federation standing +62 | Fed relationship | Real store value, but **no code path ever modifies it** | PARTIAL (static) |

### Combat (`src/screens/combat/Combat.tsx`)

| Element | Claim | Reality | Class |
|---|---|---|---|
| Fleet roster | Your fleets | Reads `asteroid.fleets` — which is **always empty in practice** (no construction path completes a shipyard; AI spawns discarded). Runtime: "0 fleets · 0 hulls" | PARTIAL |
| Tactical viewport | Live battle | Entirely hardcoded SVG diorama: "STRIKE-1 vs KRYLL PICKET", "Pyre Approach", "elapsed 02:14", tracer lines, wreck marker | MOCK |
| 5 stance buttons | Fleet orders | No `onClick` | DEAD |
| TARGETS list | Enemy hulls | Hardcoded names/HP | MOCK |
| Orbital bombardment buttons | Fire bombs | No `onClick`; counts hardcoded | DEAD |
| Missile arsenal | Inventory | Hardcoded counts | MOCK |
| "FED. SCRUTINY: SANCTIONED" | — | Static text | MOCK |
| (sim) `resolveCombat` | Battle resolution | Implemented and unit-tested, **never invoked** by tick or UI | DEAD (orphan) |

### Espionage (`src/screens/espionage/Espionage.tsx`)

| Element | Claim | Reality | Class |
|---|---|---|---|
| Agent roster | Your agents | Static `AGENTS` fixture; statuses never change; agents "on mission" can still execute instantly | PARTIAL |
| Target race / mission type select | Plan op | Local state, works | WIRED |
| ▶ EXECUTE OPERATION | Run mission for a fee | Real RNG resolution via `sim/espionage` (+5/+15 suspicion, +2,000 cr on blackmail). **Fee shown (~2,100 cr) is never charged** — runtime-confirmed: treasury byte-identical across two executions while suspicion climbed 77→92→100. Reaching suspicion 100 triggers nothing but the `outlaw` achievement badge. No effect on the target race/asteroid; `techStolen: 'random-tech'` is a literal string granted to no one; agent status/loc unchanged; "DURATION 14 days" is fake — resolves instantly | PARTIAL |
| RECRUIT NEW AGENT | — | No `onClick` | DEAD |
| DISMISS / SAVE AS DRAFT / CANCEL | — | No `onClick` | DEAD |
| Counter-intel log | Ops history | Hardcoded `INTEL_LOG` describing events that never happened | MOCK |
| CIPHER LEVEL +12 / SUSPECTED MOLES 3 | — | Hardcoded | MOCK |
| Detection/capture % shown | Mission odds | Display formula ≠ sim formula (display uses `100 − stealth`; sim uses threshold roll) | PARTIAL |
| Suspicion meter | Fed heat | Real store value; but suspicion has no decay and no consequence at any threshold | PARTIAL |

### Chrome (Taskbar / StatusBar / IconRail / TweaksPanel)

| Element | Claim | Reality | Class |
|---|---|---|---|
| Taskbar brand click | Back to menu | Works | WIRED |
| Taskbar CR / date / FED-STAND | Live stats | Real (fed-standing never changes, but displayed honestly) | WIRED |
| Taskbar ALERTS | Alert count | Set to `world.events.length` = events generated **this tick only**; jumps between 0–6; not an unread/alarm count | PARTIAL |
| StatusBar PAUSE | Halt sim | Works (tick loop respects `paused`). Runtime-confirmed | WIRED |
| StatusBar 0.5×–8× | Game speed | Sets `speed` state only; tick interval is fixed at 6 s. **No effect.** Runtime-confirmed (0.17 t/s at 1× and 8×) | DEAD (as control) |
| StatusBar SAVES n/m | — | Real count from localStorage slots | WIRED |
| "● SYNCED" / "● READY" | — | Static | MOCK |
| IconRail + F1–F8 | Navigation | Works | WIRED |
| TweaksPanel theme/density/scanlines/vignette/sound | Settings | Works, persisted to localStorage | WIRED |
| TweaksPanel pause-on-crit | Auto-pause | Works via `useSfx` watcher | WIRED |
| Difficulty setting (5 levels) | Game difficulty | Stored + persisted; **never read by any sim code** | DEAD |

### Save/Load (`src/store/saveLoad.ts`, `src/sim/serialize.ts`)

Save→reload→CONTINUE roundtrip works (runtime-confirmed). But `loadSave` (`gameStore.ts:292`) restores only tick/treasury/asteroids/suspicion/reputation/federationStanding/events/market/relations — it **drops `blueprintsOwned`, `achievements`, `selectedAsteroid`, `speed`**, so a loaded game silently loses purchased tech (runtime-confirmed: saved with 7 blueprints, loaded with the 6 fixture ones). `verdict` is always serialized as `null`. Empty-slot load silently dumps you into the sector screen. The `SAVES` fixture in `gameData.ts` (with "Won — Corporate" etc.) is dead data never used.

---

## 4. What actually works (the complete list)

1. Screen navigation (IconRail, F1–F8, taskbar brand).
2. Tick loop: building-effect aggregation, ore accrual from completed mines, fixture build-queue slot 0, market price random-walk, merchant convoy cycle, event generation for power/happiness, pause.
3. Ore buy/sell against live market prices (at full price, not the displayed fed price).
4. Blueprint purchase bookkeeping (deduct, own, tier-prereq gate) — with no downstream effect.
5. Treaty propose (NAP only, effectively) and break, with council-log events.
6. Espionage mission RNG → suspicion/blackmail-credit changes.
7. Save/load roundtrip via localStorage (minus the dropped fields).
8. Settings (theme, density, scanlines, vignette, sound, pause-on-crit) persisted and applied.
9. Audio feedback (click/place/error chimes, day rollover, crit stinger).
10. Belt map + iso surface rendering, pan/zoom/select.

## 5. What's fake, ordered by damage to the illusion

1. **Player construction never completes** — the core verb of the genre is broken. Buildings are also free.
2. **No match frame at all** — NEW MATCH doesn't reset, scenarios are inert, no win/lose, no game-over. You cannot "play a match"; you can only tour a diorama.
3. **Speed control does nothing** — 8× is a lie; the game crawls at 1 day per 3 real minutes, which also hides how little the sim does.
4. **AI opponents don't exist mechanically** — their economy, fleets and threats are computed then discarded; only rep nicks and log lines survive. The "6 rivals" are mannequins.
5. **Combat is a painting** — the whole Tactical screen is hardcoded art; `resolveCombat` is orphaned; there is no way to acquire, move, or fight a fleet.
6. **Colony LIVE FEED is fabricated** — static `EVENT_FEED` fiction presented as live telemetry, including the GALLOW→FORGE-3 ramming plot that never progresses.
7. **Diplomatic actions write to an invisible parallel reputation record** — gift/tribute/war appear to work and change nothing anyone can see; meanwhile real `relations` rep starts at 0 so the treaty ladder is soft-locked at NAP.
8. **Sector inspector is larded with mocks** — 400 t yields, block-char "Stability", "ETA 42d" threat text, and seven dead action buttons including COLONISE and DECLARE ATTACK.
9. **Money lies** — federal trade displays 0.7× but settles at 1.0×; espionage fees displayed but never charged; gift claims 1,000 cr but charges 0; buildings cost 0; "+1,820/day" income is fiction.
10. **Blueprints unlock nothing** — the entire Sci-Tek economy is a coin sink into a set that no system consults.
11. **Smaller cosmetics** — hardcoded sparklines, transporter schedules, intel logs, cipher levels, missile counts, "SYNCED", stability bars, "Corporate victory in 32 days", difficulty selector with no teeth, alerts counter that resets every tick.

## 6. Prioritized fix plan

### P0 — core loop broken/missing (can't play a match)

| # | Fix | Where | Size |
|---|---|---|---|
| P0-1 | **Construction pipeline**: `placeBuilding` must charge `BuildingDef.cost`, check treasury, and push a `buildQueue` entry (`active: true` if queue empty, else queued auto-activate on shift). Tick should auto-activate the next queued item when slot 0 completes. Use `BuildingDef.build` (days) for eta | `gameStore.placeBuilding`, `sim/tick.tickAsteroid` | M |
| P0-2 | **Match frame**: `newMatch(scenarioId)` store action that rebuilds initial world state (extract the fixture init into a factory), resets tick/treasury/blueprints/events, applies at least one scenario modifier, and is called by NEW MATCH + scenario buttons | `gameStore`, `MainMenu` | M |
| P0-3 | **Win/lose + game-over screen**: implement 1 victory (e.g. economic: treasury ≥ 500k, or survive-to-day-N) and 1 defeat (all helion asteroids lost/seceded), evaluated in `advanceTick`, with a verdict screen that writes `verdict` to the save slot | `sim/tick`, new `Verdict` screen, `serialize` | M |
| P0-4 | **Speed control**: scale the tick interval (or ticks per interval) from `speed`; keep pause | `startTickLoop` / `advanceTick` caller | S |
| P0-5 | **Fix AI discard bug**: run `tickAI` against the already-ticked asteroid array (pass `nextAsteroids` into the world given to AI, or reorder `tickWorld`) so AI mining/fleets/threats persist | `sim/tick.tickWorld:139–204` | S |

### P1 — session flow broken (dead primary actions)

| # | Fix | Where | Size |
|---|---|---|---|
| P1-1 | **Colonise action**: COLONISE button → deduct 14,000 cr, set owner, seed CPU core + minimal queue; enables expansion | `SectorMap` inspector, new store action | M |
| P1-2 | **Unify reputation**: delete the flat `reputation` record; route gift/tribute/war through `sim/diplomacy.updateReputation` on `relations`; charge the gift; make DECLARE WAR set real hostility the AI respects | `gameStore`, `Diplomacy.tsx`, `sim/ai` | M |
| P1-3 | **Blueprints gate buildings**: palette greys/locks blueprint-tagged buildings until owned; wire at least mine2/power2/seismic effects | `ColonyView` palette, `buildingEffects` | S |
| P1-4 | **Ships & combat MVP**: shipyard completion → fleet (already stubbed in tick); SectorMap LAUNCH FLEET → move fleet to target asteroid; on arrival of hostile fleets call `resolveCombat` and apply losses; render roster from real fleets | `sim/fleet`, `sim/combat`, `tickWorld`, `Combat.tsx` | L |
| P1-5 | **Live event feed everywhere**: replace static `EVENT_FEED` in ColonyView with store `events`; remove fabricated fixture events | `ColonyView`, `gameData` | S |
| P1-6 | **Trade price honesty**: settle federal trades at the displayed 0.7× (pass channel multiplier into `buyOre/sellOre`), charge espionage fees, charge gift cost, charge building costs (P0-1), remove "+1,820/day" fiction or compute it | `Trade.tsx`, `Espionage.tsx`, `Diplomacy.tsx` | S |
| P1-7 | **Suspicion consequences**: decay per day; investigation event at 70; expedition/secession consequence at 100 | `sim/tick`, `sim/espionage` | M |
| P1-8 | **Espionage effects on targets**: sabotage damages a building, stealTech grants a random unowned blueprint, agent status → mission/cooldown/captured transitions | `gameStore.runMission`, `sim/espionage` | M |
| P1-9 | **Save completeness**: persist/restore blueprintsOwned, achievements, selectedAsteroid, speed; surface load errors | `serialize.ts`, `gameStore.loadSave/saveGame` | S |
| P1-10 | **Federation standing dynamics**: writers for standing (trade, war, suspicion, independence) and tie it to the corporate victory path | `sim/tick`, `sim/diplomacy` | M |
| P1-11 | **Dead navigation/buttons**: FILTER/PROBE/LAUNCH SCOUT, GEO SURVEY, OPEN DIPLOMACY (at least navigate), colony prev/next, queue reorder, Sci-Tek sort/filters, TUTORIAL/SETTINGS on menu (or remove them) | various screens | M |

### P2 — cosmetic mocks

| # | Fix | Size |
|---|---|---|
| P2-1 | Deposit yields: replace `400 // deterministic mock` with per-asteroid deposit richness in data | S |
| P2-2 | Stability block-chars → derive from rad/happiness/engines | S |
| P2-3 | Threat texts/ETA → drive from real threat state and tick countdown; make the GALLOW ramming plot real or cut it | M |
| P2-4 | Combat viewport: render from real fleets/engagement state instead of the diorama | M |
| P2-5 | Trend arrows: make market `demand` drift so trends signal something | S |
| P2-6 | Remove/replace hardcoded panels: transporter schedule, price sparkline, intel log, cipher/mole stats, missile counts, treaty "signed T+0218", "Corporate victory in N days" (compute from real standing), "+1,820/day", BUILD QUEUE header asteroid name | S |
| P2-7 | Merchant/black-market items do something (or trim the lists); stop mutating the `BLACK_MARKET` module const | S |
| P2-8 | Achievements: fix `first-blood`/`ghost` spurious unlocks and the `betrayer` substring bug (matches asteroid "Broken" events), implement the 3 placeholders, persist unlocked set | S |
| P2-9 | `alerts` → real unread count or remove the chip | S |

## 7. Recommended "minimum real game" cut

The smallest set that makes **one full match playable start-to-finish**:

1. **P0-1 construction pipeline** — buildings cost money, queue, complete, and produce. Without this nothing else matters.
2. **P0-2 match frame** — NEW MATCH resets to a defined start; one scenario is enough.
3. **P0-4 speed control** — so a match is playable in human time.
4. **P0-3 win/lose** — economic victory (treasury target) + secession/annihilation defeat, with a verdict screen. Gives the arc an end.
5. **P0-5 AI fix + P1-2 reputation unification (trimmed)** — AI actions persist; gift/war affect the visible record; one aggressive race (Mauna) sends a fleet that actually arrives. Just enough opposition to create tension.
6. **P1-5 live event feed** — kill the fabricated feed so what the game tells you is true.
7. **P1-6 price/fee honesty (partial)** — charge what the UI says for buildings, gifts, and missions.

Explicitly **out** of the minimum cut: fleet combat UI (P1-4 full), espionage target effects, colonisation, blueprints gating, Federation standing, tutorials, extra scenarios. An enemy raid can be resolved with a one-line auto-battle (`resolveCombat` already exists) against static defence (laser count) — no tactical screen needed.

With 1–7 done, a player can: start a fresh match → build out Arch-I for real → mine → sell → expand power/life support → survive an AI raid (or not) → reach the treasury victory (or lose their last asteroid) → see a verdict. That is a game.

---

*Method note: static trace covered every file listed in the audit scope; dynamic confirmation used `playwright-core` + chromium-1155 against `vite dev` (port 5199), driving the UI (clicks/keys) and reading the Zustand store directly via module import, including a 3-minute unattended run at "8×". Zero console/page errors were observed during the entire playthrough. Runtime confirmations are marked "runtime-confirmed"; everything else is traced to source with file:line citations.*
