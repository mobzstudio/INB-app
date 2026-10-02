import type { AgentReply, Analysis, Profile } from '../shared/types'

const KEY = 'maia-session'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body) headers.set('content-type', 'application/json')
  const existing = sessionStorage.getItem(KEY)
  if (existing) headers.set('x-maia-session', existing)
  const response = await fetch(path, { ...init, headers })
  const next = response.headers.get('x-maia-session')
  if (next) sessionStorage.setItem(KEY, next)
  if (!response.ok) throw new Error('A Maia não respondeu agora.')
  return response.json() as Promise<T>
}

export function saveProfile(profile: Profile) {
  return request<{ analysis: Analysis | null }>('/api/profile', {
    method: 'POST',
    body: JSON.stringify(profile),
  })
}

export function submitExam(text: string, fileName: string) {
  return request<{ analysis: Analysis }>('/api/exam', {
    method: 'POST',
    body: JSON.stringify({ text, fileName }),
  })
}

export function askMaia(message: string) {
  return request<AgentReply>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export function exampleExam() {
  return request<{ text: string; fileName: string }>('/api/exam/example')
}
