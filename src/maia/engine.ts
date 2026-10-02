import { patients } from '../data/clinic'
import { formatDay } from '../data/selectors'
import {
  latestPoint,
  markerById,
  markerTone,
  previousPoint,
  sessionMarkers,
  sessionPatient,
  statusLabel,
  visitLine,
  type Marker,
} from '../data/markers'
import type { Analysis, MaiaReply } from './types'

const FIRST = sessionPatient.name.split(' ')[0]

const NEXT_STEPS = [
  'Como estão meus exames?',
  'O que aconteceu com a minha pressão?',
  'A hemoglobina glicada subiu?',
]

function norm(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function has(text: string, ...needles: string[]) {
  return needles.some((needle) => text.includes(needle))
}

export function replyTo(message: string): MaiaReply {
  const text = norm(message).trim()
  if (!text) {
    return {
      text: 'Pode perguntar sobre um exame ou um marcador. Eu explico o que está no seu registro.',
      suggestions: NEXT_STEPS,
    }
  }

  if (isUnsafe(text)) return refuseOrder()
  if (isGreeting(text)) return greet()
  if (isIdentity(text)) return identity()
  if (isCapability(text)) return capabilities()
  if (isPrivacy(text)) return privacy()
  if (asksAnotherPerson(text)) return onlyYours()
  if (isDiagnosis(text)) return diagnosis(text)
  if (isMedication(text)) return medication()

  const marker = markerFromText(text)
  if (marker) return explainMarker(marker)
  if (isMissingLab(text)) return missingLab()
  if (isExamOverview(text)) return overview()
  if (isVisit(text)) return visit()

  return fallback()
}

function isGreeting(text: string) {
  return /^(oi|ola|bom dia|boa tarde|boa noite|hey)\b/.test(text) && text.length < 40
}

function isIdentity(text: string) {
  return has(text, 'quem e voce', 'quem e vc', 'seu nome', 'o que e a maia', 'voce e')
}

function isCapability(text: string) {
  return has(text, 'o que voce faz', 'o que voce pode', 'como voce ajuda', 'o que sabe', 'como funciona')
}

function isPrivacy(text: string) {
  return has(text, 'lgpd', 'privacidade', 'sigilo', 'quem ve', 'meus dados')
}

function isUnsafe(text: string) {
  return has(text, 'prescreva', 'prescrever', 'receita', 'dose de', 'posologia', 'qual remedio devo', 'posso parar', 'aumenta a dose', 'diminui a dose')
}

function isMedication(text: string) {
  return has(text, 'losartana', 'remedio', 'medicacao', 'comprimido', 'remedio')
}

function isDiagnosis(text: string) {
  return has(text, 'tenho diabetes', 'e diabetes', 'estou com diabetes', 'tenho hipert', 'qual doenca', 'diagnost', 'estou doente')
}

function isExamOverview(text: string) {
  return has(text, 'exame', 'marcador', 'resultado', 'laboratorio', 'como estou', 'como estao', 'o que subiu', 'meus numeros', 'analise', 'analisa', 'resumo', 'painel')
}

function isVisit(text: string) {
  return has(text, 'consulta', 'retorno', 'horario', 'quando eu vou', 'minha agenda', 'dra', 'doutora', 'medico')
}

function isMissingLab(text: string) {
  return has(text, 'glicemia', 'ldl', 'colesterol', 'tsh', 'hemograma', 'ferritina')
}

function asksAnotherPerson(text: string) {
  return patients.some((patient) => {
    if (patient.id === sessionPatient.id) return false
    const full = norm(patient.name)
    const first = full.split(' ')[0]
    return text.includes(full) || text.includes(first)
  })
}

function markerFromText(text: string) {
  const rules: { id: string; keys: string[] }[] = [
    { id: 'pressao', keys: ['pressao', 'arterial', 'hipertens', 'mmhg'] },
    { id: 'hba1c', keys: ['hba1c', 'glicada', 'hemoglobina', 'acucar'] },
    { id: 'peso', keys: ['peso', 'quilo', 'balanca', 'engord'] },
  ]
  const found = rules.find((rule) => has(text, ...rule.keys))
  return found ? markerById(found.id) : undefined
}

function greet(): MaiaReply {
  return {
    text: `Oi, ${FIRST}. Seus exames de ontem já estão aqui. Quer que eu comece pelo que passou da referência?`,
    suggestions: NEXT_STEPS,
  }
}

function identity(): MaiaReply {
  return {
    text: `Eu sou a Maia. Neste chat eu falo com você, ${FIRST}, e leio os marcadores e exames que a INB Health já lançou no seu nome. Eu explico a curva e a referência. Quem interpreta a conduta é a sua médica.`,
    suggestions: ['Como estão meus exames?', 'Quando é a minha consulta?'],
  }
}

function capabilities(): MaiaReply {
  return {
    text: 'Eu explico três coisas do seu registro: a pressão, a hemoglobina glicada e o peso. Também digo o que está acima da referência e o horário do seu retorno. Não fecho diagnóstico e não monto receita.',
    suggestions: NEXT_STEPS,
  }
}

function privacy(): MaiaReply {
  return {
    text: 'Esta conversa usa só o seu registro. Eu não misturo o prontuário de outra pessoa e não invento um exame que não foi lançado. O que aparece aqui é o que a equipe da INB Health já guardou para você.',
    suggestions: ['Como estão meus exames?'],
  }
}

function onlyYours(): MaiaReply {
  return {
    text: `Eu só consigo ler os seus marcadores, ${FIRST}. O registro de outra pessoa não entra neste chat.`,
    suggestions: NEXT_STEPS,
  }
}

function refuseOrder(): MaiaReply {
  const pressure = markerById('pressao')
  return {
    text: 'Dose, receita e a decisão de parar um medicamento ficam com a Dra. Marina Alves. Eu não indico remédio. Posso te deixar com os números da pressão para a consulta de hoje.',
    analysis: pressure ? markerCard(pressure) : undefined,
    suggestions: ['O que aconteceu com a minha pressão?', 'Quando é a minha consulta?'],
  }
}

function medication(): MaiaReply {
  const pressure = markerById('pressao')
  return {
    text: 'A nota da sua equipe diz que a losartana não foi tomada de forma regular nas últimas três semanas. Eu não sei dizer a dose certa, nem se algo deve mudar. Isso é assunto da consulta de hoje às 08:30. O marcador ligado a esse registro é a sua pressão.',
    analysis: pressure ? markerCard(pressure) : undefined,
    suggestions: ['O que aconteceu com a minha pressão?', 'Como estão meus exames?'],
  }
}

function diagnosis(text: string): MaiaReply {
  const recorded = sessionPatient.conditions.join(', ')
  const glycated = markerById('hba1c')
  const latest = glycated ? latestPoint(glycated).display : undefined
  if (has(text, 'diabetes', 'acucar')) {
    return {
      text: `No seu prontuário está registrado: ${recorded}. Não há registro de diabetes. A hemoglobina glicada mais recente foi ${latest}, acima da referência de 6,5%. Isso é um número para a consulta, não um diagnóstico que eu possa fechar.`,
      analysis: glycated ? markerCard(glycated) : undefined,
      suggestions: ['A hemoglobina glicada subiu?', 'Quando é a minha consulta?'],
    }
  }
  return {
    text: `O que está escrito no seu registro é: ${recorded}. Eu não crio um diagnóstico novo em cima disso. A leitura que eu faço é a dos marcadores, e a pressão é o que está acima da referência agora.`,
    suggestions: ['O que aconteceu com a minha pressão?', 'Como estão meus exames?'],
  }
}

function missingLab(): MaiaReply {
  const glycated = markerById('hba1c')
  return {
    text: 'Esse exame não está no seu registro. O marcador de açúcar que existe para você é a hemoglobina glicada. Posso te mostrar a curva dela.',
    analysis: glycated ? markerCard(glycated) : undefined,
    suggestions: ['A hemoglobina glicada subiu?', 'Como estão meus exames?'],
  }
}

function overview(): MaiaReply {
  const markers = sessionMarkers()
  const above = markers.filter((marker) => marker.status === 'alterado')
  return {
    text: `Dos seus marcadores, ${above.length} estão acima da referência: a pressão, em ${latestPoint(markerById('pressao') as Marker).display} mmHg, e a hemoglobina glicada, em ${latestPoint(markerById('hba1c') as Marker).display}. O peso foi de 79 para 81 kg. ${visitLine()} Eu não digo o que fazer com o medicamento.`,
    analysis: {
      kicker: 'Seus marcadores',
      title: 'O que o registro mostra',
      narrative: 'Cada número é o último lançado no seu nome. A referência é a do exame ou a do consultório, não uma conduta.',
      metrics: markers.map((marker) => ({
        label: marker.name,
        value: latestPoint(marker).display,
        detail: statusLabel(marker.status),
        tone: markerTone(marker.status),
      })),
      columns: ['Marcador', 'Último valor', 'Leitura'],
      rows: markers.map((marker) => ({
        markerId: marker.id,
        cells: [marker.name, latestPoint(marker).display, statusLabel(marker.status)],
      })),
      action: { markerId: 'pressao', label: 'Ver pressão no painel' },
    },
    suggestions: ['O que aconteceu com a minha pressão?', 'A hemoglobina glicada subiu?'],
  }
}

function explainMarker(marker: Marker): MaiaReply {
  return {
    text: markerNarrative(marker),
    analysis: markerCard(marker),
    suggestions: NEXT_STEPS.filter((item) => !norm(item).includes(norm(marker.name.split(' ')[0]))).slice(0, 2),
  }
}

function markerNarrative(marker: Marker) {
  const latest = latestPoint(marker)
  const previous = previousPoint(marker)
  const history = marker.series.map((point) => `${formatDay(point.date)}: ${point.display}`).join('. ')
  const change = previous ? `Antes, em ${formatDay(previous.date)}, estava ${previous.display}. ` : ''
  if (marker.id === 'pressao') {
    return `Sua pressão mais recente, em ${formatDay(latest.date)}, foi ${latest.display} mmHg. ${change}A referência do consultório é abaixo de 140/90, então esta leitura ficou acima. A série completa: ${history}. O registro também traz hipertensão arterial. Eu não ajusto remédio por causa disso.`
  }
  if (marker.id === 'hba1c') {
    return `A hemoglobina glicada resume a média de açúcar no sangue em cerca de três meses. A sua foi a ${latest.display} em ${formatDay(latest.date)}. ${change}A referência do exame é abaixo de 6,5%, e o valor passou dela. Série: ${history}. Isso não é um diagnóstico de diabetes — esse nome não está no seu prontuário.`
  }
  return `Seu peso mais recente foi ${latest.display}, em ${formatDay(latest.date)}. ${change}Não há uma meta escrita no registro. Série: ${history}.`
}

function markerCard(marker: Marker): Analysis {
  const latest = latestPoint(marker)
  const previous = previousPoint(marker)
  const tone = markerTone(marker.status)
  return {
    kicker: 'Seu marcador',
    title: marker.name,
    narrative: marker.about,
    metrics: [
      { label: 'Mais recente', value: latest.display, detail: formatDay(latest.date), tone },
      {
        label: 'Anterior',
        value: previous?.display ?? '—',
        detail: previous ? formatDay(previous.date) : 'uma leitura só',
        tone: 'neutral',
      },
      { label: 'Referência', value: marker.reference, tone: 'neutral' },
      { label: 'Leitura', value: statusLabel(marker.status), tone },
    ],
    bars: marker.series.map((point) => ({
      label: formatDay(point.date),
      value: point.value,
      display: point.display,
      tone: point === latest ? tone : 'neutral',
    })),
    action: { markerId: marker.id, label: `Ver ${marker.name.toLocaleLowerCase('pt-BR')} no painel` },
  }
}

function visit(): MaiaReply {
  return {
    text: `${visitLine()} Vale chegar sabendo destes dois números: pressão ${latestPoint(markerById('pressao') as Marker).display} mmHg e hemoglobina glicada ${latestPoint(markerById('hba1c') as Marker).display}.`,
    suggestions: ['Como estão meus exames?', 'O que aconteceu com a minha pressão?'],
  }
}

function fallback(): MaiaReply {
  return {
    text: `Consigo te explicar os seus marcadores, ${FIRST}: pressão, hemoglobina glicada e peso, além do horário da consulta. Se a pergunta for sobre dose ou diagnóstico, isso fica com a sua médica.`,
    suggestions: NEXT_STEPS,
  }
}

export const WELCOME: MaiaReply = {
  text: `Oi, ${FIRST}. Eu sou a Maia. Este chat é seu: eu leio os marcadores e os exames do seu registro na INB Health e explico o que mudou. Não fecho diagnóstico e não faço receita.`,
  suggestions: NEXT_STEPS,
}
