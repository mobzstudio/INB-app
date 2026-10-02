import { useState } from 'react'
import type { Analysis, Profile } from '../shared/types'
import { askMaia, exampleExam, saveProfile, submitExam } from './api'
import { ExamStep } from './ui/ExamStep'
import { MaiaChat, type ChatLine } from './ui/MaiaChat'
import { MarkersView } from './ui/MarkersView'
import { Onboarding } from './ui/Onboarding'

type Step = 'goals' | 'conditions' | 'activity' | 'profile' | 'exam' | 'markers'

const ORDER: Step[] = ['goals', 'conditions', 'activity', 'profile', 'exam', 'markers']

const initialProfile: Profile = {
  goals: ['emagrecimento', 'energia', 'preventivo'],
  conditions: ['hipertensao', 'hipotireoidismo'],
  activity: 'leve',
  heightCm: 175,
  weightKg: 72,
  sex: 'masculino',
}

export function App() {
  const [step, setStep] = useState<Step>('goals')
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState('')
  const [maiaOpen, setMaiaOpen] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [focusId, setFocusId] = useState<string | undefined>()
  const [messages, setMessages] = useState<ChatLine[]>([])

  function go(next: Step) {
    setError('')
    setStep(next)
  }

  function back() {
    const index = ORDER.indexOf(step)
    if (index <= 0) return
    go(ORDER[index - 1])
  }

  function continueStep() {
    if (step === 'goals') return go('conditions')
    if (step === 'conditions') return go('activity')
    if (step === 'activity') return go('profile')
    if (step === 'profile') return go('exam')
  }

  function skip() {
    if (step === 'goals') setProfile((current) => ({ ...current, goals: [] }))
    if (step === 'conditions') setProfile((current) => ({ ...current, conditions: [] }))
    if (step === 'activity') setProfile((current) => ({ ...current, activity: null }))
    continueStep()
  }

  async function runExam(text: string, fileName: string) {
    setReading(true)
    setError('')
    try {
      await saveProfile(profile)
      const result = await submitExam(text, fileName)
      if (!result.analysis || result.analysis.markerCount === 0) {
        setError(result.analysis?.briefing || 'Não consegui ler marcadores nesse arquivo.')
        return
      }
      setAnalysis(result.analysis)
      setMessages([{ id: 'briefing', role: 'maia', text: result.analysis.briefing }])
      setStep('markers')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não consegui falar com a Maia.')
    } finally {
      setReading(false)
    }
  }

  async function useExample() {
    try {
      const example = await exampleExam()
      await runExam(example.text, example.fileName)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não consegui falar com a Maia.')
    }
  }

  async function useFile(file: File) {
    const text = await file.text()
    await runExam(text, file.name)
  }

  async function send(text: string) {
    setMaiaOpen(true)
    setMessages((current) => [...current, { id: `u-${Date.now()}`, role: 'user', text }])
    setThinking(true)
    try {
      const reply = await askMaia(text)
      if (reply.markerId) setFocusId(reply.markerId)
      setMessages((current) => [...current, { id: `m-${Date.now()}`, role: 'maia', text: reply.text }])
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Não consegui responder agora.'
      setMessages((current) => [...current, { id: `e-${Date.now()}`, role: 'maia', text: message }])
    } finally {
      setThinking(false)
    }
  }

  const onboarding = step === 'goals' || step === 'conditions' || step === 'activity' || step === 'profile'

  return (
    <main className="stage">
      <div className="phone">
        {onboarding ? (
          <Onboarding step={step} profile={profile} onChange={setProfile} onBack={back} onContinue={continueStep} onSkip={skip} />
        ) : null}
        {step === 'exam' ? (
          <ExamStep reading={reading} error={error} onBack={back} onExample={() => void useExample()} onFile={(file) => void useFile(file)} />
        ) : null}
        {step === 'markers' && analysis ? (
          <MarkersView analysis={analysis} focusId={focusId} onOpenMaia={() => setMaiaOpen(true)} onReplace={() => go('exam')} />
        ) : null}
        {maiaOpen ? (
          <MaiaChat messages={messages} thinking={thinking} onClose={() => setMaiaOpen(false)} onSend={(text) => void send(text)} />
        ) : null}
      </div>
    </main>
  )
}
