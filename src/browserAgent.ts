import type { AgentReply, Analysis, Profile } from '../shared/types'
import { answer } from '../server/agent/answer'
import { exampleExam, interpretExam } from '../server/agent/interpret'

export type Memory = {
  profile: Profile
  examText: string | null
  fileName: string
  analysis: Analysis | null
}

export function emptyMemory(): Memory {
  return {
    profile: { goals: [], conditions: [], activity: null, heightCm: null, weightKg: null, sex: null },
    examText: null,
    fileName: 'exame.txt',
    analysis: null,
  }
}

export function sampleExam() {
  return { fileName: 'exame-exemplo.txt', text: exampleExam() }
}

export function rememberProfile(memory: Memory, profile: Profile): Memory {
  const next = { ...memory, profile }
  return next.examText ? refresh(next) : next
}

export function rememberExam(memory: Memory, text: string, fileName: string): Memory {
  return refresh({ ...memory, examText: text, fileName: fileName || 'exame.txt' })
}

export function rememberQuestion(memory: Memory, message: string): AgentReply {
  return answer(message, memory.analysis)
}

function refresh(memory: Memory): Memory {
  if (!memory.examText) return memory
  return { ...memory, analysis: interpretExam(memory.examText, memory.profile, memory.fileName) }
}
