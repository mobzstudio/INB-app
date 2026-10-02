import { CLINIC, STATUS_LABEL, TODAY, patients, type Patient } from '../data/clinic'
import {
  alteredExams,
  appointmentsFor,
  countStatus,
  examLabel,
  examsFor,
  filterAppointments,
  formatDay,
  joinNames,
  latestVital,
  pendingExams,
  percent,
  professionalById,
  professionalLoad,
  todayAppointments,
  weekAppointments,
} from '../data/selectors'
import type { MaiaContext, MaiaReply } from './types'

const NEXT_STEPS = [
  'Como está a agenda de hoje?',
  'Quais exames vieram alterados?',
  'Onde estão os gargalos da semana?',
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

function findPatients(text: string) {
  return patients.filter((patient) => {
    const full = norm(patient.name)
    const first = full.split(' ')[0]
    return text.includes(full) || text.includes(first)
  })
}

function firstName(patient: Patient) {
  return patient.name.split(' ')[0]
}

function pressure(patient: Patient) {
  const vital = latestVital(patient)
  if (!vital?.systolic || !vital.diastolic) return undefined
  return `${vital.systolic}/${vital.diastolic} mmHg`
}

export function replyTo(message: string, context: MaiaContext = {}): MaiaReply {
  const text = norm(message).trim()
  if (!text) {
    return {
      text: 'Me conta o que você quer ver na clínica. Posso ler agenda, exames e a evolução de um paciente.',
      suggestions: NEXT_STEPS,
    }
  }

  if (isUnsafeClinicalAsk(text)) return refuseClinicalOrder()
  if (isGreeting(text)) return greet()
  if (isIdentity(text)) return identity()
  if (isCapability(text)) return capabilities()
  if (isPrivacy(text)) return privacy()

  const named = findPatients(text)
  if (named.length > 1) {
    return {
      text: `Encontrei mais de uma pessoa: ${joinNames(named.map((patient) => patient.name))}. Me diz o nome completo para eu não misturar prontuários.`,
      suggestions: named.map((patient) => `Analise a evolução de ${patient.name}`),
    }
  }
  if (named.length === 1) {
    return isConditionAsk(text) ? conditions(named[0]) : evolution(named[0])
  }

  if (isBottleneck(text)) return bottlenecks()
  if (isAlteredExamAsk(text)) return altered()
  if (isNoShow(text)) return noShows()
  if (isWaiting(text)) return waiting()
  if (isProductivity(text)) return productivity()
  if (isAgenda(text)) return agenda(text)

  const patient = patientFromContext(text, context)
  if (patient && isConditionAsk(text)) return conditions(patient)
  if (patient) return evolution(patient)
  if (isEvolutionAsk(text)) return askWhichPatient()

  const help = helpTopic(text)
  if (help) return help

  return fallback()
}

function patientFromContext(text: string, context: MaiaContext) {
  if (!context.patientId) return undefined
  const asksThisPatient = has(
    text,
    'este paciente',
    'esse paciente',
    'desta paciente',
    'dessa paciente',
    'desse paciente',
    'deste paciente',
    'ela',
    'ele',
    'evolucao',
    'prontuario',
    'resumo',
  )
  if (!asksThisPatient) return undefined
  return patients.find((patient) => patient.id === context.patientId)
}

function isGreeting(text: string) {
  return /^(oi|ola|bom dia|boa tarde|boa noite|hey|e ai)\b/.test(text) && text.length < 40
}

function isIdentity(text: string) {
  return has(text, 'quem e voce', 'quem e vc', 'seu nome', 'o que e a maia', 'voce e')
}

function isCapability(text: string) {
  return has(text, 'o que voce faz', 'o que voce pode', 'como voce ajuda', 'quais comandos', 'o que sabe')
}

function isPrivacy(text: string) {
  return has(text, 'lgpd', 'privacidade', 'sigilo', 'dados do paciente', 'seguranca')
}

function isBottleneck(text: string) {
  return has(text, 'gargalo', 'prioridade', 'prioridades', 'atencao', 'risco da semana', 'onde olhar', 'o que precisa')
}

function isAlteredExamAsk(text: string) {
  return has(text, 'exame', 'laudo', 'laboratorio', 'alterado', 'hemograma', 'hba1c', 'ldl', 'glicemia')
}

function isNoShow(text: string) {
  return has(text, 'falta', 'faltou', 'no-show', 'noshow', 'nao veio', 'nao compareceu')
}

function isWaiting(text: string) {
  return has(text, 'confirm', 'aguardando', 'sem confirmacao')
}

function isProductivity(text: string) {
  return has(text, 'produtividade', 'ocupacao', 'por profissional', 'carga da equipe', 'carga por')
}

function isAgenda(text: string) {
  return has(text, 'agenda', 'hoje', 'amanha', 'semana', 'consulta', 'horario', 'atendimento')
}

function isEvolutionAsk(text: string) {
  return has(text, 'evolu', 'analise', 'analisa', 'resumo', 'prontuario', 'como esta', 'como vai', 'historico')
}

function isConditionAsk(text: string) {
  return has(text, 'tem diabetes', 'tem hipert', 'diagnost', 'condicao', 'o que ela tem', 'o que ele tem', 'doenca')
}

function isUnsafeClinicalAsk(text: string) {
  return has(
    text,
    'prescreva',
    'prescrever',
    'receita',
    'dose de',
    'posologia',
    'qual remedio',
    'que remedio',
    'medicacao para',
    'posso medicar',
    'conduta medicamentosa',
  )
}

function greet(): MaiaReply {
  return {
    text: `Oi, ${CLINIC.clinician.short}. A clínica de hoje já está na minha leitura. Quer a agenda, os exames alterados ou os pontos que pedem ação?`,
    suggestions: NEXT_STEPS,
  }
}

function identity(): MaiaReply {
  return {
    text: 'Eu sou a Maia, a assistente da plataforma INB Health. Fui treinada para conversar com a equipe e analisar somente o que já está registrado aqui: agenda, prontuário, exames e indicadores. Eu organizo o que os dados mostram. Quem decide a conduta é você.',
    suggestions: ['O que você pode analisar?', 'Como você trata os dados?'],
  }
}

function capabilities(): MaiaReply {
  return {
    text: 'Dentro do app eu faço quatro leituras: a agenda do dia e da semana, faltas e confirmações, exames alterados ou pendentes, e a evolução de um paciente a partir dos registros. Quando a análise aponta um lugar, eu abro essa tela para você.',
    suggestions: NEXT_STEPS,
  }
}

function privacy(): MaiaReply {
  return {
    text: 'Eu só uso dados desta unidade, já lançados na plataforma. Não invento resultado, não completo lacuna e não levo a conversa para fora do prontuário. Informação clínica é sensível: o acesso segue o perfil de quem está logado, e eu não fecho diagnóstico nem gero prescrição.',
    suggestions: ['Quais exames vieram alterados?', 'Analise a evolução de Helena Duarte'],
  }
}

function refuseClinicalOrder(): MaiaReply {
  return {
    text: 'Prescrição e dose ficam com você. Eu não monto receita nem indico medicamento. Posso, se quiser, abrir a evolução e os exames que já estão no prontuário para apoiar a sua decisão.',
    suggestions: ['Quais exames vieram alterados?', 'Analise a evolução de Otávio Lima'],
  }
}

function agenda(text: string): MaiaReply {
  const tomorrow = has(text, 'amanha')
  const week = has(text, 'semana') && !has(text, 'hoje') && !tomorrow
  const list = tomorrow
    ? weekAppointments().filter((item) => item.date === '2026-10-03')
    : week
      ? weekAppointments()
      : todayAppointments()
  const confirmed = countStatus(list, 'confirmada')
  const waiting = countStatus(list, 'aguardando')
  const missed = countStatus(list, 'falta')
  const done = countStatus(list, 'realizada')
  const missedNames = joinNames(
    list
      .filter((item) => item.status === 'falta')
      .map((item) => patients.find((patient) => patient.id === item.patientId)?.name ?? 'paciente'),
  )

  const attention = missed
    ? `A falta de ${missedNames} é o ponto que pede retorno.`
    : waiting
      ? 'Ainda há horário sem confirmação.'
      : 'Nenhuma falta nesse recorte.'

  return {
    text: `${tomorrow ? 'Amanhã, 3 de outubro' : week ? 'Na semana de 28 de setembro a 4 de outubro' : 'Hoje, 2 de outubro'}, há ${list.length} atendimentos na agenda. ${confirmed} confirmados, ${waiting} aguardando, ${missed} falta${missed === 1 ? '' : 's'}${done ? ` e ${done} já realizados` : ''}. ${attention}`,
    analysis: {
      kicker: tomorrow ? 'Agenda de amanhã' : week ? 'Agenda da semana' : 'Agenda de hoje',
      title: tomorrow ? 'Sábado, 3 de outubro' : week ? '28 set – 4 out' : 'Sexta, 2 de outubro',
      narrative: attention,
      metrics: [
        { label: 'Atendimentos', value: String(list.length), tone: 'neutral' },
        { label: 'Confirmados', value: String(confirmed), detail: `${percent(confirmed, list.length)}%`, tone: 'good' },
        { label: 'Aguardando', value: String(waiting), tone: waiting ? 'warn' : 'good' },
        { label: 'Faltas', value: String(missed), tone: missed ? 'alert' : 'good' },
      ],
      columns: ['Horário', 'Paciente', 'Profissional', 'Status'],
      rows: list.map((item) => {
        const patient = patients.find((entry) => entry.id === item.patientId)
        const professional = professionalById(item.professionalId)
        return {
          patientId: item.patientId,
          cells: [
            week || tomorrow ? `${formatDay(item.date)} · ${item.time}` : item.time,
            patient?.name ?? '—',
            professional?.name.replace('Dra. ', '').replace('Dr. ', '') ?? '—',
            STATUS_LABEL[item.status],
          ],
        }
      }),
      action: {
        view: 'agenda',
        filter: week || tomorrow ? 'week' : 'today',
        label: tomorrow ? 'Agenda de amanhã' : week ? 'Agenda da semana' : 'Agenda de hoje',
      },
    },
    suggestions: tomorrow
      ? ['Como está a agenda de hoje?', 'Quem ainda não confirmou?']
      : week
        ? ['Quem faltou essa semana?', 'Como está a produtividade?']
        : ['Quem ainda não confirmou?', 'Quais exames vieram alterados?'],
  }
}

function noShows(): MaiaReply {
  const list = filterAppointments('noshow')
  const names = joinNames(
    list.map((item) => patients.find((patient) => patient.id === item.patientId)?.name ?? 'paciente'),
  )
  return {
    text: list.length
      ? `Há ${list.length} faltas na semana: ${names}. Eduardo segue sem novo horário, e Camila faltou ao pré-natal de hoje.`
      : 'Nenhuma falta registrada nesta semana.',
    analysis: {
      kicker: 'Comparecimento',
      title: `${list.length} falta${list.length === 1 ? '' : 's'} na semana`,
      narrative: 'Falta com exame alterado ou pré-natal entra na frente da fila de reconvocação.',
      metrics: [
        { label: 'Faltas', value: String(list.length), tone: 'alert' },
        { label: 'Sobre a semana', value: `${percent(list.length, weekAppointments().length)}%`, tone: 'warn' },
      ],
      columns: ['Quando', 'Paciente', 'Motivo', 'Profissional'],
      rows: list.map((item) => ({
        patientId: item.patientId,
        cells: [
          `${formatDay(item.date)} · ${item.time}`,
          patients.find((patient) => patient.id === item.patientId)?.name ?? '—',
          item.reason,
          professionalById(item.professionalId)?.name ?? '—',
        ],
      })),
      action: { view: 'agenda', filter: 'noshow', label: 'Faltas da semana' },
    },
    suggestions: ['Analise a evolução de Eduardo Pacheco', 'Quem ainda não confirmou?'],
  }
}

function waiting(): MaiaReply {
  const list = filterAppointments('waiting')
  const names = joinNames(
    [...new Set(list.map((item) => patients.find((patient) => patient.id === item.patientId)?.name ?? 'paciente'))],
  )
  return {
    text: `Há ${list.length} horários sem confirmação, todos de ${names}. O de hoje, às 14h, coincide com glicemia e HbA1c acima da meta. Eu confirmaria esse antes do de sábado.`,
    analysis: {
      kicker: 'Confirmações',
      title: 'Horários em aberto',
      narrative: 'Otávio Lima concentra os dois horários ainda sem confirmação.',
      metrics: [
        { label: 'Sem confirmação', value: String(list.length), tone: 'warn' },
        { label: 'Pacientes', value: '1', detail: 'Otávio Lima', tone: 'alert' },
      ],
      columns: ['Quando', 'Paciente', 'Motivo'],
      rows: list.map((item) => ({
        patientId: item.patientId,
        cells: [
          `${formatDay(item.date)} · ${item.time}`,
          patients.find((patient) => patient.id === item.patientId)?.name ?? '—',
          item.reason,
        ],
      })),
      action: { view: 'agenda', filter: 'waiting', label: 'Aguardando confirmação' },
    },
    suggestions: ['Analise a evolução de Otávio Lima', 'Como está a agenda de hoje?'],
  }
}

function altered(): MaiaReply {
  const list = alteredExams()
  const people = [...new Set(list.map((exam) => patients.find((patient) => patient.id === exam.patientId)?.name ?? ''))]
  const pending = pendingExams()
  return {
    text: `${list.length} resultados estão fora da referência, em ${joinNames(people)}. ${pending.length ? `Além disso, ${pending.map(examLabel).join(', ')} de ${patients.find((patient) => patient.id === pending[0].patientId)?.name} ainda não tem laudo.` : ''} O caso mais urgente da leitura é Otávio Lima, com glicemia de 186 mg/dL e HbA1c de 8,4%.`,
    analysis: {
      kicker: 'Laboratório',
      title: 'Resultados que pedem leitura',
      narrative: 'Nada aqui é diagnóstico novo. É o que o laboratório já devolveu para a plataforma.',
      metrics: [
        { label: 'Alterados', value: String(list.length), tone: 'alert' },
        { label: 'Pacientes', value: String(people.length), tone: 'warn' },
        { label: 'Pendentes', value: String(pending.length), detail: 'Hemograma', tone: 'warn' },
      ],
      columns: ['Paciente', 'Exame', 'Resultado', 'Referência'],
      rows: list.map((exam) => ({
        patientId: exam.patientId,
        cells: [
          patients.find((patient) => patient.id === exam.patientId)?.name ?? '—',
          exam.name,
          exam.unit ? `${exam.value} ${exam.unit}` : exam.value,
          exam.reference,
        ],
      })),
      action: { view: 'patients', filter: 'altered', label: 'Pacientes com exame alterado' },
    },
    suggestions: ['Analise a evolução de Otávio Lima', 'Analise a evolução de Helena Duarte'],
  }
}

function bottlenecks(): MaiaReply {
  const missed = filterAppointments('noshow').length
  const pending = pendingExams().length
  const alteredPeople = new Set(alteredExams().map((exam) => exam.patientId)).size
  return {
    text: 'Três frentes pedem ação hoje. Camila Ferreira faltou ao pré-natal das 10h. Otávio Lima segue sem confirmar as 14h, com glicemia e HbA1c subindo. Eduardo Pacheco faltou dia 29, o LDL está em 168 mg/dL e não há retorno na agenda.',
    analysis: {
      kicker: 'Leitura da semana',
      title: 'Onde a clínica precisa agir',
      narrative: 'A ordem abaixo segue urgência clínica operacional, não ordem de chegada.',
      metrics: [
        { label: 'Faltas', value: String(missed), tone: 'alert' },
        { label: 'Com exame alterado', value: String(alteredPeople), tone: 'warn' },
        { label: 'Laudo pendente', value: String(pending), tone: 'warn' },
        { label: 'Meta de presença', value: `${percent(weekAppointments().length - missed, weekAppointments().length)}%`, detail: 'semana', tone: 'neutral' },
      ],
      bars: [
        { label: 'Pré-natal sem comparecimento', value: 92, display: 'Camila · hoje 10h', tone: 'alert' },
        { label: 'Diabetes sem confirmação', value: 84, display: 'Otávio · hoje 14h', tone: 'alert' },
        { label: 'LDL alto e sem retorno', value: 76, display: 'Eduardo · falta em 29 set', tone: 'warn' },
        { label: 'Hemograma sem laudo', value: 48, display: 'Paulo · pós-operatório', tone: 'warn' },
      ],
      action: { view: 'indicators', label: 'Indicadores da semana' },
    },
    suggestions: ['Quem faltou essa semana?', 'Analise a evolução de Otávio Lima'],
  }
}

function productivity(): MaiaReply {
  const rows = professionalLoad()
  const busiest = [...rows].sort((a, b) => b.scheduled - a.scheduled)[0]
  return {
    text: `Na semana, ${weekAppointments().length} horários foram lançados. ${busiest.professional.name.split(' ').slice(-2).join(' ')} e a clínica médica dividem o maior volume. Nutrição está com a agenda mais curta, e as duas faltas ficam em clínica médica e cardiologia.`,
    analysis: {
      kicker: 'Indicadores',
      title: 'Carga por profissional',
      narrative: 'Realizado conta consulta já concluída. Falta e aguardando continuam na carga porque ocuparam a grade.',
      metrics: rows.map((row) => ({
        label: row.professional.name.replace('Dra. ', '').replace('Dr. ', ''),
        value: String(row.scheduled),
        detail: `${row.done} realizadas`,
        tone: row.missed ? 'warn' : 'neutral',
      })),
      columns: ['Profissional', 'Grade', 'Realizadas', 'Faltas', 'Aguardando'],
      rows: rows.map((row) => ({
        cells: [
          row.professional.name,
          String(row.scheduled),
          String(row.done),
          String(row.missed),
          String(row.waiting),
        ],
      })),
      bars: rows.map((row) => ({
        label: row.professional.role,
        value: row.scheduled,
        display: `${row.scheduled} horários`,
        tone: row.missed ? 'warn' : 'good',
      })),
      action: { view: 'indicators', label: 'Indicadores da semana' },
    },
    suggestions: ['Onde estão os gargalos da semana?', 'Como está a agenda de hoje?'],
  }
}

function evolution(patient: Patient): MaiaReply {
  const vital = latestVital(patient)
  const exams = examsFor(patient.id)
  const visits = appointmentsFor(patient.id)
  const next = visits.find((item) => item.date >= TODAY && item.status !== 'falta' && item.status !== 'realizada')
  const missed = visits.find((item) => item.status === 'falta')
  const altered = exams.filter((exam) => exam.status === 'alterado')
  const narrative = evolutionNarrative(patient, Boolean(next), Boolean(missed))

  const bars = patient.vitals.flatMap((entry) => {
    if (entry.systolic) {
      return [{ label: formatDay(entry.date), value: entry.systolic, display: `${entry.systolic}/${entry.diastolic}`, tone: entry.systolic >= 140 ? 'alert' as const : 'good' as const }]
    }
    if (entry.glucose) {
      return [{ label: formatDay(entry.date), value: entry.glucose, display: `${entry.glucose} mg/dL`, tone: entry.glucose >= 126 ? 'alert' as const : 'good' as const }]
    }
    if (entry.weight) {
      return [{ label: formatDay(entry.date), value: entry.weight, display: `${entry.weight.toString().replace('.', ',')} kg`, tone: 'good' as const }]
    }
    if (entry.ldl) {
      return [{ label: formatDay(entry.date), value: entry.ldl, display: `LDL ${entry.ldl}`, tone: entry.ldl >= 100 ? 'alert' as const : 'good' as const }]
    }
    return []
  })

  return {
    text: narrative,
    analysis: {
      kicker: 'Evolução no prontuário',
      title: patient.name,
      narrative: patient.notes,
      metrics: [
        { label: 'Idade', value: `${patient.age}`, detail: 'anos', tone: 'neutral' },
        {
          label: 'Última leitura',
          value: pressure(patient) ?? (vital?.glucose ? `${vital.glucose}` : vital?.weight ? `${String(vital.weight).replace('.', ',')} kg` : vital?.ldl ? `LDL ${vital.ldl}` : '—'),
          detail: vital ? formatDay(vital.date) : undefined,
          tone: altered.length || (vital?.systolic && vital.systolic >= 140) ? 'alert' : 'good',
        },
        { label: 'Exames alterados', value: String(altered.length), tone: altered.length ? 'alert' : 'good' },
        {
          label: next ? 'Próximo horário' : 'Retorno',
          value: next ? (next.date === TODAY ? `Hoje ${next.time}` : `${formatDay(next.date)} ${next.time}`) : 'Sem horário',
          tone: next ? 'good' : 'warn',
        },
      ],
      bars: bars.length > 1 ? bars : undefined,
      columns: exams.length ? ['Exame', 'Resultado', 'Situação'] : undefined,
      rows: exams.map((exam) => ({
        cells: [
          exam.name,
          exam.unit ? `${exam.value} ${exam.unit}` : exam.value,
          exam.status === 'alterado' ? 'Alterado' : exam.status === 'pendente' ? 'Pendente' : 'Normal',
        ],
      })),
      action: { view: 'patient', patientId: patient.id, label: patient.name },
    },
    suggestions: ['Quais exames vieram alterados?', 'Onde estão os gargalos da semana?'],
  }
}

function evolutionNarrative(patient: Patient, hasNext: boolean, missed: boolean) {
  const name = firstName(patient)
  if (patient.id === 'helena') {
    return `${name} está em retorno hoje às 08:30. A pressão foi de 138/88 para 152/94 mmHg, e a HbA1c de 6,4% para 7,1%. O prontuário registra hipertensão e uso irregular da medicação já prescrita. Eu não ajusto conduta — a curva está subindo e o horário de hoje é o momento de revisar.`
  }
  if (patient.id === 'otavio') {
    return `${name} tem diabetes mellitus tipo 2 registrado. A glicemia de jejum foi 142, 164 e agora 186 mg/dL. A HbA1c chegou a 8,4%. O horário de hoje às 14h ainda não foi confirmado.`
  }
  if (patient.id === 'eduardo') {
    return `${name} faltou em 29 de setembro. O LDL passou de 142 para 168 mg/dL e não há outro horário na grade. O prontuário registra doença arterial coronariana. A análise para por aqui: falta reconvocação, não uma conduta.`
  }
  if (patient.id === 'beatriz') {
    return `${name} segue o plano nutricional. O peso foi de 71,2 kg para 65,4 kg entre julho e 30 de setembro. Os exames lançados estão na referência, e a consulta de hoje às 16:15 está confirmada.`
  }
  if (patient.id === 'camila') {
    return `${name} está no pré-natal, 22 semanas, e faltou à consulta de hoje às 10h. O hemograma de setembro está normal e não há intercorrência nova lançada. O próximo passo operacional é reconvocar.`
  }
  if (patient.id === 'paulo') {
    return `${name} está em pós-operatório de colecistectomia. A consulta de 30 de setembro foi realizada e a de hoje às 15:30 está confirmada. O hemograma de controle segue sem laudo.`
  }
  if (patient.id === 'rafael') {
    return `${name} veio para check-up. Glicemia de 92 mg/dL e hemograma normal em setembro. A consulta de hoje às 09:15 está confirmada e não há marcador alterado.`
  }
  const last = latestVital(patient)
  return `${patient.name}, ${patient.age} anos. Condições registradas: ${patient.conditions.join(', ')}. ${last ? `Último registro em ${formatDay(last.date)}.` : ''} ${missed ? 'Há falta na agenda.' : ''} ${hasNext ? 'Existe horário à frente.' : 'Não há retorno marcado.'}`
}

function conditions(patient: Patient): MaiaReply {
  const recorded = patient.conditions.join(', ')
  return {
    text: `No prontuário de ${patient.name} consta: ${recorded}. Isso é o que foi registrado pela equipe, não um diagnóstico que eu esteja fechando agora. ${patient.notes}`,
    analysis: {
      kicker: 'Prontuário',
      title: patient.name,
      narrative: 'Leitura do que já está escrito. Sem inferência além do registro.',
      metrics: patient.conditions.map((condition) => ({
        label: 'Registrado',
        value: condition,
        tone: 'neutral' as const,
      })),
      action: { view: 'patient', patientId: patient.id, label: patient.name },
    },
    suggestions: [`Analise a evolução de ${patient.name}`, 'Quais exames vieram alterados?'],
  }
}

function askWhichPatient(): MaiaReply {
  return {
    text: 'Consigo analisar um prontuário por vez. Me diz o nome — por exemplo Helena Duarte, Otávio Lima ou Eduardo Pacheco.',
    suggestions: [
      'Analise a evolução de Helena Duarte',
      'Analise a evolução de Otávio Lima',
      'Analise a evolução de Eduardo Pacheco',
    ],
  }
}

function helpTopic(text: string): MaiaReply | undefined {
  const topics: { keys: string[]; title: string; body: string; suggestion: string }[] = [
    {
      keys: ['como usar a agenda', 'marcar', 'reagendar', 'encaixe'],
      title: 'Agenda',
      body: 'A agenda junta os três profissionais da unidade. Cada horário tem status: confirmada, aguardando, realizada ou falta. Eu não remarco sozinha. Posso filtrar o dia, a semana, as faltas e o que ainda falta confirmar.',
      suggestion: 'Como está a agenda de hoje?',
    },
    {
      keys: ['prontuario', 'como lancar', 'evolucao clinica'],
      title: 'Prontuário',
      body: 'No prontuário eu leio condições, notas da equipe, sinais registrados e exames. Quando você pede uma evolução, eu mostro a série que existe e abro a ficha. Campo vazio continua vazio.',
      suggestion: 'Analise a evolução de Helena Duarte',
    },
    {
      keys: ['indicador', 'painel', 'dashboard'],
      title: 'Indicadores',
      body: 'O painel resume a semana: volume por profissional, faltas, exames alterados e laudos pendentes. É uma leitura operacional para a clínica, não um escore de desempenho individual.',
      suggestion: 'Como está a produtividade?',
    },
  ]
  const found = topics.find((topic) => topic.keys.some((key) => text.includes(norm(key))))
  if (!found) return undefined
  return {
    text: found.body,
    suggestions: [found.suggestion, 'O que você pode analisar?'],
  }
}

function fallback(): MaiaReply {
  return {
    text: 'Ainda não tenho uma leitura segura para isso dentro da INB Health. Eu respondo sobre a agenda, faltas, exames, indicadores e a evolução de quem está no prontuário. Se for conduta ou receita, a decisão fica com a equipe.',
    suggestions: NEXT_STEPS,
  }
}

export const WELCOME: MaiaReply = {
  text: `Oi, ${CLINIC.clinician.short}. Eu sou a Maia. Posso conversar sobre a rotina da ${CLINIC.name} e analisar agenda, exames e prontuário desta unidade — só com o que já foi registrado, sem fechar diagnóstico.`,
  suggestions: NEXT_STEPS,
}
