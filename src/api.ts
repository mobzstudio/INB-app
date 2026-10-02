import type { AgentReply, Analysis, Profile } from '../shared/types'
import { emptyMemory, rememberExam, rememberProfile, rememberQuestion, sampleExam, type Memory } from './browserAgent'

const KEY = 'maia-session'
const MEMORY_KEY = 'maia-memory'

let backend: Promise<boolean> | null = null

function hasBackend() {
  if (import.meta.env.VITE_MAIA_BROWSER === 'true') return Promise.resolve(false)
  backend ??= fetch('/api/health')
    .then((response) => response.ok)
    .catch(() => false)
  return backend
}

function readMemory(): Memory {
  const raw = sessionStorage.getItem(MEMORY_KEY)
  if (!raw) return emptyMemory()
  try {
    return JSON.parse(raw) as Memory
  } catch {
    return emptyMemory()
  }
}

function writeMemory(memory: Memory) {
  sessionStorage.setItem(MEMORY_KEY, JSON.stringify(memory))
}

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

export async function saveProfile(profile: Profile) {
  if (!(await hasBackend())) {
    writeMemory(rememberProfile(readMemory(), profile))
    return { analysis: readMemory().analysis }
  }
  return request<{ analysis: Analysis | null }>('/api/profile', {
    method: 'POST',
    body: JSON.stringify(profile),
  })
}

export async function submitExam(text: string, fileName: string) {
  if (!(await hasBackend())) {
    const memory = rememberExam(readMemory(), text, fileName)
    writeMemory(memory)
    return { analysis: memory.analysis as Analysis }
  }
  return request<{ analysis: Analysis }>('/api/exam', {
    method: 'POST',
    body: JSON.stringify({ text, fileName }),
  })
}

export async function askMaia(message: string) {
  if (!(await hasBackend())) return rememberQuestion(readMemory(), message)
  return request<AgentReply>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export async function exampleExam() {
  if (!(await hasBackend())) return sampleExam()
  return request<{ text: string; fileName: string }>('/api/exam/example')
}
