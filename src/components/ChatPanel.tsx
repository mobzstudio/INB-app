import { useEffect, useRef } from 'react'
import type { Analysis } from '../maia/types'
import { AnalysisCard } from './AnalysisCard'
import { Mark } from './icons'

export type ChatMessage = {
  id: string
  role: 'user' | 'maia'
  text: string
  analysis?: Analysis
  suggestions?: string[]
}

type Props = {
  messages: ChatMessage[]
  draft: string
  thinking: boolean
  onDraft: (value: string) => void
  onSend: (text?: string) => void
  onAction: (analysis: Analysis) => void
  onFocusMarker: (markerId: string) => void
}

export function ChatPanel({
  messages,
  draft,
  thinking,
  onDraft,
  onSend,
  onAction,
  onFocusMarker,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, thinking])

  return (
    <aside className="maia" aria-label="Conversa com a Maia">
      <header className="maia-top">
        <div className="maia-id">
          <Mark size={36} />
          <div>
            <strong>Maia</strong>
            <span>Seus exames e marcadores</span>
          </div>
        </div>
      </header>
      <div className="thread">
        {messages.map((message) => (
          <div key={message.id} className={`bubble role-${message.role}`}>
            {message.role === 'maia' ? <span className="who">Maia</span> : null}
            <p>{message.text}</p>
            {message.analysis ? (
              <AnalysisCard analysis={message.analysis} onAction={onAction} onFocusMarker={onFocusMarker} />
            ) : null}
            {message.suggestions ? (
              <div className="chips">
                {message.suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => onSend(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {thinking ? (
          <div className="bubble role-maia thinking" aria-live="polite">
            <span className="who">Maia</span>
            <p>Estou lendo os seus marcadores…</p>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>
      <form
        className="composer"
        onSubmit={(event) => {
          event.preventDefault()
          onSend()
          fieldRef.current?.focus()
        }}
      >
        <label className="sr" htmlFor="maia-draft">
          Mensagem para a Maia
        </label>
        <textarea
          id="maia-draft"
          ref={fieldRef}
          rows={2}
          placeholder="Pergunte sobre um exame ou marcador seu"
          value={draft}
          onChange={(event) => onDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSend()
            }
          }}
        />
        <button type="submit" className="send" disabled={!draft.trim() || thinking}>
          Enviar
        </button>
      </form>
    </aside>
  )
}
