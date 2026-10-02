import { useEffect, useRef, useState } from 'react'

export type ChatLine = { id: string; role: 'maia' | 'user'; text: string }

type Props = {
  messages: ChatLine[]
  thinking: boolean
  onClose: () => void
  onSend: (text: string) => void
}

const SUGGESTIONS = ['Quais estão fora da faixa?', 'O que piorou?', 'Por que o cortisol importa?']

export function MaiaChat({ messages, thinking, onClose, onSend }: Props) {
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, thinking])

  return (
    <section className="sheet" role="dialog" aria-label="Conversa com a Maia">
      <header>
        <strong>Maia</strong>
        <button type="button" onClick={onClose}>
          Fechar
        </button>
      </header>
      <div className="sheet-body">
        {messages.map((message) => (
          <p key={message.id} className={`line role-${message.role}`}>
            {message.text}
          </p>
        ))}
        {thinking ? <p className="line role-maia waiting">Estou olhando os seus cards…</p> : null}
        <div className="chips">
          {SUGGESTIONS.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => onSend(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
        <div ref={endRef} />
      </div>
      <form
        className="sheet-form"
        onSubmit={(event) => {
          event.preventDefault()
          const text = draft.trim()
          if (!text || thinking) return
          setDraft('')
          onSend(text)
        }}
      >
        <label className="sr" htmlFor="maia-draft">
          Dúvida para a Maia
        </label>
        <input
          id="maia-draft"
          value={draft}
          placeholder="Pergunte sobre um marcador"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" disabled={!draft.trim() || thinking}>
          Enviar
        </button>
      </form>
    </section>
  )
}
