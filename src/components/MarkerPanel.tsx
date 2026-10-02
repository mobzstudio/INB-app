import {
  latestPoint,
  nextVisit,
  sessionMarkers,
  sessionPatient,
  statusLabel,
  type MarkerStatus,
} from '../data/markers'
import { formatDay, professionalById } from '../data/selectors'

type Props = {
  focusId?: string
  onAsk: (question: string) => void
}

export function MarkerPanel({ focusId, onAsk }: Props) {
  const markers = sessionMarkers()
  const visit = nextVisit()
  const doctor = visit ? professionalById(visit.professionalId) : undefined

  return (
    <aside className="markers" aria-label="Seus marcadores">
      <header className="markers-head">
        <p className="kicker">Sessão da paciente</p>
        <h2>{sessionPatient.name}</h2>
        <p>Os números ao lado são os seus. A Maia só lê este registro.</p>
      </header>
      <ul className="marker-list">
        {markers.map((marker) => {
          const latest = latestPoint(marker)
          return (
            <li key={marker.id} id={`marker-${marker.id}`} className={focusId === marker.id ? 'is-focus' : undefined}>
              <article className={`marker-card status-${marker.status}`}>
                <header>
                  <span>{marker.name}</span>
                  <em className={pillClass(marker.status)}>{statusLabel(marker.status)}</em>
                </header>
                <strong>{latest.display}</strong>
                <small>
                  {formatDay(latest.date)} · {marker.reference}
                </small>
                <button type="button" onClick={() => onAsk(marker.question)}>
                  Pedir para a Maia explicar
                </button>
              </article>
            </li>
          )
        })}
      </ul>
      {visit ? (
        <section className="visit-card">
          <p className="kicker">Próximo retorno</p>
          <strong>{visit.date === '2026-10-02' ? `Hoje · ${visit.time}` : `${formatDay(visit.date)} · ${visit.time}`}</strong>
          <p>
            {doctor?.name} · {visit.reason}
          </p>
          <button type="button" onClick={() => onAsk('Quando é a minha consulta?')}>
            Perguntar à Maia
          </button>
        </section>
      ) : null}
    </aside>
  )
}

function pillClass(status: MarkerStatus) {
  if (status === 'alterado') return 'pill pill-falta'
  if (status === 'atencao') return 'pill pill-aguardando'
  return 'pill pill-confirmada'
}
