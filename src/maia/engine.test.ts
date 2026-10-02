import { describe, expect, it } from 'vitest'
import { replyTo } from './engine'

describe('Maia', () => {
  it('apresenta a agenda de hoje com a falta da Camila', () => {
    const reply = replyTo('Como está a agenda de hoje?')
    expect(reply.text).toContain('7 atendimentos')
    expect(reply.text).toContain('Camila Ferreira')
    expect(reply.analysis?.metrics.find((metric) => metric.label === 'Faltas')?.value).toBe('1')
    expect(reply.analysis?.action).toMatchObject({ view: 'agenda', filter: 'today' })
  })

  it('lista exames alterados sem inventar paciente', () => {
    const reply = replyTo('Quais exames vieram alterados?')
    expect(reply.text).toContain('Otávio Lima')
    expect(reply.text).toContain('186')
    expect(reply.analysis?.rows?.map((row) => row.cells[0])).toEqual([
      'Helena Duarte',
      'Otávio Lima',
      'Otávio Lima',
      'Eduardo Pacheco',
    ])
    expect(reply.analysis?.action).toMatchObject({ view: 'patients', filter: 'altered' })
  })

  it('analisa a evolução da Helena com a série registrada', () => {
    const reply = replyTo('Analise a evolução de Helena Duarte')
    expect(reply.text).toContain('152/94')
    expect(reply.text).toContain('7,1%')
    expect(reply.text).not.toMatch(/prescrev/i)
    expect(reply.analysis?.action).toMatchObject({ view: 'patient', patientId: 'helena' })
    expect(reply.analysis?.bars?.map((bar) => bar.display)).toEqual(['138/88', '146/90', '152/94'])
  })

  it('usa o paciente aberto quando a pergunta não traz nome', () => {
    const reply = replyTo('Analise a evolução deste paciente', { patientId: 'eduardo' })
    expect(reply.analysis?.title).toBe('Eduardo Pacheco')
    expect(reply.text).toContain('168')
  })

  it('recusa prescrição', () => {
    const reply = replyTo('Prescreva a dose de losartana para a Helena')
    expect(reply.analysis).toBeUndefined()
    expect(reply.text).toContain('Prescrição')
  })

  it('não fecha diagnóstico que não está no prontuário', () => {
    const reply = replyTo('A Helena tem diabetes?')
    expect(reply.text).toContain('Hipertensão arterial')
    expect(reply.text).not.toContain('fecha agora')
    expect(reply.text.toLowerCase()).not.toContain('sim, ela tem diabetes')
  })

  it('aponta os gargalos da semana', () => {
    const reply = replyTo('Onde estão os gargalos da semana?')
    expect(reply.text).toContain('Camila Ferreira')
    expect(reply.text).toContain('Otávio Lima')
    expect(reply.text).toContain('Eduardo Pacheco')
    expect(reply.analysis?.action?.view).toBe('indicators')
  })

  it('responde quem faltou', () => {
    const reply = replyTo('Quem faltou essa semana?')
    expect(reply.analysis?.rows).toHaveLength(2)
    expect(reply.analysis?.action).toMatchObject({ filter: 'noshow' })
  })

  it('cai no limite quando o assunto sai da plataforma', () => {
    const reply = replyTo('Qual o melhor restaurante da Barra?')
    expect(reply.analysis).toBeUndefined()
    expect(reply.text).toContain('INB Health')
  })
})
