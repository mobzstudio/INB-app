import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Analysis, Profile } from '../shared/types'
import { answer } from './agent/answer'
import { exampleExam, interpretExam } from './agent/interpret'

type Session = {
  profile: Profile
  examText: string | null
  fileName: string
  analysis: Analysis | null
}

const sessions = new Map<string, Session>()

const emptyProfile = (): Profile => ({
  goals: [],
  conditions: [],
  activity: null,
  heightCm: null,
  weightKg: null,
  sex: null,
})

export async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  if (!url.pathname.startsWith('/api')) return false

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return true
  }
  const session = openSession(req, res)
  if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { ok: true })
  if (req.method === 'GET' && url.pathname === '/api/exam/example') {
    return send(res, 200, { fileName: 'exame-exemplo.txt', text: exampleExam() })
  }
  if (req.method === 'GET' && url.pathname === '/api/analysis') return send(res, 200, { analysis: session.analysis })
  if (req.method === 'POST' && url.pathname === '/api/profile') {
    session.profile = { ...emptyProfile(), ...(await readJson<Partial<Profile>>(req)) }
    refresh(session)
    return send(res, 200, { ok: true, analysis: session.analysis })
  }
  if (req.method === 'POST' && url.pathname === '/api/exam') {
    const body = await readJson<{ text?: string; fileName?: string }>(req)
    session.examText = body.text ?? ''
    session.fileName = body.fileName || 'exame.txt'
    refresh(session)
    return send(res, 200, { analysis: session.analysis })
  }
  if (req.method === 'POST' && url.pathname === '/api/chat') {
    const body = await readJson<{ message?: string }>(req)
    return send(res, 200, answer(body.message ?? '', session.analysis))
  }

  return send(res, 404, { error: 'Rota não encontrada' })
}

function refresh(session: Session) {
  if (!session.examText) return
  session.analysis = interpretExam(session.examText, session.profile, session.fileName)
}

function openSession(req: IncomingMessage, res: ServerResponse) {
  const header = req.headers['x-maia-session']
  const existing = Array.isArray(header) ? header[0] : header
  const id = existing && sessions.has(existing) ? existing : randomUUID()
  if (!sessions.has(id)) {
    sessions.set(id, { profile: emptyProfile(), examText: null, fileName: 'exame.txt', analysis: null })
  }
  res.setHeader('x-maia-session', id)
  return sessions.get(id) as Session
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
  return true
}

async function readJson<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  if (chunks.length === 0) return {} as T
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as T
}
