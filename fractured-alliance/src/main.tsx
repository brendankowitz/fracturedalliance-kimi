import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { startTickLoop } from './store/gameStore'

function Boot() {
  useEffect(() => {
    startTickLoop()
  }, [])
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boot />
  </StrictMode>,
)
