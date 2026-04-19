import { useState, useEffect, useCallback } from 'react'
import { api, Question, AIFeedback, EvaluateResult } from '../services/api'
import { useUser } from '../hooks/useUser'

type Status = 'loading' | 'seeding' | 'ready' | 'evaluating' | 'done' | 'error'
type LearnedId = 'nao' | 'mais' | 'sim'

const SUBJECT_NAMES: Record<string, string> = {
  matematica: 'Matemática', fisica: 'Física', quimica: 'Química',
  biologia: 'Biologia', historia: 'História', geografia: 'Geografia',
  filosofia: 'Filosofia', sociologia: 'Sociologia', portugues: 'Português',
  literatura: 'Literatura', redacao: 'Redação',
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Fácil', 2: 'Fácil+', 3: 'Média', 4: 'Difícil', 5: 'Difícil+',
}

const LEARNED_MAP: Record<LearnedId, 1 | 2 | 3> = { sim: 1, mais: 2, nao: 3 }

export default function Questoes() {
  const userId = useUser()
  const [status, setStatus] = useState<Status>('loading')
  const [question, setQuestion] = useState<Question | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [reasoning, setReasoning] = useState('')
  const [result, setResult] = useState<EvaluateResult | null>(null)
  const [learned, setLearned] = useState<LearnedId | null>(null)
  const [step, setStep] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadQuestion = useCallback(async (seeded = false) => {
    setStatus(seeded ? 'seeding' : 'loading')
    try {
      const questions = await api.questions.list(undefined, 1)
      if (questions.length === 0) {
        if (!seeded) {
          await api.questions.seed()
          return loadQuestion(true)
        }
        setErrorMsg('Nenhuma questão disponível.')
        setStatus('error')
        return
      }
      setQuestion(questions[0])
      setStatus('ready')
    } catch {
      setErrorMsg('Erro ao carregar questão. Verifique se o backend está rodando.')
      setStatus('error')
    }
  }, [])

  useEffect(() => { loadQuestion() }, [loadQuestion])

  const submit = async () => {
    if (!selected || !question) return
    setStatus('evaluating')
    try {
      const res = await api.questions.evaluate({
        userId,
        questionId: question.id,
        chosenAnswer: selected,
        userExplanation: reasoning.trim() || 'Não informado',
      })
      setResult(res)
      setStatus('done')
      setStep(0)
    } catch {
      setErrorMsg('Erro ao avaliar. Tente novamente.')
      setStatus('ready')
    }
  }

  const handleLearned = async (l: LearnedId) => {
    setLearned(l)
    if (result?.performance.id) {
      await api.questions.updateSelfAssessment(result.performance.id, LEARNED_MAP[l]).catch(() => {})
    }
  }

  const redo = () => {
    setSelected(null)
    setReasoning('')
    setResult(null)
    setLearned(null)
    setStep(0)
    setErrorMsg(null)
    setStatus('ready')
  }

  const nextOrbit = async () => {
    setSelected(null)
    setReasoning('')
    setResult(null)
    setLearned(null)
    setStep(0)
    setErrorMsg(null)
    await loadQuestion()
  }

  if (status === 'loading' || status === 'seeding') {
    return (
      <div className="page questoes">
        <div className="card q-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div className="eyebrow">{status === 'seeding' ? 'importando questões do ENEM...' : 'carregando...'}</div>
          <h2 className="display display-md" style={{ marginTop: 12 }}>
            {status === 'seeding' ? 'Buscando questões na API do ENEM' : 'Preparando sua questão'}
          </h2>
          {status === 'seeding' && (
            <p className="mono-small" style={{ marginTop: 8, color: 'var(--moonlight)' }}>
              Isso pode levar alguns segundos na primeira vez.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (status === 'error' || !question) {
    return (
      <div className="page questoes">
        <div className="card q-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div className="eyebrow" style={{ color: '#e05c5c' }}>erro</div>
          <h2 className="display display-md" style={{ marginTop: 12 }}>{errorMsg ?? 'Algo deu errado'}</h2>
          <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => loadQuestion()}>
            tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const aiFeedback: AIFeedback | undefined = result?.aiFeedback
  const isCorrect = aiFeedback?.isCorrect ?? false
  const isDone = status === 'done'

  return (
    <div className="page questoes">
      <div className="q-topline">
        <div className="col gap-8">
          <div className="eyebrow">sessão de treino · ENEM {question.year}</div>
          <h1 className="display display-md">
            {SUBJECT_NAMES[question.subjectId] ?? question.subjectId}
          </h1>
        </div>
        <div className="q-meta">
          <span className="q-chip">{SUBJECT_NAMES[question.subjectId] ?? question.subjectId}</span>
          <span className="q-chip">{DIFFICULTY_LABELS[question.difficulty] ?? 'Média'}</span>
          <span className="q-chip">ENEM {question.year}</span>
        </div>
      </div>

      <div className="qepb-strip">
        <QepbPip letter="Q" label="Questão" active done={isDone} locked={false} />
        <span className="qepb-line" />
        <QepbPip letter="E" label="Explicação" active={isDone && step >= 1} done={isDone && step >= 1} locked={!isDone} />
        <span className="qepb-line" />
        <QepbPip letter="P" label="Pré-requisito" active={isDone && step >= 2} done={isDone && step >= 2} locked={!isDone || step < 1} />
        <span className="qepb-line" />
        <QepbPip letter="B" label="Base" active={isDone && step >= 3} done={isDone && step >= 3} locked={!isDone || step < 2} />
      </div>

      <div className="card q-card">
        <p className="q-statement" style={{ whiteSpace: 'pre-wrap' }}>{question.statement}</p>

        <div className="q-choices">
          {question.alternatives.map((c) => {
            const isSel = selected === c.key
            const isRight = c.key === question.correctAnswer
            const cls = [
              'q-choice',
              isSel ? 'selected' : '',
              isDone && isSel && !isRight ? 'wrong' : '',
              isDone && isRight ? 'right' : '',
            ].filter(Boolean).join(' ')
            return (
              <button
                key={c.key}
                className={cls}
                onClick={() => status === 'ready' && setSelected(c.key)}
                disabled={status !== 'ready'}
              >
                <span className="q-choice-id">{c.key}</span>
                <span className="q-choice-text">{c.text}</span>
                {isDone && isRight && <span className="q-choice-flag">✓ gabarito</span>}
                {isDone && isSel && !isRight && <span className="q-choice-flag">× sua resposta</span>}
              </button>
            )
          })}
        </div>

        {(status === 'ready' || status === 'evaluating') && (
          <div className="q-reasoning-block">
            <div className="divider" style={{ margin: '22px 0' }} />
            <div className="eyebrow">seu raciocínio</div>
            <h3 className="display display-sm" style={{ marginTop: 6, marginBottom: 14 }}>
              Explique <span style={{ color: 'var(--gold)', fontWeight: 600 }}>por que</span> você escolheu essa alternativa
            </h3>
            <textarea
              className="q-textarea"
              placeholder="Ex: Calculei a velocidade usando v = a·t, depois usei Torricelli para achar a altura..."
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              rows={5}
              disabled={status === 'evaluating'}
            />
            <div className="q-reasoning-foot">
              <span className="mono-small">
                {status === 'evaluating'
                  ? '⟳ TARS está avaliando seu raciocínio...'
                  : 'a IA analisa seu raciocínio, não apenas a resposta'}
              </span>
              <div className="row gap-12">
                <button
                  className="btn btn-primary"
                  disabled={!selected || status === 'evaluating'}
                  onClick={submit}
                >
                  {status === 'evaluating' ? 'avaliando...' : 'validar com a IA →'}
                </button>
              </div>
            </div>
            {errorMsg && (
              <p style={{ color: '#e05c5c', fontSize: 13, marginTop: 8 }}>{errorMsg}</p>
            )}
          </div>
        )}

        {isDone && aiFeedback && (
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
                  {isCorrect
                    ? aiFeedback.explanationQuality === 'solid'
                      ? 'Correto. Raciocínio sólido.'
                      : 'Correto, mas o raciocínio pode melhorar.'
                    : 'Resposta incorreta.'}
                </h3>
                <QualityBadge quality={aiFeedback.explanationQuality} />
              </div>
              <div className="ia-score">
                <div className="display" style={{ fontSize: 40 }}>{isCorrect ? '+10' : '−4'}</div>
                <div className="mono-small">estelares</div>
              </div>
            </div>

            {step === 0 && (
              <div className="ia-next">
                <button className="btn btn-primary" onClick={() => setStep(1)}>
                  ver explicação passo a passo →
                </button>
              </div>
            )}

            {step >= 1 && (
              <div className="ia-section reveal">
                <SectionHeader n="E" kicker="explicação da IA" title="O que aconteceu aqui" />
                <div style={{ color: 'var(--moonlight)', fontSize: 15, lineHeight: 1.75, maxWidth: 720 }}>
                  {aiFeedback.aiExplanation.split('\n').map((p, i) =>
                    p.trim() ? <p key={i} style={{ marginBottom: 12 }}>{p.trim()}</p> : null,
                  )}
                </div>
                {step === 1 && (
                  <div className="ia-next">
                    <button className="btn btn-primary" onClick={() => setStep(2)}>
                      ver pré-requisitos →
                    </button>
                  </div>
                )}
              </div>
            )}

            {step >= 2 && (
              <div className="ia-section reveal">
                <SectionHeader n="P" kicker="o que você precisa antes" title="Pré-requisitos" />
                {aiFeedback.prerequisitePath ? (
                  <div className="prereq-tree">
                    <div className="prereq-node status-parcial">
                      <div className="prereq-icon">◎</div>
                      <div className="col" style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500 }}>
                          {aiFeedback.prerequisitePath.topic}
                        </div>
                        <div className="mono-small">tópico da questão</div>
                      </div>
                    </div>
                    {aiFeedback.prerequisitePath.prerequisites.map((prereq, i) => (
                      <div key={i} className="prereq-node status-parcial">
                        <div className="prereq-icon">◐</div>
                        <div className="col" style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500 }}>
                            {prereq}
                          </div>
                          <div className="mono-small">pré-requisito</div>
                        </div>
                        <button className="btn btn-sm btn-ghost">revisar →</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prereq-node status-dominado" style={{ marginTop: 12 }}>
                    <div className="prereq-icon">✓</div>
                    <div className="col">
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500 }}>
                        Pré-requisitos dominados
                      </div>
                      <div className="mono-small">
                        seu raciocínio demonstrou domínio dos conceitos anteriores
                      </div>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="ia-next">
                    <button className="btn btn-primary" onClick={() => setStep(3)}>
                      ver base teórica →
                    </button>
                  </div>
                )}
              </div>
            )}

            {step >= 3 && (
              <div className="ia-section reveal">
                <SectionHeader n="B" kicker="fundamentos teóricos" title="Base do conteúdo" />

                {aiFeedback.prerequisitePath?.base && (
                  <ul className="base-list">
                    <li className="base-item">
                      <span className="base-num">01</span>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500 }}>
                        {aiFeedback.prerequisitePath.base}
                      </span>
                    </li>
                  </ul>
                )}

                {aiFeedback.youtubeVideos.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div className="eyebrow" style={{ marginBottom: 12 }}>vídeos recomendados</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {aiFeedback.youtubeVideos.map((v) => (
                        <a
                          key={v.videoId}
                          href={`https://www.youtube.com/watch?v=${v.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', gap: 12, alignItems: 'center',
                            padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          <img
                            src={v.thumbnailUrl} alt=""
                            style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
                          />
                          <div>
                            <div style={{ color: 'var(--starlight)', fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
                              {v.title}
                            </div>
                            <div className="mono-small" style={{ marginTop: 4 }}>{v.channelTitle}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="calib" style={{ marginTop: 24 }}>
                  <div className="eyebrow">calibre sua memória</div>
                  <h3 className="display display-sm" style={{ marginTop: 6, marginBottom: 4 }}>
                    Como você se sente sobre esse conteúdo agora?
                  </h3>
                  <p className="mono-small">sua resposta alimenta o motor de revisão espaçada</p>
                  <div className="calib-btns">
                    {([
                      { id: 'nao' as LearnedId, label: 'Não aprendi', sub: 'revisar em 1 dia', glyph: '◔' },
                      { id: 'mais' as LearnedId, label: 'Mais ou menos', sub: 'revisar em 3 dias', glyph: '◑' },
                      { id: 'sim' as LearnedId, label: 'Aprendi', sub: 'revisar em 10 dias', glyph: '●' },
                    ]).map((b) => (
                      <button
                        key={b.id}
                        className={`calib-btn ${learned === b.id ? 'active' : ''} calib-${b.id}`}
                        onClick={() => handleLearned(b.id)}
                      >
                        <span className="calib-glyph">{b.glyph}</span>
                        <span className="calib-label">{b.label}</span>
                        <span className="calib-sub">{b.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="q-footnav">
                  <button className="btn btn-ghost" onClick={redo}>← refazer questão</button>
                  <span className="lyric-whisper" style={{ fontSize: 14 }}>
                    persista — você é capaz de voar por cima das vozes.
                  </span>
                  <button className="btn btn-primary" disabled={!learned} onClick={nextOrbit}>
                    próxima órbita →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function QualityBadge({ quality }: { quality: AIFeedback['explanationQuality'] }) {
  const map = {
    solid: { label: 'Raciocínio sólido', color: '#4ade80' },
    partial: { label: 'Raciocínio parcial', color: 'var(--gold)' },
    guessed: { label: 'Chute detectado', color: '#e05c5c' },
  }
  const { label, color } = map[quality]
  return (
    <span style={{
      display: 'inline-block', fontSize: 12, fontFamily: 'var(--mono)',
      color, border: `1px solid ${color}`, borderRadius: 4,
      padding: '2px 8px', letterSpacing: '0.05em', alignSelf: 'flex-start',
    }}>
      {label}
    </span>
  )
}

function QepbPip({ letter, label, active, done, locked }: {
  letter: string; label: string; active?: boolean; done?: boolean; locked?: boolean
}) {
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
