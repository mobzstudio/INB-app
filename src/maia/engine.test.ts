import { describe, expect, it } from 'vitest'
import { replyTo } from './engine'

describe('Maia para a paciente', () => {
  it('explica os exames da Helena em segunda pessoa', () => {
    const reply = replyTo('Como estão meus exames?')
    expect(reply.text).toContain('152/94')
    expect(reply.text).toContain('7,1%')
    expect(reply.text).not.toContain('Otávio')
    expect(reply.text).not.toContain('Camila')
    expect(reply.analysis?.rows?.map((row) => row.cells[0])).toEqual([
      'Pressão arterial',
      'Hemoglobina glicada',
      'Peso',
    ])
    expect(reply.analysis?.action?.markerId).toBe('pressao')
  })

  it('mostra a série da pressão sem ajustar remédio', () => {
    const reply = replyTo('O que aconteceu com a minha pressão?')
    expect(reply.text).toContain('152/94')
    expect(reply.text).toContain('140/90')
    expect(reply.text.toLowerCase()).not.toContain('tome ')
    expect(reply.analysis?.bars?.map((bar) => bar.display)).toEqual(['138/88', '146/90', '152/94'])
  })

  it('explica a hemoglobina glicada sem diagnosticar diabetes', () => {
    const reply = replyTo('A hemoglobina glicada subiu?')
    expect(reply.text).toContain('7,1%')
    expect(reply.text).toContain('6,5%')
    expect(reply.text.toLowerCase()).toContain('não é um diagnóstico')
    expect(reply.analysis?.title).toBe('Hemoglobina glicada')
  })

  it('não fecha diabetes quando a paciente pergunta', () => {
    const reply = replyTo('Eu tenho diabetes?')
    expect(reply.text).toContain('Hipertensão arterial')
    expect(reply.text.toLowerCase()).not.toContain('você tem diabetes')
    expect(reply.text.toLowerCase()).toContain('não há registro de diabetes')
  })

  it('recusa receita', () => {
    const reply = replyTo('Prescreva a dose de losartana')
    expect(reply.text).toContain('Dra. Marina Alves')
    expect(reply.text.toLowerCase()).not.toContain('mg')
  })

  it('não lê o prontuário de outra pessoa', () => {
    const reply = replyTo('Como estão os exames da Camila?')
    expect(reply.analysis).toBeUndefined()
    expect(reply.text).toContain('seus marcadores')
  })

  it('diz quando o exame pedido não existe no registro', () => {
    const reply = replyTo('Como está a minha glicemia?')
    expect(reply.text.toLowerCase()).toContain('não está no seu registro')
    expect(reply.analysis?.title).toBe('Hemoglobina glicada')
  })

  it('fica no assunto dos marcadores', () => {
    const reply = replyTo('Qual o melhor restaurante da Barra?')
    expect(reply.analysis).toBeUndefined()
    expect(reply.text).toContain('pressão')
  })
})
