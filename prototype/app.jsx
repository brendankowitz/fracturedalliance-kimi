// app.jsx — root: screen routing, tweaks, scaling

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "warn",
  "density": "regular",
  "scanlines": false,
  "vignette": true,
  "density_px": 14
}/*EDITMODE-END*/;

function App() {
  const [screen, setScreen] = React.useState('menu');
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // ----- Live game store wiring -----
  // The store mutates its state object in place and calls subscribers on every
  // change. We bump a version counter so React always re-renders the tree;
  // components read window.GameStore.state directly (no prop drilling).
  const store = window.GameStore;
  const [, forceRender] = React.useState(0);
  React.useEffect(() => {
    const onChange = () => forceRender(v => (v + 1) & 0xffffff);
    store.subscribe(onChange);
    return () => store.unsubscribe(onChange);
  }, []);

  const gs = store.state;
  const paused = gs.paused;
  const speed = gs.speed;
  const setPaused = (p) => store.dispatch({ type: 'setPaused', payload: { paused: p } });
  const setSpeed = (s) => store.dispatch({ type: 'setSpeed', payload: { speed: s } });

  // Simulation clock: 30 interval ticks = 1 game day. At 1x, interval = 2000ms
  // so a day is ~60s real-time. Higher speed shortens the interval.
  React.useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => store.advanceTick(1 / 30), 2000 / speed);
    return () => clearInterval(iv);
  }, [paused, speed]);

  // Apply density tweak
  React.useEffect(() => {
    document.documentElement.style.setProperty('--pad', t.density === 'compact' ? '10px' : t.density === 'spacious' ? '18px' : '14px');
    document.documentElement.style.setProperty('--gap', t.density === 'compact' ? '6px' : t.density === 'spacious' ? '14px' : '10px');
  }, [t.density]);

  // Apply accent tweak
  React.useEffect(() => {
    const root = document.documentElement;
    if (t.accent === 'cyan') {
      root.style.setProperty('--warn', 'oklch(0.78 0.14 200)');
      root.style.setProperty('--warn-dim', 'oklch(0.55 0.10 200)');
      root.style.setProperty('--warn-bg', 'oklch(0.30 0.06 200 / 0.32)');
    } else if (t.accent === 'crimson') {
      root.style.setProperty('--warn', 'oklch(0.74 0.16 18)');
      root.style.setProperty('--warn-dim', 'oklch(0.55 0.12 18)');
      root.style.setProperty('--warn-bg', 'oklch(0.30 0.07 18 / 0.32)');
    } else if (t.accent === 'verdant') {
      root.style.setProperty('--warn', 'oklch(0.78 0.14 150)');
      root.style.setProperty('--warn-dim', 'oklch(0.55 0.10 150)');
      root.style.setProperty('--warn-bg', 'oklch(0.30 0.06 150 / 0.32)');
    } else {
      // Default amber
      root.style.setProperty('--warn', 'oklch(0.80 0.15 70)');
      root.style.setProperty('--warn-dim', 'oklch(0.60 0.12 70)');
      root.style.setProperty('--warn-bg', 'oklch(0.32 0.07 70 / 0.30)');
    }
  }, [t.accent]);

  // Viewport scaling
  React.useEffect(() => {
    function fit() {
      const stage = document.querySelector('.canvas');
      if (!stage) return;
      const sx = window.innerWidth / 1440;
      const sy = window.innerHeight / 900;
      const s = Math.min(sx, sy, 1);
      stage.style.transform = `scale(${s})`;
    }
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const screenContent = (() => {
    switch (screen) {
      case 'menu':      return <MainMenu onEnter={() => setScreen('sector')} onNewGame={() => { store.dispatch({ type: 'newGame' }); setScreen('sector'); }} />;
      case 'sector':    return <SectorMap onJumpToColony={() => setScreen('colony')} setScreen={setScreen} />;
      case 'colony':    return <ColonyView />;
      case 'scitek':    return <SciTek />;
      case 'diplomacy': return <Diplomacy />;
      case 'trade':     return <Trade />;
      case 'combat':    return <Combat />;
      case 'espionage': return <Espionage />;
      default:          return <MainMenu onEnter={() => setScreen('sector')} />;
    }
  })();

  return (
    <div className="stage">
      <div className={`canvas ${t.scanlines ? 'scanlines' : ''}`} style={{ '--vignette-on': t.vignette ? 1 : 0 }}>
        {screen !== 'menu' && (
          <Taskbar
            screen={screen}
            setScreen={setScreen}
            treasury={Math.round(gs.credits)}
            time={`${Math.floor(gs.day)}.${Math.floor((gs.day % 1) * 100).toString().padStart(2, '0')}`}
            tick={Math.floor(gs.day).toString().padStart(4, '0')}
            alerts={gs.events.filter(e => e.kind === 'crit' || e.kind === 'warn').length}
          />
        )}
        <div style={{
          gridRow: screen === 'menu' ? '1 / -1' : 'auto',
          gridColumn: '1 / -1',
          overflow: 'hidden',
          position: 'relative',
        }} key={screen}>
          {screenContent}
        </div>
        {screen !== 'menu' && (
          <StatusBar
            message={`Viewing ${screen.toUpperCase()} · select an asteroid to inspect`}
            speed={speed}
            setSpeed={setSpeed}
            paused={paused}
            setPaused={setPaused}
          />
        )}
      </div>

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakRadio
          label="Accent"
          value={t.accent}
          options={['warn', 'cyan', 'crimson', 'verdant']}
          onChange={v => setTweak('accent', v)}
        />
        <TweakSection label="Layout" />
        <TweakRadio
          label="Density"
          value={t.density}
          options={['compact', 'regular', 'spacious']}
          onChange={v => setTweak('density', v)}
        />
        <TweakSection label="Effects" />
        <TweakToggle
          label="Scanlines"
          value={t.scanlines}
          onChange={v => setTweak('scanlines', v)}
        />
        <TweakToggle
          label="Vignette"
          value={t.vignette}
          onChange={v => setTweak('vignette', v)}
        />
        <TweakSection label="Jump to" />
        <TweakButton label="Main menu"  onClick={() => setScreen('menu')} />
        <TweakButton label="Sector"     onClick={() => setScreen('sector')} />
        <TweakButton label="Colony"     onClick={() => setScreen('colony')} />
        <TweakButton label="Sci-Tek"    onClick={() => setScreen('scitek')} />
        <TweakButton label="Diplomacy"  onClick={() => setScreen('diplomacy')} />
        <TweakButton label="Commerce"   onClick={() => setScreen('trade')} />
        <TweakButton label="Tactical"   onClick={() => setScreen('combat')} />
        <TweakButton label="Black Cell" onClick={() => setScreen('espionage')} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
