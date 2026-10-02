import {
  TODAY,
  WEEK_END,
  WEEK_START,
  appointments,
  exams,
  patients,
  professionals,
  type Appointment,
  type Exam,
  type Patient,
  type Professional,
} from './clinic'

export type AgendaFilter = 'today' | 'week' | 'noshow' | 'waiting'

export function inWeek(date: string) {
  return date >= WEEK_START && date <= WEEK_END
}

export function patientById(id: string) {
  return patients.find((patient) => patient.id === id)
}

export function professionalById(id: string) {
  return professionals.find((professional) => professional.id === id)
}

export function todayAppointments() {
  return appointments
    .filter((item) => item.date === TODAY)
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))
}

export function weekAppointments() {
  return appointments
    .filter((item) => inWeek(item.date))
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
}

export function filterAppointments(filter: AgendaFilter) {
  if (filter === 'today') return todayAppointments()
  if (filter === 'week') return weekAppointments()
  if (filter === 'noshow') return weekAppointments().filter((item) => item.status === 'falta')
  return weekAppointments().filter((item) => item.status === 'aguardando')
}

export function countStatus(list: Appointment[], status: Appointment['status']) {
  return list.filter((item) => item.status === status).length
}

export function alteredExams() {
  return exams
    .filter((exam) => exam.status === 'alterado')
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function pendingExams() {
  return exams.filter((exam) => exam.status === 'pendente')
}

export function examsFor(patientId: string) {
  return exams
    .filter((exam) => exam.patientId === patientId)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function appointmentsFor(patientId: string) {
  return appointments
    .filter((item) => item.patientId === patientId)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
}

export function latestVital(patient: Patient) {
  return patient.vitals[patient.vitals.length - 1]
}

export type LoadRow = {
  professional: Professional
  scheduled: number
  done: number
  missed: number
  waiting: number
}

export function professionalLoad(): LoadRow[] {
  return professionals.map((professional) => {
    const list = weekAppointments().filter((item) => item.professionalId === professional.id)
    return {
      professional,
      scheduled: list.length,
      done: countStatus(list, 'realizada'),
      missed: countStatus(list, 'falta'),
      waiting: countStatus(list, 'aguardando'),
    }
  })
}

export function patientsWithAlteredExams() {
  const ids = new Set(alteredExams().map((exam) => exam.patientId))
  return patients.filter((patient) => ids.has(patient.id))
}

export function formatDay(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export function formatLongDay(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  const text = new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function joinNames(names: string[]) {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}

export function examLabel(exam: Exam) {
  const value = exam.unit ? `${exam.value} ${exam.unit}` : exam.value
  return `${exam.name} ${value}`.trim()
}

export function percent(part: number, total: number) {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}
