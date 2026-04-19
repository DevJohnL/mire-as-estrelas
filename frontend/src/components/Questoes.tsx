import { useState } from 'react'

const QUESTION = {
  subject: 'Física', topic: 'Cinemática · MRUV', difficulty: 'Média', year: 'ENEM 2023',
  statement: 'Um foguete experimental é lançado verticalmente a partir do repouso e acelera uniformemente a 8,0 m/s² durante os primeiros 12 segundos de voo. Após esse intervalo, os motores são desligados e o foguete passa a sofrer apenas a ação da gravidade (g = 10 m/s²).',
  ask: 'Qual é a altura máxima, em metros, atingida pelo foguete em relação ao solo?',
  choices: [
    { id: 'A', text: '576 m' }, { id: 'B', text: '1.036 m' },
    { id: 'C', text: '921 m' }, { id: 'D', text: '1.152 m' }, { id: 'E', text: '704 m' },
  ],
  correct: 'B',
  prereq: [
    { title: 'Movimento Uniformemente Variado', status: 'dominado' },
    { title: 'Equações de Torricelli', status: 'parcial' },
    { title: 'Queda livre', status: 'dominado' },
  ],
  base: [
    'Cinemática escalar · funções horárias',
    'Independência de movimentos compostos',
    'Aceleração da gravidade como MRUV com a = −g',
  ],
}

type LearnedId = 'nao' | 'mais' | 'sim'

export default function Questoes() {
  const [selected, setSelected] = useState<string | null>(null)
  const [reasoning, setReasoning] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [learned, setLearned] = useState<LearnedId | null>(null)
  const [step, setStep] = useState(0)

  const isCorrect = selected === QUESTION.correct
  const submit = () => { if (!selected) return; setSubmitted(true); setStep(0) }
  const next = () => setStep((s) => Math.min(3, s + 1))
  const reset = () => { setSelected(null); setReasoning(''); setSubmitted(false); setLearned(null); setStep(0) }

  return (
    <div className="page questoes">
      <div className="q-topline">
        <div className="col gap-8">
          <div className="eyebrow">sessão de treino · questão 7 de 20</div>
          <h1 className="display display-md">{QUESTION.topic}</h1>
        </div>
        <div className="q-meta">
          <span className="q-chip">{QUESTION.subject}</span>
          <span className="q-chip">{QUESTION.difficulty}</span>
          <span className="q-chip">{QUESTION.year}</span>
        </div>
      </div>

      <div className="qepb-strip">
        <QepbPip letter="Q" label="Questão" active done={submitted} locked={false} />
        <span className="qepb-line" />
        <QepbPip letter="E" label="Explicação" active={submitted && step >= 1} done={submitted && step >= 1} locked={!submitted} />
        <span className="qepb-line" />
        <QepbPip letter="P" label="Pré-requisito" active={submitted && step >= 2} done={submitted && step >= 2} locked={!submitted || step < 1} />
        <span className="qepb-line" />
        <QepbPip letter="B" label="Base" active={submitted && step >= 3} done={submitted && step >= 3} locked={!submitted || step < 2} />
      </div>

      <div className="card q-card">
        <p className="q-statement">{QUESTION.statement}</p>
        <p className="q-ask">{QUESTION.ask}</p>

        <div className="q-choices">
          {QUESTION.choices.map((c) => {
            const isSel = selected === c.id
            const isRight = c.id === QUESTION.correct
            const cls = ['q-choice', isSel ? 'selected' : '', submitted && isSel && !isRight ? 'wrong' : '', submitted && isRight ? 'right' : ''].join(' ')
            return (
              <button key={c.id} className={cls} onClick={() => !submitted && setSelected(c.id)} disabled={submitted}>
                <span className="q-choice-id">{c.id}</span>
                <span className="q-choice-text">{c.text}</span>
                {submitted && isRight && <span className="q-choice-flag">✓ gabarito</span>}
                {submitted && isSel && !isRight && <span className="q-choice-flag">× sua resposta</span>}
              </button>
            )
          })}
        </div>

        {!submitted && (
          <div className="q-reasoning-block">
            <div className="divider" style={{ margin: '22px 0' }} />
            <div className="eyebrow">seu raciocínio</div>
            <h3 className="display display-sm" style={{ marginTop: 6, marginBottom: 14 }}>
              Explique <span style={{ color: 'var(--gold)', fontWeight: 600 }}>por que</span> você escolheu essa alternativa
            </h3>
            <textarea className="q-textarea"
              placeholder="Ex: Calculei a velocidade no fim da queima (v=a·t), depois usei Torricelli..."
              value={reasoning} onChange={(e) => setReasoning(e.target.value)} rows={5} />
            <div className="q-reasoning-foot">
              <span className="mono-small">a IA analisa seu raciocínio, não apenas a resposta</span>
              <div className="row gap-12">
                <button className="btn btn-ghost btn-sm">pular ↓</button>
                <button className="btn btn-primary" disabled={!selected} onClick={submit}>validar com a IA →</button>
              </div>
            </div>
          </div>
        )}

        {submitted && (
          <div className="ia-response">
            <div className="divider" style={{ margin: '22px 0' }} />

            <div className={`ia-verdict ${isCorrect ? 'correct' : 'wrong'}`}>
              <div className="ia-avatar">
                <svg viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                  <circle cx="20" cy="20" r="10" fill="currentColor" opacity="0.15" />
                  <circle cx="20" cy="20" r="3" fill="currentColor" />
                  <circle cx="13" cy="13" r="0.8" fill="currentColor" />
                  <circle cx="28" cy="11" r="0.8" fill="currentColor" />
                  <circle cx="30" cy="27" r="0.8" fill="currentColor" />
                </svg>
              </div>
              <div className="col gap-8" style={{ flex: 1 }}>
                <div className="eyebrow" style={{ color: 'currentColor' }}>IA · Tars</div>
                <h3 className="display display-sm" style={{ color: 'var(--starlight)' }}>
                  {isCorrect ? 'Correto. Boa decolagem.' : 'Perto, mas o foguete passou da órbita.'}
                </h3>
                <p style={{ color: 'var(--moonlight)', fontSize: 15, maxWidth: 700 }}>
                  {isCorrect
                    ? 'Seu raciocínio dividiu corretamente o movimento em duas fases e aplicou Torricelli após o desligamento.'
                    : 'Você provavelmente esqueceu de somar a altura da fase propulsada com a altura extra após o desligamento dos motores.'}
                </p>
              </div>
              <div className="ia-score">
                <div className="display" style={{ fontSize: 40 }}>{isCorrect ? '+10' : '−4'}</div>
                <div className="mono-small">estelares</div>
              </div>
            </div>

            {step === 0 && (
              <div className="ia-next">
                <button className="btn btn-primary" onClick={next}>ver explicação passo a passo →</button>
              </div>
            )}

            {step >= 1 && (
              <div className="ia-section reveal">
                <SectionHeader n="E" kicker="passo a passo" title="Explicação detalhada" />
                <ol className="steps">
                  <li><div className="step-num">01</div><div><div className="step-title">Velocidade ao fim da queima</div><div className="step-body">v = a·t = 8 × 12 = <strong>96 m/s</strong></div></div></li>
                  <li><div className="step-num">02</div><div><div className="step-title">Altura da fase propulsada</div><div className="step-body">h₁ = ½·a·t² = ½ × 8 × 144 = <strong>576 m</strong></div></div></li>
                  <li><div className="step-num">03</div><div><div className="step-title">Altura extra em queda livre</div><div className="step-body">h₂ = v²/(2g) = 96²/20 = <strong>460,8 m</strong></div></div></li>
                  <li className="step-final"><div className="step-num" style={{ color: 'var(--gold)' }}>✦</div><div><div className="step-title" style={{ color: 'var(--gold)' }}>Altura máxima</div><div className="step-body" style={{ fontSize: 22, fontFamily: 'var(--serif)' }}>h₁ + h₂ ≈ <strong>1.036 m</strong></div></div></li>
                </ol>
                {step === 1 && <div className="ia-next"><button className="btn btn-primary" onClick={next}>ver pré-requisitos →</button></div>}
              </div>
            )}

            {step >= 2 && (
              <div className="ia-section reveal">
                <SectionHeader n="P" kicker="o que você precisa antes" title="Pré-requisitos" />
                <div className="prereq-tree">
                  {QUESTION.prereq.map((p, i) => (
                    <div key={i} className={`prereq-node status-${p.status}`}>
                      <div className="prereq-icon">{p.status === 'dominado' ? '✓' : p.status === 'parcial' ? '◐' : '○'}</div>
                      <div className="col" style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500 }}>{p.title}</div>
                        <div className="mono-small">status: {p.status}</div>
                      </div>
                      <button className="btn btn-sm btn-ghost">revisar →</button>
                    </div>
                  ))}
                </div>
                {step === 2 && <div className="ia-next"><button className="btn btn-primary" onClick={next}>ver a base teórica →</button></div>}
              </div>
            )}

            {step >= 3 && (
              <div className="ia-section reveal">
                <SectionHeader n="B" kicker="fundamentos teóricos" title="Base do conteúdo" />
                <ul className="base-list">
                  {QUESTION.base.map((b, i) => (
                    <li key={i} className="base-item">
                      <span className="base-num">{String(i + 1).padStart(2, '0')}</span>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500 }}>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="calib" style={{ marginTop: 24 }}>
                  <div className="eyebrow">calibre sua memória</div>
                  <h3 className="display display-sm" style={{ marginTop: 6, marginBottom: 4 }}>Como você se sente sobre esse conteúdo agora?</h3>
                  <p className="mono-small">sua resposta alimenta o motor de revisão espaçada</p>
                  <div className="calib-btns">
                    {([
                      { id: 'nao' as LearnedId, label: 'Não aprendi', sub: 'revisar em 1 dia', glyph: '◔' },
                      { id: 'mais' as LearnedId, label: 'Mais ou menos', sub: 'revisar em 3 dias', glyph: '◑' },
                      { id: 'sim' as LearnedId, label: 'Aprendi', sub: 'revisar em 10 dias', glyph: '●' },
                    ]).map((b) => (
                      <button key={b.id} className={`calib-btn ${learned === b.id ? 'active' : ''} calib-${b.id}`} onClick={() => setLearned(b.id)}>
                        <span className="calib-glyph">{b.glyph}</span>
                        <span className="calib-label">{b.label}</span>
                        <span className="calib-sub">{b.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="q-footnav">
                  <button className="btn btn-ghost" onClick={reset}>← refazer questão</button>
                  <span className="lyric-whisper" style={{ fontSize: 14 }}>persista — você é capaz de voar por cima das vozes.</span>
                  <button className="btn btn-primary" disabled={!learned}>próxima órbita →</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function QepbPip({ letter, label, active, done, locked }: { letter: string; label: string; active?: boolean; done?: boolean; locked?: boolean }) {
  return (
    <div className={`qepb-pip ${active ? 'active' : ''} ${done ? 'done' : ''} ${locked ? 'locked' : ''}`}>
      <div className="qepb-pip-circle">{letter}</div>
      <div className="qepb-pip-label">{label}</div>
    </div>
  )
}

function SectionHeader({ n, kicker, title }: { n: string; kicker: string; title: string }) {
  return (
    <div className="ia-section-head">
      <div className="ia-section-letter">{n}</div>
      <div className="col">
        <div className="eyebrow">{kicker}</div>
        <h3 className="display display-sm" style={{ marginTop: 4 }}>{title}</h3>
      </div>
    </div>
  )
}
