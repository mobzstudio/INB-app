import { CLINIC, STATUS_LABEL, patients, type Patient } from '../data/clinic'
import {
  alteredExams,
  appointmentsFor,
  countStatus,
  examsFor,
  filterAppointments,
  formatDay,
  formatLongDay,
  latestVital,
  pendingExams,
  percent,
  professionalById,
  professionalLoad,
  todayAppointments,
  type AgendaFilter,
  weekAppointments,
} from '../data/selectors'
import type { AppView } from '../maia/types'

type Filter = AgendaFilter | 'altered' | undefined

type Props = {
  view: AppView
  filter: Filter
  filterLabel?: string
  patientId?: string
  query: string
  onQuery: (value: string) => void
  onOpenPatient: (id: string) => void
  onAsk: (prompt: string) => void
  onNavigate: (view: AppView, filter?: Filter) => void
}

export function Views(props: Props) {
  if (props.view === 'agenda') return <Agenda {...props} />
  if (props.view === 'patients') return <PatientList {...props} />
  if (props.view === 'patient') return <PatientDetail {...props} />
  if (props.view === 'indicators') return <Indicators {...props} />
  return <Overview {...props} />
}

function PageHead({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string
  title: string
  lede?: string
}) {
  return (
    <header className="page-head">
      <p className="kicker">{eyebrow}</p>
      <h1>{title}</h1>
      {lede ? <p className="lede">{lede}</p> : null}
    </header>
  )
}

function FilterNote({ label }: { label?: string }) {
  if (!label) return null
  return <p className="filter-note">Maia abriu este recorte: {label}</p>
}

function Overview({ onOpenPatient, onAsk, onNavigate }: Props) {
  const today = todayAppointments()
  const missed = countStatus(today, 'falta')
  const waiting = countStatus(today, 'aguardando')
  const altered = new Set(alteredExams().map((exam) => exam.patientId)).size

  return (
    <section className="page">
      <PageHead
        eyebrow={`${CLINIC.name} · ${CLINIC.unit}`}
        title={`Bom dia, ${CLINIC.clinician.short}.`}
        lede={formatLongDay('2026-10-02')}
      />
      <div className="metric-grid page-metrics">
        <button type="button" className="metric tone-neutral" onClick={() => onNavigate('agenda', 'today')}>
          <span>Agenda de hoje</span>
          <strong>{today.length}</strong>
          <em>atendimentos</em>
        </button>
        <button type="button" className="metric tone-alert" onClick={() => onNavigate('agenda', 'noshow')}>
          <span>Falta hoje</span>
          <strong>{missed}</strong>
          <em>Camila Ferreira</em>
        </button>
        <button type="button" className="metric tone-warn" onClick={() => onNavigate('agenda', 'waiting')}>
          <span>Sem confirmação</span>
          <strong>{waiting}</strong>
          <em>na semana: 2</em>
        </button>
        <button type="button" className="metric tone-warn" onClick={() => onNavigate('patients', 'altered')}>
          <span>Exame alterado</span>
          <strong>{altered}</strong>
          <em>pacientes</em>
        </button>
      </div>
      <div className="split">
        <article className="panel">
          <header className="panel-head">
            <h2>Hoje na grade</h2>
            <button type="button" className="ghost" onClick={() => onAsk('Como está a agenda de hoje?')}>
              Pedir leitura à Maia
            </button>
          </header>
          <ul className="agenda-list">
            {today.map((item) => {
              const patient = patients.find((entry) => entry.id === item.patientId)
              return (
                <li key={item.id}>
                  <button type="button" onClick={() => onOpenPatient(item.patientId)}>
                    <time>{item.time}</time>
                    <span>
                      <strong>{patient?.name}</strong>
                      <small>
                        {item.reason} · {professionalById(item.professionalId)?.role}
                      </small>
                    </span>
                    <em className={`pill pill-${item.status}`}>{STATUS_LABEL[item.status]}</em>
                  </button>
                </li>
              )
            })}
          </ul>
        </article>
        <article className="panel">
          <header className="panel-head">
            <h2>Pedem ação</h2>
            <button type="button" className="ghost" onClick={() => onAsk('Onde estão os gargalos da semana?')}>
              Ver gargalos
            </button>
          </header>
          <ul className="alerts">
            <li>
              <span>Pré-natal</span>
              <strong>Camila Ferreira faltou às 10h.</strong>
              <button type="button" onClick={() => onOpenPatient('camila')}>
                Abrir ficha
              </button>
            </li>
            <li>
              <span>Diabetes</span>
              <strong>Otávio Lima ainda não confirmou as 14h, com glicemia 186.</strong>
              <button type="button" onClick={() => onAsk('Analise a evolução de Otávio Lima')}>
                Analisar
              </button>
            </li>
            <li>
              <span>Cardiologia</span>
              <strong>Eduardo Pacheco sem retorno e com LDL 168.</strong>
              <button type="button" onClick={() => onOpenPatient('eduardo')}>
                Abrir ficha
              </button>
            </li>
            <li>
              <span>Pós-operatório</span>
              <strong>Hemograma de Paulo Siqueira segue sem laudo.</strong>
              <button type="button" onClick={() => onOpenPatient('paulo')}>
                Abrir ficha
              </button>
            </li>
          </ul>
        </article>
      </div>
    </section>
  )
}

function Agenda({ filter, filterLabel, onOpenPatient, onNavigate }: Props) {
  const active: AgendaFilter = filter === 'week' || filter === 'noshow' || filter === 'waiting' ? filter : 'today'
  const list = filterAppointments(active)
  const tabs: { id: AgendaFilter; label: string }[] = [
    { id: 'today', label: 'Hoje' },
    { id: 'week', label: 'Semana' },
    { id: 'noshow', label: 'Faltas' },
    { id: 'waiting', label: 'Aguardando' },
  ]

  return (
    <section className="page">
      <PageHead eyebrow="Agenda" title="Grade da unidade" lede="Marina Alves, Henrique Costa e Sofia Prado." />
      <FilterNote label={filterLabel} />
      <div className="tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={active === tab.id ? 'is-on' : undefined}
            onClick={() => onNavigate('agenda', tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="table-wrap panel-table">
        <table>
          <thead>
            <tr>
              <th>Quando</th>
              <th>Paciente</th>
              <th>Motivo</th>
              <th>Profissional</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => {
              const patient = patients.find((entry) => entry.id === item.patientId)
              return (
                <tr key={item.id} className="is-link" onClick={() => onOpenPatient(item.patientId)}>
                  <td>
                    {active === 'today' ? item.time : `${formatDay(item.date)} · ${item.time}`}
                  </td>
                  <td>{patient?.name}</td>
                  <td>{item.reason}</td>
                  <td>{professionalById(item.professionalId)?.name}</td>
                  <td className={`cell-${item.status === 'falta' ? 'alert' : item.status === 'aguardando' ? 'warn' : 'good'}`}>
                    {STATUS_LABEL[item.status]}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function PatientList({ filter, filterLabel, query, onQuery, onOpenPatient }: Props) {
  const alteredIds = new Set(alteredExams().map((exam) => exam.patientId))
  const pendingIds = new Set(pendingExams().map((exam) => exam.patientId))
  const needle = query.trim().toLocaleLowerCase('pt-BR')
  const list = patients.filter((patient) => {
    const matchesQuery = !needle || patient.name.toLocaleLowerCase('pt-BR').includes(needle) || patient.conditions.join(' ').toLocaleLowerCase('pt-BR').includes(needle)
    const matchesFilter = filter === 'altered' ? alteredIds.has(patient.id) : true
    return matchesQuery && matchesFilter
  })

  return (
    <section className="page">
      <PageHead eyebrow="Pacientes" title="Prontuários da unidade" lede={`${patients.length} pessoas em acompanhamento neste recorte.`} />
      <FilterNote label={filterLabel} />
      <label className="search">
        <span className="sr">Buscar paciente</span>
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Buscar por nome ou condição"
        />
      </label>
      <ul className="people">
        {list.map((patient) => (
          <li key={patient.id}>
            <button type="button" onClick={() => onOpenPatient(patient.id)}>
              <span className="avatar">{initials(patient)}</span>
              <span>
                <strong>{patient.name}</strong>
                <small>
                  {patient.age} anos · {patient.conditions.join(' · ')}
                </small>
              </span>
              {alteredIds.has(patient.id) ? <em className="pill pill-falta">Exame alterado</em> : null}
              {!alteredIds.has(patient.id) && pendingIds.has(patient.id) ? <em className="pill pill-aguardando">Laudo pendente</em> : null}
            </button>
          </li>
        ))}
      </ul>
      {list.length === 0 ? <p className="empty">Nenhuma ficha com esse filtro.</p> : null}
    </section>
  )
}

function PatientDetail({ patientId, onAsk, onNavigate }: Props) {
  const patient = patients.find((entry) => entry.id === patientId) ?? patients[0]
  const vital = latestVital(patient)
  const exams = examsFor(patient.id)
  const visits = appointmentsFor(patient.id)

  return (
    <section className="page">
      <button type="button" className="back" onClick={() => onNavigate('patients')}>
        Voltar aos pacientes
      </button>
      <PageHead eyebrow="Prontuário" title={patient.name} lede={`${patient.age} anos · ${patient.conditions.join(' · ')}`} />
      <div className="detail-actions">
        <button type="button" className="solid" onClick={() => onAsk(`Analise a evolução de ${patient.name}`)}>
          Pedir análise à Maia
        </button>
      </div>
      <article className="panel note">
        <h2>Nota da equipe</h2>
        <p>{patient.notes}</p>
      </article>
      <div className="split">
        <article className="panel">
          <h2>Registros</h2>
          <ul className="timeline">
            {patient.vitals.map((entry) => (
              <li key={entry.date}>
                <time>{formatDay(entry.date)}</time>
                <span>{vitalLine(entry, vital?.date === entry.date)}</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h2>Exames</h2>
          <ul className="exam-list">
            {exams.map((exam) => (
              <li key={exam.id}>
                <strong>{exam.name}</strong>
                <span>{exam.unit ? `${exam.value} ${exam.unit}` : exam.value}</span>
                <em className={`pill pill-${exam.status === 'alterado' ? 'falta' : exam.status === 'pendente' ? 'aguardando' : 'confirmada'}`}>
                  {exam.status}
                </em>
              </li>
            ))}
          </ul>
        </article>
      </div>
      <article className="panel">
        <h2>Agenda desta ficha</h2>
        <ul className="agenda-list compact">
          {visits.map((item) => (
            <li key={item.id}>
              <div className="static-row">
                <time>
                  {formatDay(item.date)} · {item.time}
                </time>
                <span>
                  <strong>{item.reason}</strong>
                  <small>{professionalById(item.professionalId)?.name}</small>
                </span>
                <em className={`pill pill-${item.status}`}>{STATUS_LABEL[item.status]}</em>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}

function Indicators({ onAsk }: Props) {
  const week = weekAppointments()
  const rows = professionalLoad()
  const missed = countStatus(week, 'falta')
  const max = Math.max(...rows.map((row) => row.scheduled))

  return (
    <section className="page">
      <PageHead
        eyebrow="Indicadores"
        title="Semana de 28 set a 4 out"
        lede="Volume, falta e laudo. A Maia usa estes mesmos números na conversa."
      />
      <div className="metric-grid page-metrics">
        <div className="metric tone-neutral">
          <span>Horários</span>
          <strong>{week.length}</strong>
          <em>na grade</em>
        </div>
        <div className="metric tone-good">
          <span>Realizados</span>
          <strong>{countStatus(week, 'realizada')}</strong>
          <em>até ontem</em>
        </div>
        <div className="metric tone-alert">
          <span>Faltas</span>
          <strong>{missed}</strong>
          <em>{percent(missed, week.length)}% da semana</em>
        </div>
        <div className="metric tone-warn">
          <span>Laudos pendentes</span>
          <strong>{pendingExams().length}</strong>
          <em>hemograma</em>
        </div>
      </div>
      <article className="panel">
        <header className="panel-head">
          <h2>Carga por profissional</h2>
          <button type="button" className="ghost" onClick={() => onAsk('Como está a produtividade?')}>
            Pedir leitura à Maia
          </button>
        </header>
        <ul className="bars in-page">
          {rows.map((row) => (
            <li key={row.professional.id}>
              <div className="bar-label">
                <span>
                  {row.professional.name}
                  <small> · {row.professional.role}</small>
                </span>
                <b>
                  {row.scheduled} horários · {row.missed} faltas
                </b>
              </div>
              <div className="bar-track">
                <div className="bar-fill tone-neutral" style={{ width: `${(row.scheduled / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}

function initials(patient: Patient) {
  return patient.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

function vitalLine(
  entry: {
    systolic?: number
    diastolic?: number
    glucose?: number
    hba1c?: number
    weight?: number
    ldl?: number
  },
  latest: boolean,
) {
  const bits = [
    entry.systolic ? `PA ${entry.systolic}/${entry.diastolic}` : '',
    entry.glucose ? `Glicemia ${entry.glucose}` : '',
    entry.hba1c ? `HbA1c ${String(entry.hba1c).replace('.', ',')}` : '',
    entry.ldl ? `LDL ${entry.ldl}` : '',
    entry.weight ? `Peso ${String(entry.weight).replace('.', ',')} kg` : '',
  ].filter(Boolean)
  return `${bits.join(' · ')}${latest ? ' · mais recente' : ''}`
}
