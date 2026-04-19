import { useEffect, useRef } from 'react'

interface Star {
  x: number; y: number; r: number; baseA: number
  twinkleSpeed: number; phase: number; hue: 'gold' | 'blue' | 'white'
}
interface BrightStar { x: number; y: number; r: number; phase: number; hue: 'gold' | 'white' }
interface ShootingStar { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }

export default function Cosmos({ density = 1 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)

    const baseCount = Math.floor((w * h) / 3200)
    const count = Math.floor(baseCount * density)

    const stars: Star[] = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      baseA: Math.random() * 0.7 + 0.2,
      twinkleSpeed: Math.random() * 0.002 + 0.0004,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.15 ? 'gold' : Math.random() < 0.2 ? 'blue' : 'white',
    }))

    const brights: BrightStar[] = Array.from({ length: Math.max(3, Math.floor(density * 5)) }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.4 + 1.2,
      phase: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.5 ? 'gold' : 'white',
    }))

    let shoot: ShootingStar | null = null
    let nextShootAt = performance.now() + 3500 + Math.random() * 6000

    const onResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h)

      const grd = ctx.createRadialGradient(w * 0.75, h * 0.2, 0, w * 0.75, h * 0.2, Math.max(w, h) * 0.6)
      grd.addColorStop(0, 'rgba(74, 111, 212, 0.06)')
      grd.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, w, h)

      for (const s of stars) {
        const a = s.baseA * (0.55 + 0.45 * Math.sin(t * s.twinkleSpeed + s.phase))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle =
          s.hue === 'gold' ? `rgba(244,216,158,${a})` :
          s.hue === 'blue' ? `rgba(180,200,255,${a})` : `rgba(255,255,255,${a})`
        ctx.fill()
      }

      for (const b of brights) {
        const a = 0.6 + 0.4 * Math.sin(t * 0.001 + b.phase)
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = b.hue === 'gold' ? `rgba(244,216,158,${a})` : `rgba(255,255,255,${a})`
        ctx.fill()
        ctx.strokeStyle = b.hue === 'gold' ? `rgba(244,216,158,${a * 0.6})` : `rgba(255,255,255,${a * 0.6})`
        ctx.lineWidth = 0.6
        const spike = b.r * 5
        ctx.beginPath()
        ctx.moveTo(b.x - spike, b.y); ctx.lineTo(b.x + spike, b.y)
        ctx.moveTo(b.x, b.y - spike); ctx.lineTo(b.x, b.y + spike)
        ctx.stroke()
      }

      if (!shoot && t > nextShootAt) {
        shoot = {
          x: Math.random() * w * 0.8 + w * 0.2, y: Math.random() * h * 0.3,
          vx: -2.8 - Math.random() * 1.5, vy: 1.6 + Math.random() * 0.8,
          life: 0, maxLife: 90,
        }
      }
      if (shoot) {
        shoot.x += shoot.vx; shoot.y += shoot.vy; shoot.life += 1
        const a = Math.sin((shoot.life / shoot.maxLife) * Math.PI)
        const tailLen = 90
        const mag = Math.hypot(shoot.vx, shoot.vy)
        const tx = shoot.x - shoot.vx * (tailLen / mag)
        const ty = shoot.y - shoot.vy * (tailLen / mag)
        const grad = ctx.createLinearGradient(shoot.x, shoot.y, tx, ty)
        grad.addColorStop(0, `rgba(255,255,255,${a})`)
        grad.addColorStop(1, `rgba(255,255,255,0)`)
        ctx.strokeStyle = grad; ctx.lineWidth = 1.2
        ctx.beginPath(); ctx.moveTo(shoot.x, shoot.y); ctx.lineTo(tx, ty); ctx.stroke()
        ctx.beginPath(); ctx.arc(shoot.x, shoot.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill()
        if (shoot.life > shoot.maxLife) { shoot = null; nextShootAt = t + 4500 + Math.random() * 6000 }
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', onResize) }
  }, [density])

  return (
    <div className="cosmos">
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
      <SaturnDeco />
    </div>
  )
}

function SaturnDeco() {
  return (
    <svg className="saturn-deco" viewBox="0 0 400 400" fill="none">
      <defs>
        <radialGradient id="saturnBody" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f4d89e" /><stop offset="55%" stopColor="#c9a776" /><stop offset="100%" stopColor="#7a5a2d" />
        </radialGradient>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(232,192,125,0)" /><stop offset="30%" stopColor="rgba(232,192,125,0.7)" />
          <stop offset="70%" stopColor="rgba(232,192,125,0.7)" /><stop offset="100%" stopColor="rgba(232,192,125,0)" />
        </linearGradient>
      </defs>
      <g transform="translate(200 200) rotate(-22)">
        <ellipse cx="0" cy="0" rx="170" ry="24" stroke="url(#ringGrad)" strokeWidth="1.2" fill="none" opacity="0.9" />
        <ellipse cx="0" cy="0" rx="150" ry="20" stroke="url(#ringGrad)" strokeWidth="0.8" fill="none" opacity="0.6" />
        <ellipse cx="0" cy="0" rx="130" ry="16" stroke="url(#ringGrad)" strokeWidth="0.6" fill="none" opacity="0.4" />
      </g>
      <circle cx="200" cy="200" r="70" fill="url(#saturnBody)" />
      <ellipse cx="200" cy="186" rx="70" ry="3" fill="rgba(122,90,45,0.35)" />
      <ellipse cx="200" cy="210" rx="70" ry="4" fill="rgba(122,90,45,0.25)" />
      <g transform="translate(200 200) rotate(-22)">
        <path d="M -170 0 A 170 24 0 0 0 170 0" stroke="url(#ringGrad)" strokeWidth="1.4" fill="none" />
        <path d="M -150 0 A 150 20 0 0 0 150 0" stroke="url(#ringGrad)" strokeWidth="1" fill="none" opacity="0.7" />
      </g>
    </svg>
  )
}
