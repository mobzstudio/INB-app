import { useEffect, useState } from 'react'
import type { Analysis, MarkerCard, MarkerStatus } from '../../shared/types'

type Props = {
  analysis: Analysis
  focusId?: string
  onOpenMaia: () => void
  onReplace: () => void
}

export function MarkersView({ analysis, focusId, onOpenMaia, onReplace }: Props) {
  const [tab, setTab] = useState<'marcadores' | 'exames'>('marcadores')
  const [showAll, setShowAll] = useState(false)
  const [open, setOpen] = useState<{ id: string; panel: 'why' | 'evolution' } | null>(null)
  const fora = analysis.markers.filter((marker) => marker.status === 'fora')

  useEffect(() => {
    if (!focusId) return
    const marker = analysis.markers.find((item) => item.id === focusId)
    if (marker && marker.status !== 'fora') setShowAll(true)
    document.getElementById(`marker-${focusId}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [focusId, analysis.markers])

  return (
    <section className="screen markers-screen">
      <nav className="tabs">
        <button type="button" className={tab === 'exames' ? 'is-on' : undefined} onClick={() => setTab('exames')}>
          Exames
        </button>
        <button type="button" className={tab === 'marcadores' ? 'is-on' : undefined} onClick={() => setTab('marcadores')}>
          Marcadores
        </button>
      </nav>
      {tab === 'exames' ? (
        <div className="exam-summary">
          <h1>Exame lido</h1>
          <p className="lede">{analysis.fileName}</p>
          <p>{analysis.briefing}</p>
          <button type="button" className="gold" onClick={onReplace}>
            Enviar outro exame
          </button>
        </div>
      ) : (
        <>
          <header className="markers-title">
            <h1>Marcadores</h1>
            <button type="button" className="link" onClick={() => setShowAll((value) => !value)}>
              {showAll ? 'Ver fora da faixa' : 'Ver todos'}
            </button>
          </header>
          <div className="summary">
            <Summary label="Fora da faixa" value={analysis.summary.fora} tone="fora" />
            <Summary label="Atenção" value={analysis.summary.atencao} tone="atencao" />
            <Summary label="Em faixa ótima" value={analysis.summary.otima} tone="otima" />
            <Summary label="Marcadores medidos" value={analysis.markerCount} tone="neutro" />
            <button type="button" className="maia-fab" onClick={onOpenMaia}>
              <Spark />
              Maia
            </button>
          </div>
          {showAll ? (
            <Grouped markers={analysis.markers} focusId={focusId} open={open} setOpen={setOpen} />
          ) : (
            <>
              <h2>Fora de Faixa ({fora.length})</h2>
              <ul className="rail">
                {fora.map((marker) => (
                  <Card key={marker.id} marker={marker} focusId={focusId} open={open} setOpen={setOpen} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  )
}

function Grouped({
  markers,
  focusId,
  open,
  setOpen,
}: {
  markers: MarkerCard[]
  focusId?: string
  open: { id: string; panel: 'why' | 'evolution' } | null
  setOpen: (value: { id: string; panel: 'why' | 'evolution' } | null) => void
}) {
  const groups: { status: MarkerStatus; title: string }[] = [
    { status: 'fora', title: 'Fora de Faixa' },
    { status: 'atencao', title: 'Atenção' },
    { status: 'otima', title: 'Em faixa ótima' },
  ]
  return (
    <div className="groups">
      {groups.map((group) => {
        const items = markers.filter((marker) => marker.status === group.status)
        return (
          <section key={group.status}>
            <h2>
              {group.title} ({items.length})
            </h2>
            <ul className="stack">
              {items.map((marker) => (
                <Card key={marker.id} marker={marker} focusId={focusId} open={open} setOpen={setOpen} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function Card({
  marker,
  focusId,
  open,
  setOpen,
}: {
  marker: MarkerCard
  focusId?: string
  open: { id: string; panel: 'why' | 'evolution' } | null
  setOpen: (value: { id: string; panel: 'why' | 'evolution' } | null) => void
}) {
  const panel = open?.id === marker.id ? open.panel : null
  function toggle(next: 'why' | 'evolution') {
    setOpen(panel === next ? null : { id: marker.id, panel: next })
  }
  return (
    <li id={`marker-${marker.id}`} className={focusId === marker.id ? 'is-focus' : undefined}>
      <article className={`marker status-${marker.status}`}>
        <header>
          <h3>{marker.name}</h3>
          <em>{marker.statusLabel}</em>
        </header>
        <p className="value">
          <strong>{marker.valueLabel}</strong> <span>{marker.unit}</span>
        </p>
        <div className="range" aria-hidden="true">
          <i style={{ left: `${marker.position * 100}%` }} />
        </div>
        <div className="scale">
          <span>{formatScale(marker.scale[0])}</span>
          <span>Faixa ideal</span>
          <span>{formatScale(marker.scale[1])}</span>
        </div>
        <div className="marker-actions">
          <button type="button" onClick={() => toggle('why')}>
            <Bulb />
            Por que importa?
          </button>
          <button type="button" onClick={() => toggle('evolution')}>
            <Trend />
            Evolução
            <Chevron />
          </button>
        </div>
        {panel === 'why' ? <p className="explain">{marker.why}</p> : null}
        {panel === 'evolution' ? <p className={`explain evolution-${marker.evolution}`}>{marker.evolutionText}</p> : null}
      </article>
    </li>
  )
}

function Summary({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <article className={`sum tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function formatScale(value: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value)
}

function Spark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.5 13.6 8.4 19.5 10 13.6 11.6 12 17.5 10.4 11.6 4.5 10 10.4 8.4 12 2.5Zm6.2 10.2.7 2.4 2.4.7-2.4.7-.7 2.4-.7-2.4-2.4-.7 2.4-.7.7-2.4Z"
      />
    </svg>
  )
}

function Bulb() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11.2V16h6v-1.8A6 6 0 0 0 12 3Z"
      />
    </svg>
  )
}

function Trend() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M4 16l5-5 3 3 8-8M14 6h6v6" />
    </svg>
  )
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M6 9l6 6 6-6" />
    </svg>
  )
}
