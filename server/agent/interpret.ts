import type { Analysis, Evolution, MarkerCard, MarkerStatus, Profile } from '../../shared/types'
import { ACTIVITY_LABEL, CONDITION_LABEL, GOAL_LABEL, seeds, type MarkerSeed } from './catalog'

const STATUS_LABEL: Record<MarkerStatus, string> = {
  fora: 'Fora de Faixa',
  atencao: 'Atenção',
  otima: 'Em faixa ótima',
}

const EVOLUTION_LABEL: Record<Evolution, string> = {
  positiva: 'Positiva',
  negativa: 'Negativa',
  estavel: 'Estável',
}

export function exampleExam() {
  return ['# Exame de exemplo INB Health', '# nome;valor;anterior', ...seeds.map((seed) => `${seed.name};${seed.value};${seed.previous}`)].join('\n')
}

export function interpretExam(text: string, profile: Profile, fileName = 'exame.txt'): Analysis {
  const rows = parseExam(text)
  const markers = rows
    .map((row) => {
      const seed = seeds.find((item) => norm(item.name) === norm(row.name))
      if (!seed) return undefined
      return toCard(seed, row.value, row.previous, profile)
    })
    .filter((marker): marker is MarkerCard => Boolean(marker))

  const summary = {
    fora: markers.filter((marker) => marker.status === 'fora').length,
    atencao: markers.filter((marker) => marker.status === 'atencao').length,
    otima: markers.filter((marker) => marker.status === 'otima').length,
  }
  const fora = markers.filter((marker) => marker.status === 'fora').slice(0, 3).map((marker) => marker.name)

  return {
    fileName,
    markerCount: markers.length,
    summary,
    markers,
    profile,
    briefing: markers.length
      ? `Li ${markers.length} marcadores no seu exame e comparei com o resultado anterior. ${summary.fora} estão fora da faixa, ${summary.atencao} pedem atenção e ${summary.otima} estão na faixa ótima.${fora.length ? ` Os que mais pesam agora: ${fora.join(', ')}.` : ''} Posso explicar por que cada um importa e se a evolução foi positiva ou negativa.`
      : 'Não encontrei marcadores conhecidos nesse arquivo. Envie um exame em texto, uma linha por marcador: nome;valor;anterior.',
  }
}

export function classify(seed: MarkerSeed, value: number): MarkerStatus {
  if (value >= seed.ideal[0] && value <= seed.ideal[1]) return 'otima'
  if (value >= seed.limit[0] && value <= seed.limit[1]) return 'atencao'
  return 'fora'
}

export function evolutionOf(seed: MarkerSeed, value: number, previous: number): Evolution {
  const now = distance(seed, value)
  const before = distance(seed, previous)
  if (now < before - 0.001) return 'positiva'
  if (now > before + 0.001) return 'negativa'
  return 'estavel'
}

function toCard(seed: MarkerSeed, value: number, previous: number, profile: Profile): MarkerCard {
  const status = classify(seed, value)
  const evolution = evolutionOf(seed, value, previous)
  const [scaleMin, scaleMax] = seed.scale
  const position = Math.min(1, Math.max(0, (value - scaleMin) / (scaleMax - scaleMin)))
  return {
    id: seed.id,
    name: seed.name,
    unit: seed.unit,
    value,
    previous,
    valueLabel: formatNumber(value),
    previousLabel: formatNumber(previous),
    status,
    statusLabel: STATUS_LABEL[status],
    evolution,
    evolutionLabel: EVOLUTION_LABEL[evolution],
    evolutionText: evolutionText(seed, value, previous, evolution),
    why: personalize(seed, profile),
    scale: seed.scale,
    position,
  }
}

function evolutionText(seed: MarkerSeed, value: number, previous: number, evolution: Evolution) {
  const from = `${formatNumber(previous)} ${seed.unit}`
  const to = `${formatNumber(value)} ${seed.unit}`
  if (evolution === 'positiva') return `Evolução positiva. Foi de ${from} para ${to}, mais perto da faixa ideal.`
  if (evolution === 'negativa') return `Evolução negativa. Foi de ${from} para ${to}, mais longe da faixa ideal.`
  return `Evolução estável. Foi de ${from} para ${to}, sem mudança relevante de faixa.`
}

function personalize(seed: MarkerSeed, profile: Profile) {
  const goals = (seed.goals ?? []).filter((id) => profile.goals.includes(id)).map((id) => GOAL_LABEL[id])
  const conditions = (seed.conditions ?? []).filter((id) => profile.conditions.includes(id)).map((id) => CONDITION_LABEL[id])
  const bits = [
    conditions.length ? `você marcou ${conditions.join(' e ')}` : '',
    goals.length ? `isso pesa no objetivo de ${goals.join(' e ')}` : '',
  ].filter(Boolean)
  let text = seed.why
  if (bits.length) text += ` No seu perfil, ${bits.join(' e ')}.`
  if (seed.id === 'cortisol' && (profile.activity === 'sedentario' || profile.activity === 'leve')) {
    text += ` Com atividade ${ACTIVITY_LABEL[profile.activity]}, um cortisol alto pesa mais no cansaço.`
  }
  return text
}

function distance(seed: MarkerSeed, value: number) {
  if (value < seed.ideal[0]) return seed.ideal[0] - value
  if (value > seed.ideal[1]) return value - seed.ideal[1]
  return 0
}

function parseExam(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [name, rawValue, rawPrevious] = line.split(';').map((part) => part.trim())
      const value = readNumber(rawValue)
      const previous = readNumber(rawPrevious)
      if (!name || value === undefined) return undefined
      return { name, value, previous: previous ?? value }
    })
    .filter((row): row is { name: string; value: number; previous: number } => Boolean(row))
}

function readNumber(value: string | undefined) {
  if (!value) return undefined
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : undefined
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)
}

function norm(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}
