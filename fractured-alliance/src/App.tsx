import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import type { ScreenId } from './types'
import { Taskbar } from './components/Taskbar'
import { IconRail } from './components/IconRail'
import { StatusBar } from './components/StatusBar'
import { TweaksPanel } from './components/TweaksPanel'
import { MainMenu } from './screens/menu/MainMenu'
import { SectorMap } from './screens/sector/SectorMap'
import { ColonyView } from './screens/colony/ColonyView'
import { SciTek } from './screens/scitek/SciTek'
import { Diplomacy } from './screens/diplomacy/Diplomacy'
import { Trade } from './screens/trade/Trade'
import { Combat } from './screens/combat/Combat'
import { Espionage } from './screens/espionage/Espionage'

const FKEY_SCREENS: Record<string, ScreenId> = {
  F1: 'menu',
  F2: 'sector',
  F3: 'colony',
  F4: 'scitek',
  F5: 'trade',
  F6: 'diplomacy',
  F7: 'combat',
  F8: 'espionage',
}

function App() {
  const { screen, settings, setScreen, setPaused, setSpeed, paused, speed, setSettings } = useGameStore()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = FKEY_SCREENS[e.key]
      if (!target) return
      e.preventDefault()
      useGameStore.getState().setScreen(target)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const densityMap = { compact: '10px', regular: '14px', spacious: '18px' }
    const gapMap = { compact: '6px', regular: '10px', spacious: '14px' }
    root.style.setProperty('--pad', densityMap[settings.density])
    root.style.setProperty('--gap', gapMap[settings.density])
  }, [settings.density])

  useEffect(() => {
    const root = document.documentElement
    if (settings.accent === 'cyan') {
      root.style.setProperty('--warn', 'oklch(0.78 0.14 200)')
      root.style.setProperty('--warn-dim', 'oklch(0.55 0.10 200)')
      root.style.setProperty('--warn-bg', 'oklch(0.30 0.06 200 / 0.32)')
    } else if (settings.accent === 'crimson') {
      root.style.setProperty('--warn', 'oklch(0.74 0.16 18)')
      root.style.setProperty('--warn-dim', 'oklch(0.55 0.12 18)')
      root.style.setProperty('--warn-bg', 'oklch(0.30 0.07 18 / 0.32)')
    } else if (settings.accent === 'verdant') {
      root.style.setProperty('--warn', 'oklch(0.78 0.14 150)')
      root.style.setProperty('--warn-dim', 'oklch(0.55 0.10 150)')
      root.style.setProperty('--warn-bg', 'oklch(0.30 0.06 150 / 0.32)')
    } else {
      root.style.setProperty('--warn', 'oklch(0.80 0.15 70)')
      root.style.setProperty('--warn-dim', 'oklch(0.60 0.12 70)')
      root.style.setProperty('--warn-bg', 'oklch(0.32 0.07 70 / 0.30)')
    }
  }, [settings.accent])

  useEffect(() => {
    function fit() {
      const stage = document.querySelector('.canvas') as HTMLElement | null
      if (!stage) return
      const sx = window.innerWidth / 1440
      const sy = window.innerHeight / 900
      const s = Math.min(sx, sy, 1)
      stage.style.transform = `scale(${s})`
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  const screenContent = (() => {
    switch (screen) {
      case 'menu': return <MainMenu />
      case 'sector': return <SectorMap />
      case 'colony': return <ColonyView />
      case 'scitek': return <SciTek />
      case 'diplomacy': return <Diplomacy />
      case 'trade': return <Trade />
      case 'combat': return <Combat />
      case 'espionage': return <Espionage />
      default: return <MainMenu />
    }
  })()

  return (
    <div className="stage">
      <div className={`canvas ${settings.scanlines ? 'scanlines' : ''}`} style={{ '--vignette-on': settings.vignette ? 1 : 0 } as React.CSSProperties}>
        {screen !== 'menu' && <Taskbar />}
        <div style={{
          gridRow: screen === 'menu' ? '1 / -1' : 'auto',
          gridColumn: screen === 'menu' ? '1 / -1' : '1 / 2',
          overflow: 'hidden',
          position: 'relative',
        }} key={screen}>
          {screenContent}
        </div>
        {screen !== 'menu' && <IconRail />}
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

      <TweaksPanel
        settings={settings}
        setSettings={setSettings}
        setScreen={setScreen}
      />
    </div>
  )
}

export default App
