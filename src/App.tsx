import { useEffect, useState } from 'react'
import { ChatPanel, type ChatMessage } from './components/ChatPanel'
import { MarkerPanel } from './components/MarkerPanel'
import { WELCOME, replyTo } from './maia/engine'
import type { Analysis } from './maia/types'

export function App() {
  const [focusId, setFocusId] = useState<string | undefined>()
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'maia', text: WELCOME.text, suggestions: WELCOME.suggestions },
  ])

  useEffect(() => {
    if (!focusId) return
    document.getElementById(`marker-${focusId}`)?.scrollIntoView({ block: 'nearest' })
  }, [focusId])

  function focusMarker(markerId?: string) {
    if (!markerId) return
    setFocusId(markerId)
  }

  function send(preset?: string) {
    const content = (preset ?? draft).trim()
    if (!content || thinking) return
    setDraft('')
    setMessages((current) => [...current, { id: `u-${Date.now()}`, role: 'user', text: content }])
    setThinking(true)
    window.setTimeout(() => {
      const reply = replyTo(content)
      if (reply.analysis?.action?.markerId) setFocusId(reply.analysis.action.markerId)
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
    <div className="app">
      <ChatPanel
        messages={messages}
        draft={draft}
        thinking={thinking}
        onDraft={setDraft}
        onSend={send}
        onAction={(analysis: Analysis) => focusMarker(analysis.action?.markerId)}
        onFocusMarker={focusMarker}
      />
      <MarkerPanel focusId={focusId} onAsk={send} />
    </div>
  )
}
