import { describe, expect, it } from 'vitest'
import type { Profile } from '../shared/types'
import { emptyMemory, rememberExam, rememberProfile, rememberQuestion, sampleExam } from './browserAgent'

const profile: Profile = {
  goals: ['emagrecimento', 'energia', 'preventivo'],
  conditions: ['hipertensao', 'hipotireoidismo'],
  activity: 'leve',
  heightCm: 175,
  weightKg: 72,
  sex: 'masculino',
}

describe('agente no navegador', () => {
  it('monta os mesmos cards do exame de exemplo', () => {
    const example = sampleExam()
    const memory = rememberExam(rememberProfile(emptyMemory(), profile), example.text, example.fileName)
    expect(memory.analysis?.markerCount).toBe(69)
    expect(memory.analysis?.summary).toEqual({ fora: 9, atencao: 21, otima: 39 })
    const cortisol = memory.analysis?.markers.find((marker) => marker.id === 'cortisol')
    expect(cortisol?.status).toBe('fora')
    expect(cortisol?.evolution).toBe('negativa')
  })

  it('responde a dúvida em cima dos cards guardados', () => {
    const example = sampleExam()
    const memory = rememberExam(rememberProfile(emptyMemory(), profile), example.text, example.fileName)
    const reply = rememberQuestion(memory, 'Por que o cortisol importa?')
    expect(reply.markerId).toBe('cortisol')
    expect(reply.text).toContain('14')
  })
})
