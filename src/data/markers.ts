import { TODAY, appointments, patients, professionals, type Patient } from './clinic'
import { formatDay, professionalById } from './selectors'

export const SESSION_PATIENT_ID = 'helena'

export type MarkerStatus = 'alterado' | 'atencao' | 'estavel'

export type MarkerPoint = {
  date: string
  value: number
  display: string
}

export type Marker = {
  id: string
  name: string
  question: string
  about: string
  reference: string
  status: MarkerStatus
  series: MarkerPoint[]
}

const session = patients.find((patient) => patient.id === SESSION_PATIENT_ID)

if (!session) {
  throw new Error('Paciente da sessão não encontrado')
}

export const sessionPatient: Patient = session

export function sessionMarkers(patient: Patient = sessionPatient): Marker[] {
  return [pressureMarker(patient), hba1cMarker(patient), weightMarker(patient)].filter((marker): marker is Marker => Boolean(marker))
}

export function markerById(id: string, patient: Patient = sessionPatient) {
  return sessionMarkers(patient).find((marker) => marker.id === id)
}

export function latestPoint(marker: Marker) {
  return marker.series[marker.series.length - 1]
}

export function previousPoint(marker: Marker) {
  return marker.series.length > 1 ? marker.series[marker.series.length - 2] : undefined
}

export function markerTone(status: MarkerStatus): 'alert' | 'warn' | 'good' {
  if (status === 'alterado') return 'alert'
  if (status === 'atencao') return 'warn'
  return 'good'
}

export function statusLabel(status: MarkerStatus) {
  if (status === 'alterado') return 'Acima da referência'
  if (status === 'atencao') return 'Em alta'
  return 'Estável'
}

export function nextVisit(patientId = SESSION_PATIENT_ID) {
  return appointments
    .filter((item) => item.patientId === patientId && item.date >= TODAY && item.status !== 'falta' && item.status !== 'realizada')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0]
}

export function visitLine(patientId = SESSION_PATIENT_ID) {
  const visit = nextVisit(patientId)
  if (!visit) return 'Não há retorno marcado no seu registro.'
  const doctor = professionalById(visit.professionalId)
  const when = visit.date === TODAY ? `hoje às ${visit.time}` : `${formatDay(visit.date)} às ${visit.time}`
  return `Seu retorno é ${when}, com ${doctor?.name ?? 'a equipe'}, para ${visit.reason.toLowerCase()}.`
}

export const careTeam = professionals

function pressureMarker(patient: Patient): Marker | undefined {
  const series = patient.vitals
    .filter((vital) => vital.systolic && vital.diastolic)
    .map((vital) => ({
      date: vital.date,
      value: vital.systolic as number,
      display: `${vital.systolic}/${vital.diastolic}`,
    }))
  if (series.length === 0) return undefined
  const latest = series[series.length - 1]
  return {
    id: 'pressao',
    name: 'Pressão arterial',
    question: 'O que aconteceu com a minha pressão?',
    about: 'É a força do sangue nas artérias. No seu registro, a referência do consultório fica abaixo de 140/90 mmHg.',
    reference: 'Abaixo de 140/90 mmHg',
    status: latest.value >= 140 || (patient.vitals.at(-1)?.diastolic ?? 0) >= 90 ? 'alterado' : 'estavel',
    series,
  }
}

function hba1cMarker(patient: Patient): Marker | undefined {
  const series = patient.vitals
    .filter((vital) => typeof vital.hba1c === 'number')
    .map((vital) => ({
      date: vital.date,
      value: vital.hba1c as number,
      display: `${String(vital.hba1c).replace('.', ',')}%`,
    }))
  if (series.length === 0) return undefined
  const latest = series[series.length - 1]
  return {
    id: 'hba1c',
    name: 'Hemoglobina glicada',
    question: 'A hemoglobina glicada subiu?',
    about: 'A hemoglobina glicada resume a média de açúcar no sangue ao longo de cerca de três meses. A referência deste exame é abaixo de 6,5%.',
    reference: 'Abaixo de 6,5%',
    status: latest.value >= 6.5 ? 'alterado' : 'estavel',
    series,
  }
}

function weightMarker(patient: Patient): Marker | undefined {
  const series = patient.vitals
    .filter((vital) => typeof vital.weight === 'number')
    .map((vital) => ({
      date: vital.date,
      value: vital.weight as number,
      display: `${String(vital.weight).replace('.', ',')} kg`,
    }))
  if (series.length === 0) return undefined
  const first = series[0]
  const latest = series[series.length - 1]
  return {
    id: 'peso',
    name: 'Peso',
    question: 'Meu peso mudou?',
    about: 'É o peso lançado nas suas consultas. Não há uma meta numérica escrita no registro.',
    reference: 'Sem meta numérica no registro',
    status: latest.value > first.value ? 'atencao' : 'estavel',
    series,
  }
}
