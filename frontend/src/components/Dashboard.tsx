import { useState } from 'react'

type Period = 'dia' | 'semana' | 'mes'

export default function Dashboard({ userName = 'João Lucas' }: { userName?: string }) {
  const [period, setPeriod] = useState<Period>('semana')

  const stats = {
    dia:    { questoes: 34,  acerto: 72, horas: 2.4,  streak: 12 },
    semana: { questoes: 218, acerto: 68, horas: 16.2, streak: 12 },
    mes:    { questoes: 912, acerto: 71, horas: 72.5, streak: 12 },
  }[period]

  return (
    <div className="page dash">
      <div className="dash-hero">
        <div>
          <div className="eyebrow">Observatório · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <h1 className="display display-lg" style={{ marginTop: 14 }}>
            Boa noite,<br />
            <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{userName}</span>.
          </h1>
          <p className="lyric-whisper" style={{ marginTop: 18, maxWidth: 520 }}>
            Tome distância, calibre o telescópio e salte o mais alto que puder. Hoje sua meta está a{' '}
            <strong style={{ color: 'var(--gold)', fontWeight: 500 }}>3 questões</strong> de distância.
          </p>
        </div>
        <div className="dash-hero-side"><CountdownENEM /></div>
      </div>

      <div className="stats-strip">
        <div className="stats-tabs">
          {(['dia', 'semana', 'mes'] as Period[]).map((p) => (
            <button key={p} className={`stats-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p === 'dia' ? 'hoje' : p === 'semana' ? 'semana' : 'mês'}
            </button>
          ))}
        </div>
        <Stat label="questões resolvidas" value={stats.questoes} />
        <Stat label="taxa de acerto" value={`${stats.acerto}%`} accent />
        <Stat label="horas de órbita" value={stats.horas} suffix="h" />
        <Stat label="dias em sequência" value={stats.streak} suffix="🔥" />
      </div>

      <div className="dash-grid">
        <div className="card dash-constellation-card">
          <div className="card-head">
            <div>
              <div className="eyebrow">mapa de domínio</div>
              <h2 className="display display-sm" style={{ marginTop: 6 }}>Sua constelação</h2>
            </div>
            <div className="legend">
              <span><i className="dot dot-gold" /> acima de 70%</span>
              <span><i className="dot dot-blue" /> 40–70%</span>
              <span><i className="dot dot-dim" /> abaixo de 40%</span>
            </div>
          </div>
          <Constellation />
          <div className="constellation-footnote">
            <span className="mono-small">clique numa estrela para abrir o conteúdo</span>
          </div>
        </div>
        <div className="dash-side col gap-20">
          <PlanoHoje />
          <LacunasCard />
        </div>
      </div>

      <div className="dash-grid-b">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="eyebrow">relatório</div>
              <h2 className="display display-sm" style={{ marginTop: 6 }}>Velocidade orbital — últimos 7 dias</h2>
            </div>
            <button className="btn btn-sm btn-ghost">exportar →</button>
          </div>
          <WeeklyChart />
        </div>
        <MateriaProgress />
      </div>
    </div>
  )
}

function Stat({ label, value, suffix, accent }: { label: string; value: number | string; suffix?: string; accent?: boolean }) {
  return (
    <div className="stat">
      <div className="stat-value" style={{ color: accent ? 'var(--gold)' : 'var(--starlight)' }}>
        {value}{suffix && <span className="stat-suffix">{suffix}</span>}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

function CountdownENEM() {
  const target = new Date('2026-11-01T13:30:00')
  const diff = target.getTime() - Date.now()
  const days = Math.max(0, Math.floor(diff / 86400000))
  return (
    <div className="countdown">
      <div className="countdown-ring">
        <svg viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" stroke="rgba(42,51,102,0.6)" strokeWidth="1" fill="none" />
          <circle cx="60" cy="60" r="52" stroke="var(--gold)" strokeWidth="1.5" fill="none"
            strokeDasharray="326" strokeDashoffset={326 * (1 - days / 365)} strokeLinecap="round"
            transform="rotate(-90 60 60)" />
          <circle cx="60" cy="8" r="2.5" fill="var(--gold)" transform={`rotate(${(1 - days / 365) * 360} 60 60)`} />
        </svg>
        <div className="countdown-inner">
          <div className="display" style={{ fontSize: 42, color: 'var(--gold)' }}>{days}</div>
          <div className="eyebrow">dias p/ enem</div>
        </div>
      </div>
      <div className="countdown-meta">
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--dust)', letterSpacing: '0.15em' }}>1º DOMINGO · NOVEMBRO</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--moonlight)', marginTop: 4 }}>
          a contagem regressiva para o seu voo
        </div>
      </div>
    </div>
  )
}

function Constellation() {
  const subjects = [
    { id: 'mat',  label: 'Matemática', mastery: 0.74, x: 18, y: 40, size: 12 },
    { id: 'fis',  label: 'Física',     mastery: 0.52, x: 38, y: 28, size: 10 },
    { id: 'qui',  label: 'Química',    mastery: 0.31, x: 58, y: 45, size: 9 },
    { id: 'bio',  label: 'Biologia',   mastery: 0.63, x: 72, y: 22, size: 8 },
    { id: 'port', label: 'Português',  mastery: 0.81, x: 82, y: 62, size: 10 },
    { id: 'red',  label: 'Redação',    mastery: 0.55, x: 60, y: 78, size: 11 },
    { id: 'hist', label: 'História',   mastery: 0.68, x: 30, y: 72, size: 7 },
    { id: 'geo',  label: 'Geografia',  mastery: 0.49, x: 14, y: 68, size: 7 },
    { id: 'fil',  label: 'Filosofia',  mastery: 0.42, x: 48, y: 58, size: 6 },
  ]
  const edges = [['mat','fis'],['fis','qui'],['qui','bio'],['mat','qui'],['port','red'],['red','fil'],['fil','hist'],['hist','geo'],['bio','geo'],['mat','fil']]
  const byId = Object.fromEntries(subjects.map((s) => [s.id, s]))
  const colorFor = (m: number) => m >= 0.7 ? 'var(--gold)' : m >= 0.4 ? 'var(--nebula-blue)' : 'var(--dust)'
  const [hover, setHover] = useState<string | null>(null)

  return (
    <div className="constellation">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="constellation-lines">
        {edges.map(([a, b], i) => {
          const A = byId[a], B = byId[b]
          return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="rgba(232,192,125,0.14)" strokeWidth="0.12" strokeDasharray="0.6 1" />
        })}
      </svg>
      <div className="neb-blob" style={{ left: '20%', top: '50%' }} />
      <div className="neb-blob neb-blob-gold" style={{ left: '70%', top: '30%' }} />
      {subjects.map((s) => (
        <button key={s.id} className={`c-star ${hover === s.id ? 'hover' : ''}`}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)} title={s.label}>
          <span className="c-star-halo" style={{ background: `radial-gradient(circle, ${colorFor(s.mastery)}33, transparent 70%)`, width: s.size * 5, height: s.size * 5 }} />
          <span className="c-star-core" style={{ width: s.size, height: s.size, background: colorFor(s.mastery), boxShadow: `0 0 ${s.size * 1.8}px ${colorFor(s.mastery)}` }} />
          <span className="c-star-label" style={{ color: hover === s.id ? 'var(--gold)' : 'var(--moonlight)' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>{s.label}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--dust)', marginLeft: 6 }}>{Math.round(s.mastery * 100)}%</span>
          </span>
        </button>
      ))}
    </div>
  )
}

function PlanoHoje() {
  const tasks = [
    { done: true,  label: 'Funções do 2º grau · 12 questões', tag: 'Matemática', current: false },
    { done: true,  label: 'Leitura — Termoquímica (base)',     tag: 'Química',    current: false },
    { done: false, label: 'Cinemática — MRU e MRUV',           tag: 'Física',     current: true },
    { done: false, label: 'Revisar lacuna: estequiometria',    tag: 'Química',    current: false },
    { done: false, label: 'Redação — ensaio 40min',            tag: 'Redação',    current: false },
  ]
  const completed = tasks.filter((t) => t.done).length
  return (
    <div className="card">
      <div className="card-head">
        <div><div className="eyebrow">plano de voo</div><h3 className="display display-sm" style={{ marginTop: 6 }}>Hoje</h3></div>
        <div className="plan-progress"><span className="mono-small">{completed}/{tasks.length}</span></div>
      </div>
      <ul className="plan-list">
        {tasks.map((t, i) => (
          <li key={i} className={`plan-item ${t.done ? 'done' : ''} ${t.current ? 'current' : ''}`}>
            <span className="plan-dot" />
            <div className="col" style={{ flex: 1 }}>
              <span className="plan-label">{t.label}</span>
              <span className="plan-tag">{t.tag}</span>
            </div>
            {t.current && <button className="btn btn-primary btn-sm">iniciar →</button>}
          </li>
        ))}
      </ul>
    </div>
  )
}

function LacunasCard() {
  const gaps = [
    { topic: 'Estequiometria',    subject: 'Química',    severity: 'alta',  miss: 8 },
    { topic: 'Movimento Circular', subject: 'Física',    severity: 'média', miss: 5 },
    { topic: 'Geometria Analítica', subject: 'Matemática', severity: 'média', miss: 4 },
  ]
  return (
    <div className="card">
      <div className="card-head">
        <div><div className="eyebrow">pontos cegos</div><h3 className="display display-sm" style={{ marginTop: 6 }}>Lacunas identificadas</h3></div>
        <button className="btn btn-sm btn-ghost">ver todas →</button>
      </div>
      <div className="gaps">
        {gaps.map((g, i) => (
          <div key={i} className="gap-row">
            <div className="gap-bar">
              <div className={`gap-bar-fill sev-${g.severity}`} style={{ width: `${g.miss * 10}%`, height: '100%' }} />
            </div>
            <div className="col" style={{ flex: 1 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 17 }}>{g.topic}</span>
              <span className="mono-small">{g.subject} · {g.miss} erros recorrentes</span>
            </div>
            <span className={`sev-badge sev-${g.severity}`}>{g.severity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeeklyChart() {
  const data = [
    { d: 'SEG', q: 28, a: 72 }, { d: 'TER', q: 42, a: 65 }, { d: 'QUA', q: 31, a: 78 },
    { d: 'QUI', q: 51, a: 69 }, { d: 'SEX', q: 22, a: 82 }, { d: 'SÁB', q: 44, a: 71 }, { d: 'DOM', q: 0, a: 0 },
  ]
  const maxQ = 60
  return (
    <div className="weekly">
      <div className="weekly-grid">
        {[0, 25, 50, 75, 100].map((v) => (<div key={v} className="weekly-gridline"><span>{v}%</span></div>))}
      </div>
      <div className="weekly-bars">
        {data.map((d, i) => (
          <div key={i} className="weekly-col">
            <div className="weekly-bar-wrap">
              <div className="weekly-bar" style={{ height: `${(d.q / maxQ) * 100}%` }}>
                {d.q > 0 && <span className="weekly-bar-value">{d.q}</span>}
              </div>
              {d.a > 0 && (<div className="weekly-accuracy" style={{ bottom: `${d.a}%` }}><span className="weekly-accuracy-dot" /></div>)}
            </div>
            <div className="weekly-day">{d.d}</div>
          </div>
        ))}
      </div>
      <div className="weekly-legend">
        <span><i className="bar-swatch" /> questões</span>
        <span><i className="dot-swatch" /> % acerto</span>
      </div>
    </div>
  )
}

function MateriaProgress() {
  const mats = [
    { name: 'Matemática', color: '#e8c07d', mastery: 74, change: +6, strong: 'Álgebra',  weak: 'Geom. analítica' },
    { name: 'Física',     color: '#4a6fd4', mastery: 52, change: +3, strong: 'Mecânica', weak: 'Eletromagnet.' },
    { name: 'Química',    color: '#9b7fd4', mastery: 31, change: -2, strong: 'Orgânica',  weak: 'Estequiometria' },
  ]
  return (
    <div className="card">
      <div className="card-head">
        <div><div className="eyebrow">exatas · foco</div><h3 className="display display-sm" style={{ marginTop: 6 }}>Progresso por matéria</h3></div>
      </div>
      <div className="mats">
        {mats.map((m) => (
          <div key={m.name} className="mat-row">
            <div className="mat-header">
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{m.name}</div>
              <div className="row gap-12" style={{ alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 26, color: m.color }}>{m.mastery}%</span>
                <span className={`mat-change ${m.change >= 0 ? 'up' : 'down'}`}>{m.change >= 0 ? '↑' : '↓'} {Math.abs(m.change)}</span>
              </div>
            </div>
            <div className="mat-track">
              <div className="mat-fill" style={{ width: `${m.mastery}%`, background: `linear-gradient(90deg, ${m.color}44, ${m.color})` }} />
            </div>
            <div className="mat-foot">
              <span className="mono-small">forte: <strong>{m.strong}</strong></span>
              <span className="mono-small">fraco: <strong>{m.weak}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
