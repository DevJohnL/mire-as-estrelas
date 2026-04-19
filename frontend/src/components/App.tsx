import { useState, useEffect } from 'react'
import Cosmos from './Cosmos'
import RadialMenu from './RadialMenu'
import Dashboard from './Dashboard'
import Questoes from './Questoes'
import Redacao from './Redacao'

type RouteId = 'dashboard' | 'questoes' | 'redacao'

const routeLabel: Record<RouteId, string> = {
  dashboard: 'Observatório',
  questoes: 'Questões',
  redacao: 'Redação',
}

export default function App() {
  const [route, setRoute] = useState<RouteId>(() => (localStorage.getItem('mae_route') as RouteId) || 'dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [starDensity, setStarDensity] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mae_tweaks') || '{}').starDensity ?? 1.0 }
    catch { return 1.0 }
  })
  const [tweaksOpen, setTweaksOpen] = useState(false)

  useEffect(() => { localStorage.setItem('mae_route', route) }, [route])

  const nav = (id: RouteId) => { setRoute(id); setMenuOpen(false) }

  const updateStarDensity = (v: number) => {
    setStarDensity(v)
    localStorage.setItem('mae_tweaks', JSON.stringify({ starDensity: v }))
  }

  return (
    <>
      <Cosmos density={starDensity} />

      <div className="app" data-screen-label={routeLabel[route]}>
        <header className="topbar">
          <div className="brand">
            <BrandMark />
            <div className="brand-name">mire as <em>estrelas</em></div>
            <div className="brand-tag">{routeLabel[route]}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="hamburger btn-ghost btn-sm" style={{ borderRadius: 8, width: 'auto', padding: '0 14px', fontSize: 11, fontFamily: 'var(--mono)', letterSpacing: '0.1em' }} onClick={() => setTweaksOpen(!tweaksOpen)}>cosmos</button>
            <button className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="abrir mapa estelar">
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 6 L18 18 M18 6 L6 18" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  <circle cx="5" cy="7" r="0.8" fill="currentColor" />
                  <circle cx="19" cy="6" r="0.8" fill="currentColor" />
                  <circle cx="20" cy="16" r="0.8" fill="currentColor" />
                  <circle cx="5" cy="17" r="0.8" fill="currentColor" />
                  <path d="M12 12 L5 7 M12 12 L19 6 M12 12 L20 16 M12 12 L5 17" opacity="0.4" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <main className="main">
          {route === 'dashboard' && <Dashboard userName="João Lucas" />}
          {route === 'questoes' && <Questoes />}
          {route === 'redacao' && <Redacao />}
        </main>
      </div>

      <RadialMenu open={menuOpen} current={route} onNav={nav} onClose={() => setMenuOpen(false)} />

      {tweaksOpen && (
        <div className="tweaks">
          <h4>Tweaks · densidade do cosmos</h4>
          <label><span>estrelas</span><span style={{ color: 'var(--gold)' }}>{starDensity.toFixed(2)}x</span></label>
          <input type="range" min="0.2" max="2.5" step="0.05" value={starDensity} onChange={(e) => updateStarDensity(parseFloat(e.target.value))} />
          <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'space-between' }}>
            <button className="btn btn-sm btn-ghost" onClick={() => updateStarDensity(0.4)}>esparso</button>
            <button className="btn btn-sm btn-ghost" onClick={() => updateStarDensity(1.0)}>padrão</button>
            <button className="btn btn-sm btn-ghost" onClick={() => updateStarDensity(2.2)}>denso</button>
          </div>
        </div>
      )}
    </>
  )
}

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 34 34" fill="none">
      <defs>
        <radialGradient id="bmGlow"><stop offset="0%" stopColor="#f4d89e" /><stop offset="100%" stopColor="#c9a776" /></radialGradient>
      </defs>
      <circle cx="17" cy="17" r="5" fill="url(#bmGlow)" />
      <g stroke="#f4d89e" strokeWidth="0.5" opacity="0.7">
        <line x1="17" y1="1" x2="17" y2="6" /><line x1="17" y1="28" x2="17" y2="33" />
        <line x1="1" y1="17" x2="6" y2="17" /><line x1="28" y1="17" x2="33" y2="17" />
        <line x1="5" y1="5" x2="9" y2="9" /><line x1="25" y1="25" x2="29" y2="29" />
        <line x1="29" y1="5" x2="25" y2="9" /><line x1="5" y1="29" x2="9" y2="25" />
      </g>
      <circle cx="17" cy="17" r="12" stroke="#f4d89e" strokeWidth="0.3" strokeDasharray="1 2" fill="none" opacity="0.5" />
    </svg>
  )
}
