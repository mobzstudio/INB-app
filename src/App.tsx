import { useState, type ReactNode } from 'react'
import { ChatPanel, type ChatMessage } from './components/ChatPanel'
import { IconAgenda, IconChart, IconOverview, IconPeople, Mark } from './components/icons'
import { Views } from './components/Views'
import { CLINIC } from './data/clinic'
import type { AgendaFilter } from './data/selectors'
import { WELCOME, replyTo } from './maia/engine'
import type { Analysis, AppView } from './maia/types'

type Filter = AgendaFilter | 'altered' | undefined

const NAV: { id: AppView; label: string; icon: ReactNode }[] = [
  { id: 'overview', label: 'Início', icon: <IconOverview /> },
  { id: 'agenda', label: 'Agenda', icon: <IconAgenda /> },
  { id: 'patients', label: 'Pacientes', icon: <IconPeople /> },
  { id: 'indicators', label: 'Indicadores', icon: <IconChart /> },
]

export function App() {
  const [view, setView] = useState<AppView>('overview')
  const [filter, setFilter] = useState<Filter>('today')
  const [filterLabel, setFilterLabel] = useState<string | undefined>()
  const [patientId, setPatientId] = useState<string | undefined>()
  const [query, setQuery] = useState('')
  const [maiaOpen, setMaiaOpen] = useState(true)
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'maia', text: WELCOME.text, suggestions: WELCOME.suggestions },
  ])

  function go(next: AppView, nextFilter?: Filter, label?: string) {
    setView(next)
    if (next !== 'patient') setPatientId(undefined)
    setFilter(nextFilter)
    setFilterLabel(label)
  }

  function openPatient(id: string) {
    setPatientId(id)
    setView('patient')
    setFilter(undefined)
    setFilterLabel(undefined)
    if (window.innerWidth < 1180) setMaiaOpen(false)
  }

  function applyAnalysis(analysis: Analysis) {
    const action = analysis.action
    if (!action) return
    setView(action.view)
    setFilter(action.filter)
    setFilterLabel(action.label)
    setPatientId(action.patientId)
    if (window.innerWidth < 1180) setMaiaOpen(false)
  }

  function send(preset?: string) {
    const content = (preset ?? draft).trim()
    if (!content || thinking) return
    setMaiaOpen(true)
    setDraft('')
    const userId = `u-${Date.now()}`
    setMessages((current) => [...current, { id: userId, role: 'user', text: content }])
    setThinking(true)
    const contextId = patientId
    window.setTimeout(() => {
      const reply = replyTo(content, { patientId: contextId })
      setMessages((current) => [
        ...current,
        {
          id: `m-${Date.now()}`,
          role: 'maia',
          text: reply.text,
          analysis: reply.analysis,
          suggestions: reply.suggestions,
        },
      ])
      setThinking(false)
    }, 680)
  }

  return (
    <div className={maiaOpen ? 'app maia-open' : 'app'}>
      <aside className="sidebar">
        <div className="brand">
          <Mark />
          <div>
            <strong>INB</strong>
            <span>Health</span>
          </div>
        </div>
        <nav>
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={view === item.id || (item.id === 'patients' && view === 'patient') ? 'is-on' : undefined}
              onClick={() => go(item.id, item.id === 'agenda' ? 'today' : undefined)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button type="button" className="maia-launch" onClick={() => setMaiaOpen(true)}>
          <Mark size={22} />
          <span>Falar com a Maia</span>
        </button>
        <footer className="me">
          <span>MA</span>
          <div>
            <strong>{CLINIC.clinician.name}</strong>
            <small>{CLINIC.clinician.role}</small>
          </div>
        </footer>
      </aside>
      <main>
        <Views
          view={view}
          filter={filter}
          filterLabel={filterLabel}
          patientId={patientId}
          query={query}
          onQuery={setQuery}
          onOpenPatient={openPatient}
          onAsk={send}
          onNavigate={(next, nextFilter) => go(next, nextFilter)}
        />
      </main>
      {maiaOpen ? (
        <ChatPanel
          messages={messages}
          draft={draft}
          thinking={thinking}
          onDraft={setDraft}
          onSend={send}
          onAction={applyAnalysis}
          onOpenPatient={openPatient}
          onClose={() => setMaiaOpen(false)}
        />
      ) : null}
    </div>
  )
}
