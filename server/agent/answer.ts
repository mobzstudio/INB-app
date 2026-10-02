import type { AgentReply, Analysis, MarkerCard } from '../../shared/types'

export function answer(message: string, analysis: Analysis | null): AgentReply {
  const text = norm(message).trim()
  if (!analysis || analysis.markers.length === 0) {
    return { text: 'Ainda não li um exame. Envie o laudo para eu montar os seus marcadores.' }
  }
  if (!text) return { text: 'Pode perguntar por que um marcador importa ou se a evolução foi positiva ou negativa.', markerId: undefined }
  if (isUnsafe(text)) {
    return { text: 'Eu não passo dose nem receita. Eu explico o número, por que ele importa e se a curva foi positiva ou negativa. A conduta fica com quem te acompanha.' }
  }

  const marker = findMarker(text, analysis.markers)
  if (marker && (isWhy(text) || !isEvolutionAsk(text))) {
    if (isEvolutionAsk(text) && !isWhy(text)) return evolutionReply(marker)
    if (isWhy(text) || has(text, 'explica', 'o que e', 'importa')) return whyReply(marker)
  }
  if (marker && isEvolutionAsk(text)) return evolutionReply(marker)
  if (marker) return whyReply(marker)

  if (isWorse(text)) return listBy(analysis, 'negativa', 'piorou e se afastou da faixa ideal', 'pioraram e se afastaram da faixa ideal')
  if (isBetter(text)) return listBy(analysis, 'positiva', 'melhorou e chegou mais perto da faixa ideal', 'melhoraram e chegaram mais perto da faixa ideal')
  if (isOut(text)) return listStatus(analysis, 'fora')
  if (isAttention(text)) return listStatus(analysis, 'atencao')
  if (isOptimal(text)) return listStatus(analysis, 'otima')
  if (isSummary(text) || isEvolutionAsk(text)) return summary(analysis)

  return {
    text: 'Eu respondo em cima dos marcadores que li no seu exame: o que está fora da faixa, por que importa e se a evolução foi positiva ou negativa.',
  }
}

function whyReply(marker: MarkerCard): AgentReply {
  return {
    markerId: marker.id,
    text: `${marker.name} está em ${marker.valueLabel} ${marker.unit}, ${marker.statusLabel.toLowerCase()}. ${marker.why}`,
  }
}

function evolutionReply(marker: MarkerCard): AgentReply {
  return { markerId: marker.id, text: `${marker.name}: ${marker.evolutionText}` }
}

function summary(analysis: Analysis): AgentReply {
  const { fora, atencao, otima } = analysis.summary
  const negative = analysis.markers.filter((marker) => marker.evolution === 'negativa').length
  const positive = analysis.markers.filter((marker) => marker.evolution === 'positiva').length
  return {
    text: `${analysis.briefing} No conjunto, ${positive} marcadores tiveram evolução positiva e ${negative} evolução negativa. Fora da faixa continuam ${fora}; em atenção, ${atencao}; na faixa ótima, ${otima}.`,
  }
}

function listStatus(analysis: Analysis, status: MarkerCard['status']): AgentReply {
  const items = analysis.markers.filter((marker) => marker.status === status)
  const label = items[0]?.statusLabel.toLowerCase() ?? 'nessa faixa'
  return {
    text: items.length
      ? `${items.length} marcadores estão ${label}: ${items.map((marker) => `${marker.name} ${marker.valueLabel} ${marker.unit}`).join('; ')}.`
      : 'Nenhum marcador ficou nessa faixa neste exame.',
    markerId: items[0]?.id,
  }
}

function listBy(analysis: Analysis, evolution: MarkerCard['evolution'], one: string, many: string): AgentReply {
  const items = analysis.markers.filter((marker) => marker.evolution === evolution)
  const shown = items.slice(0, 6)
  const lead = items.length === 1 ? `1 marcador ${one}` : `${items.length} marcadores ${many}`
  return {
    text: shown.length
      ? `${lead}. Os principais: ${shown.map((marker) => `${marker.name} (${marker.previousLabel} → ${marker.valueLabel} ${marker.unit})`).join('; ')}.`
      : 'Nenhum marcador teve esse tipo de evolução neste exame.',
    markerId: shown[0]?.id,
  }
}

function findMarker(text: string, markers: MarkerCard[]) {
  const ranked = markers
    .map((marker) => {
      const name = norm(marker.name)
      if (text.includes(name)) return { marker, score: name.length + 10 }
      const words = name.split(' ')
      if (words.length === 1 && words[0].length >= 2 && text.includes(words[0])) return { marker, score: words[0].length }
      return undefined
    })
    .filter((item): item is { marker: MarkerCard; score: number } => Boolean(item))
    .sort((a, b) => b.score - a.score)
  return ranked[0]?.marker
}

function isWhy(text: string) {
  return has(text, 'por que', 'porque', 'importa', 'explica', 'o que e', 'significa')
}

function isEvolutionAsk(text: string) {
  return has(text, 'evolu', 'pior', 'melhor', 'positiv', 'negativ', 'subiu', 'caiu', 'curva')
}

function isWorse(text: string) {
  return has(text, 'pior', 'negativ', 'afast')
}

function isBetter(text: string) {
  return has(text, 'melhor', 'positiv', 'aproxim')
}

function isOut(text: string) {
  return has(text, 'fora da faixa', 'fora de faixa', 'alterad', 'ruim')
}

function isAttention(text: string) {
  return has(text, 'atencao', 'atenção')
}

function isOptimal(text: string) {
  return has(text, 'otima', 'ideal', 'faixa otima', 'normais', 'bons')
}

function isSummary(text: string) {
  return has(text, 'resumo', 'como estao', 'como estou', 'meus exames', 'marcadores', 'panorama')
}

function isUnsafe(text: string) {
  return has(text, 'prescreva', 'receita', 'dose', 'que remedio', 'posologia')
}

function has(text: string, ...needles: string[]) {
  return needles.some((needle) => text.includes(norm(needle)))
}

function norm(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}
