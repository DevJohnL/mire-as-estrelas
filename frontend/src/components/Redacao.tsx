import { useState, useRef } from 'react'

type FeedTab = 'temas' | 'noticias' | 'filmes'
interface FileInfo { name: string; size: number; type: string }

export default function Redacao() {
  const [file, setFile] = useState<FileInfo | null>(null)
  const [context, setContext] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [feedTab, setFeedTab] = useState<FeedTab>('temas')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile({ name: f.name, size: f.size, type: f.type })
    setAnalyzing(true); setAnalyzed(false)
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true) }, 2400)
  }

  const clearFile = () => { setFile(null); setAnalyzed(false); setAnalyzing(false) }

  return (
    <div className="page redacao">
      <div className="r-topline">
        <div>
          <div className="eyebrow">laboratório orbital · redação ENEM</div>
          <h1 className="display display-md" style={{ marginTop: 10 }}>
            Envie sua redação — <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Tars</span> a lê como uma banca.
          </h1>
        </div>
        <div className="r-stats">
          <div className="r-stat"><div className="display" style={{ fontSize: 32, color: 'var(--gold)' }}>780</div><div className="mono-small">última nota</div></div>
          <div className="r-stat"><div className="display" style={{ fontSize: 32 }}>14</div><div className="mono-small">redações enviadas</div></div>
        </div>
      </div>

      <div className="r-grid">
        <div className="col gap-20">
          <div
            className={`r-drop ${dragOver ? 'over' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
            onClick={() => !file && inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" hidden accept="image/*,.pdf,.docx,.txt"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {!file && (
              <>
                <div className="r-drop-orbit">
                  <svg viewBox="0 0 120 120" className="r-drop-icon">
                    <defs><radialGradient id="dropGlow"><stop offset="0%" stopColor="rgba(232,192,125,0.3)" /><stop offset="100%" stopColor="rgba(232,192,125,0)" /></radialGradient></defs>
                    <circle cx="60" cy="60" r="58" fill="url(#dropGlow)" />
                    <circle cx="60" cy="60" r="30" stroke="var(--gold)" strokeWidth="0.8" strokeDasharray="3 4" fill="none" />
                    <circle cx="60" cy="60" r="6" fill="var(--gold)" />
                    <path d="M60 40 L60 80 M50 70 L60 80 L70 70" stroke="var(--starlight)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="display display-sm" style={{ marginTop: 18 }}>Arraste sua redação para a órbita</div>
                <p className="mono-small" style={{ marginTop: 8 }}>jpg · png · pdf · docx · txt — ou clique para escolher</p>
                <div className="r-drop-formats">
                  <span className="r-format">📸 foto do manuscrito</span>
                  <span className="r-format">📄 arquivo digital</span>
                </div>
              </>
            )}
            {file && (
              <div className="r-file">
                <div className="r-file-icon">
                  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1"><path d="M10 4 L26 4 L32 10 L32 36 L10 36 Z M26 4 L26 10 L32 10" /></svg>
                </div>
                <div className="col gap-8" style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{file.name}</div>
                  <div className="mono-small">{(file.size / 1024).toFixed(1)} kb · {file.type || 'arquivo'}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); clearFile() }}>remover</button>
              </div>
            )}
          </div>

          <div className="card">
            <div className="eyebrow">contexto para a IA</div>
            <h3 className="display display-sm" style={{ marginTop: 6, marginBottom: 12 }}>O que você quis dizer?</h3>
            <p style={{ color: 'var(--dust)', fontSize: 13, marginBottom: 14, maxWidth: 520 }}>
              Explique sua intenção, a tese que quis defender ou o repertório que usou.
            </p>
            <textarea className="q-textarea" rows={4}
              placeholder="Ex: quis defender que o acesso à educação digital é um direito fundamental, usei como repertório a LDB..."
              value={context} onChange={(e) => setContext(e.target.value)} />
          </div>
        </div>

        <div className="col gap-20">
          {!file && <PlaceholderAnalysis />}
          {analyzing && <AnalysisLoading />}
          {analyzed && <AnalysisResult />}
        </div>
      </div>

      <div className="card feed-card">
        <div className="card-head">
          <div>
            <div className="eyebrow">sinais do universo · curadoria IA</div>
            <h2 className="display display-sm" style={{ marginTop: 6 }}>Repertório para sua próxima redação</h2>
          </div>
          <div className="feed-tabs">
            {([{ id: 'temas' as FeedTab, label: 'Temas sugeridos' }, { id: 'noticias' as FeedTab, label: 'Atualidades' }, { id: 'filmes' as FeedTab, label: 'Filmes & livros' }]).map((t) => (
              <button key={t.id} className={`feed-tab ${feedTab === t.id ? 'active' : ''}`} onClick={() => setFeedTab(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
        {feedTab === 'temas' && <FeedTemas />}
        {feedTab === 'noticias' && <FeedNoticias />}
        {feedTab === 'filmes' && <FeedFilmes />}
      </div>
    </div>
  )
}

function PlaceholderAnalysis() {
  return (
    <div className="card r-placeholder">
      <div className="r-placeholder-star">✦</div>
      <div className="display display-sm" style={{ textAlign: 'center' }}>Aguardando sua redação</div>
      <p className="lyric-whisper" style={{ textAlign: 'center', marginTop: 10 }}>
        tome distância e faça o melhor que puder.<br />a banca estelar está a postos.
      </p>
      <div className="r-criteria">
        <div className="eyebrow" style={{ textAlign: 'center', marginBottom: 12 }}>5 competências avaliadas</div>
        {['Domínio da norma culta', 'Compreensão da proposta', 'Argumentação', 'Coesão e coerência', 'Proposta de intervenção'].map((c, i) => (
          <div key={i} className="r-crit-row">
            <span className="r-crit-num">{String(i + 1).padStart(2, '0')}</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 15 }}>{c}</span>
            <span className="mono-small">0–200</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalysisLoading() {
  return (
    <div className="card r-loading">
      <div className="r-loading-orbit"><div className="r-loading-planet" /><div className="r-loading-ring" /></div>
      <div className="display display-sm" style={{ marginTop: 20 }}>Tars está lendo seu voo…</div>
      <ul className="r-loading-steps">
        <li className="active">✦ extraindo o texto</li>
        <li className="active">✦ verificando norma culta</li>
        <li>◦ cruzando com o contexto informado</li>
        <li>◦ pontuando as 5 competências</li>
      </ul>
    </div>
  )
}

function AnalysisResult() {
  const comps = [
    { n: 1, label: 'Norma culta',             score: 160, fb: 'boa. 2 desvios leves de concordância.' },
    { n: 2, label: 'Compreensão da proposta', score: 180, fb: 'tese clara e alinhada ao tema.' },
    { n: 3, label: 'Argumentação',            score: 160, fb: 'bom repertório, faltou 1 exemplo concreto.' },
    { n: 4, label: 'Coesão',                  score: 140, fb: 'transições entre §3 e §4 estão abruptas.' },
    { n: 5, label: 'Intervenção',             score: 160, fb: 'falta detalhar "meio" e "detalhamento".' },
  ]
  const total = comps.reduce((a, c) => a + c.score, 0)
  return (
    <div className="col gap-20">
      <div className="card r-verdict">
        <div className="row gap-20" style={{ alignItems: 'center' }}>
          <div className="r-score-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" stroke="rgba(42,51,102,0.6)" strokeWidth="1" fill="none" />
              <circle cx="60" cy="60" r="52" stroke="var(--gold)" strokeWidth="2" fill="none"
                strokeDasharray="326" strokeDashoffset={326 * (1 - total / 1000)} transform="rotate(-90 60 60)" strokeLinecap="round" />
            </svg>
            <div className="r-score-inner"><div className="display" style={{ fontSize: 40, color: 'var(--gold)' }}>{total}</div><div className="mono-small">/ 1000</div></div>
          </div>
          <div className="col gap-8" style={{ flex: 1 }}>
            <div className="eyebrow">parecer da IA · Tars</div>
            <h3 className="display display-sm">Voo estável. Pouco ajuste na rota de coesão.</h3>
            <p style={{ color: 'var(--moonlight)', fontSize: 14 }}>Sua redação mantém tese firme e repertório variado. O maior ganho está em suavizar as transições entre parágrafos.</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="eyebrow">competências · 5 eixos</div>
        <h3 className="display display-sm" style={{ marginTop: 6, marginBottom: 18 }}>Detalhamento</h3>
        <div className="comps">
          {comps.map((c) => (
            <div key={c.n} className="comp-row">
              <div className="comp-head">
                <span className="comp-n">C{c.n}</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 17, flex: 1 }}>{c.label}</span>
                <span className="comp-score">{c.score}<small>/200</small></span>
              </div>
              <div className="comp-track"><div className="comp-fill" style={{ width: `${(c.score / 200) * 100}%` }} /></div>
              <div className="comp-fb">{c.fb}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeedTemas() {
  const temas = [
    { tag: 'tendência alta', title: 'Desafios para a alfabetização digital no Brasil', why: 'convergência entre IA, educação e desigualdade — 3 bancas usaram tema próximo em 2025.' },
    { tag: 'emergente', title: 'O impacto da saúde mental no trabalho remoto', why: 'pauta recorrente pós-pandemia, com dados PNAD 2025 disponíveis.' },
    { tag: 'clássico', title: 'Mobilidade urbana e cidades sustentáveis', why: 'tema espiral — revisita ENEM a cada 4 anos, atualizado com COP30.' },
  ]
  return (
    <div className="feed-list">
      {temas.map((t, i) => (
        <div key={i} className="feed-card-item">
          <div className="feed-stars">
            <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="2" fill="var(--gold)" /><circle cx="10" cy="14" r="1" fill="var(--moonlight)" opacity="0.6" /><circle cx="32" cy="10" r="1.2" fill="var(--moonlight)" opacity="0.6" /></svg>
          </div>
          <div className="col gap-8" style={{ flex: 1 }}>
            <span className="feed-tag">{t.tag}</span>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{t.title}</div>
            <div className="mono-small" style={{ maxWidth: 540 }}>{t.why}</div>
          </div>
          <button className="btn btn-sm">gerar proposta →</button>
        </div>
      ))}
    </div>
  )
}

function FeedNoticias() {
  const news = [
    { src: 'Folha', date: 'há 2h',  title: 'COP30 começa em Belém com foco em amazônia e financiamento climático', use: 'útil p/ meio ambiente, geopolítica' },
    { src: 'BBC',   date: 'há 6h',  title: 'Regulação de IA avança no Congresso; educação é ponto de atrito',   use: 'útil p/ tecnologia, educação' },
    { src: 'G1',    date: 'ontem',  title: 'IBGE: 28% dos jovens de 15–24 anos nem estudam nem trabalham',       use: 'dado p/ juventude, trabalho' },
    { src: 'Nexo',  date: '2 dias', title: 'Desertos alimentares atingem 34 milhões no Brasil',                  use: 'dado p/ fome, desigualdade' },
  ]
  return (
    <div className="feed-list">
      {news.map((n, i) => (
        <div key={i} className="feed-card-item">
          <div className="feed-src"><div className="feed-src-mark">{n.src[0]}</div><div><div className="mono-small">{n.src}</div><div className="mono-small" style={{ color: 'var(--dust)' }}>{n.date}</div></div></div>
          <div className="col gap-6" style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, lineHeight: 1.3 }}>{n.title}</div>
            <div className="mono-small">repertório: {n.use}</div>
          </div>
          <button className="btn btn-sm btn-ghost">salvar ✦</button>
        </div>
      ))}
    </div>
  )
}

function FeedFilmes() {
  const items = [
    { kind: 'filme', title: 'Ainda Estou Aqui',  year: 2024, why: 'ditadura, memória, direitos humanos.' },
    { kind: 'livro', title: 'Torto Arado',        year: 2019, why: 'trabalho, identidade, herança — repertório literário forte.' },
    { kind: 'série', title: 'Black Mirror · USS Callister', year: 2023, why: 'ética em IA e realidade virtual.' },
    { kind: 'filme', title: 'Cidade de Deus',     year: 2002, why: 'violência urbana, juventude, mobilidade social.' },
  ]
  return (
    <div className="feed-grid">
      {items.map((it, i) => (
        <div key={i} className="feed-tile">
          <div className="feed-tile-art">
            <span className="mono-small" style={{ letterSpacing: '0.2em', color: 'var(--dust)' }}>[ {it.kind.toUpperCase()} ]</span>
            <svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="12" stroke="var(--gold)" strokeWidth="0.5" fill="none" opacity="0.5" /><circle cx="30" cy="30" r="2" fill="var(--gold)" /></svg>
          </div>
          <div className="col gap-4">
            <div style={{ fontFamily: 'var(--serif)', fontSize: 19 }}>{it.title}</div>
            <div className="mono-small">{it.kind} · {it.year}</div>
            <div className="mono-small" style={{ color: 'var(--moonlight)', marginTop: 6 }}>{it.why}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
