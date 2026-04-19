import { useEffect } from 'react'

type RouteId = 'dashboard' | 'questoes' | 'redacao'

interface Props {
  open: boolean
  current: RouteId
  onNav: (id: RouteId) => void
  onClose: () => void
}

const items = [
  { id: 'dashboard' as RouteId, label: 'Observatório', sub: 'seu progresso', angle: -90, icon: 'dashboard' },
  { id: 'questoes' as RouteId, label: 'Questões', sub: 'metodologia QEPB', angle: 30, icon: 'questoes' },
  { id: 'redacao' as RouteId, label: 'Redação', sub: 'análise & temas', angle: 150, icon: 'redacao' },
]
const R = 230

export default function RadialMenu({ open, current, onNav, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={`radial-root ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="radial-scrim" />
      <div className="radial-stage" onClick={(e) => e.stopPropagation()}>
        <svg className="radial-orbits" viewBox="-300 -300 600 600" fill="none">
          <defs>
            <radialGradient id="orbitGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(232,192,125,0.15)" />
              <stop offset="100%" stopColor="rgba(232,192,125,0)" />
            </radialGradient>
          </defs>
          <circle cx="0" cy="0" r="280" fill="url(#orbitGlow)" />
          <circle cx="0" cy="0" r="230" stroke="rgba(232,192,125,0.18)" strokeWidth="0.8" strokeDasharray="2 4" />
          <circle cx="0" cy="0" r="180" stroke="rgba(232,192,125,0.12)" strokeWidth="0.6" strokeDasharray="2 4" />
          <circle cx="0" cy="0" r="130" stroke="rgba(232,192,125,0.08)" strokeWidth="0.6" strokeDasharray="2 4" />
          {items.map((it) => {
            const rad = (it.angle * Math.PI) / 180
            return (
              <line key={it.id} x1="0" y1="0" x2={Math.cos(rad) * R} y2={Math.sin(rad) * R}
                stroke={current === it.id ? 'rgba(232,192,125,0.5)' : 'rgba(232,192,125,0.15)'}
                strokeWidth="0.6" strokeDasharray="3 6" />
            )
          })}
        </svg>

        <div className="radial-center">
          <div className="radial-center-inner">
            <div className="eyebrow" style={{ marginBottom: 6 }}>Mapa Estelar</div>
            <div className="display display-sm" style={{ color: 'var(--starlight)' }}>
              Escolha sua<br /><span style={{ color: 'var(--gold)', fontWeight: 600 }}>constelação</span>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={onClose}>fechar (esc)</button>
          </div>
        </div>

        {items.map((it, i) => {
          const rad = (it.angle * Math.PI) / 180
          const x = Math.cos(rad) * R
          const y = Math.sin(rad) * R
          return (
            <button
              key={it.id}
              className={`radial-item ${current === it.id ? 'active' : ''}`}
              style={{
                transform: open
                  ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`
                  : `translate(-50%, -50%) scale(0.4)`,
                transitionDelay: open ? `${i * 70 + 120}ms` : '0ms',
              }}
              onClick={() => onNav(it.id)}
            >
              <div className="radial-item-star"><MenuIcon kind={it.icon} /></div>
              <div className="radial-item-label">
                <div className="eyebrow" style={{ color: current === it.id ? 'var(--gold)' : 'var(--dust)' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 26, color: current === it.id ? 'var(--gold)' : 'var(--starlight)' }}>
                  {it.label}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dust)', letterSpacing: '0.1em' }}>{it.sub}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MenuIcon({ kind }: { kind: string }) {
  if (kind === 'dashboard') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="12" r="2" /><circle cx="5" cy="7" r="1" /><circle cx="18" cy="5" r="1" />
      <circle cx="20" cy="15" r="1" /><circle cx="7" cy="18" r="1" />
      <path d="M12 12 L5 7 M12 12 L18 5 M12 12 L20 15 M12 12 L7 18" strokeDasharray="1 2" opacity="0.5" />
    </svg>
  )
  if (kind === 'questoes') return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M9 8.5 a3 3 0 1 1 3 3 v2" /><circle cx="12" cy="17" r="0.7" fill="currentColor" />
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M4 20 L16 8 L18 10 L6 22 Z" transform="translate(0 -3)" />
      <path d="M14 8 L16 10" /><path d="M5 19 L9 19" strokeWidth="0.8" />
    </svg>
  )
}
