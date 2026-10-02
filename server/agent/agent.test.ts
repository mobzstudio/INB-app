import { describe, expect, it } from 'vitest'
import type { Profile } from '../../shared/types'
import { answer } from './answer'
import { seeds } from './catalog'
import { classify, exampleExam, interpretExam } from './interpret'

const profile: Profile = {
  goals: ['emagrecimento', 'energia', 'preventivo'],
  conditions: ['hipertensao', 'hipotireoidismo'],
  activity: 'leve',
  heightCm: 175,
  weightKg: 72,
  sex: 'masculino',
}

describe('agente da Maia', () => {
  it('separa o exame de exemplo nas três faixas do painel', () => {
    const analysis = interpretExam(exampleExam(), profile)
    expect(analysis.markerCount).toBe(69)
    expect(analysis.summary).toEqual({ fora: 9, atencao: 21, otima: 39 })
    expect(seeds).toHaveLength(69)
  })

  it('marca o cortisol como fora da faixa e com evolução negativa', () => {
    const analysis = interpretExam(exampleExam(), profile)
    const cortisol = analysis.markers.find((marker) => marker.id === 'cortisol')
    expect(cortisol?.valueLabel).toBe('14')
    expect(cortisol?.status).toBe('fora')
    expect(cortisol?.evolution).toBe('negativa')
    expect(cortisol?.why.toLowerCase()).toContain('emagrecimento')
    expect(cortisol?.why.toLowerCase()).toContain('levemente ativo')
    expect(cortisol?.scale).toEqual([5, 25])
  })

  it('liga o TSH ao hipotireoidismo do perfil', () => {
    const analysis = interpretExam(exampleExam(), profile)
    const tsh = analysis.markers.find((marker) => marker.id === 'tsh')
    expect(tsh?.status).toBe('fora')
    expect(tsh?.why.toLowerCase()).toContain('hipotireoidismo')
  })

  it('responde por que o marcador importa e se a curva piorou', () => {
    const analysis = interpretExam(exampleExam(), profile)
    const why = answer('Por que o cortisol importa?', analysis)
    expect(why.markerId).toBe('cortisol')
    expect(why.text).toContain('14')
    expect(why.text.toLowerCase()).toContain('peso')

    const curve = answer('A evolução do cortisol foi positiva ou negativa?', analysis)
    expect(curve.text.toLowerCase()).toContain('negativa')
    expect(curve.text).toContain('11,2')
  })

  it('lista o que piorou sem receita', () => {
    const analysis = interpretExam(exampleExam(), profile)
    const worse = answer('O que piorou?', analysis)
    expect(worse.text.toLowerCase()).toContain('cortisol')
    expect(worse.text).toContain('marcadores pioraram')
    const dose = answer('Prescreva a dose de algum remédio', analysis)
    expect(dose.text.toLowerCase()).toContain('não passo dose')
    expect(dose.markerId).toBeUndefined()
  })

  it('classifica cada semente na faixa esperada', () => {
    const fora = ['cortisol', 'tsh', 'ldl', 'vitamina-d', 'ferritina', 'insulina', 'pcr', 'homocisteina', 'hba1c']
    for (const seed of seeds) {
      const status = classify(seed, seed.value)
      if (fora.includes(seed.id)) expect(status, seed.id).toBe('fora')
    }
  })
})
