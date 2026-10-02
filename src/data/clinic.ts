export const TODAY = '2026-10-02'
export const WEEK_START = '2026-09-28'
export const WEEK_END = '2026-10-04'

export type AppointmentStatus = 'confirmada' | 'aguardando' | 'falta' | 'realizada'

export type Professional = {
  id: string
  name: string
  role: string
}

export type Vital = {
  date: string
  systolic?: number
  diastolic?: number
  glucose?: number
  hba1c?: number
  weight?: number
  ldl?: number
}

export type Patient = {
  id: string
  name: string
  age: number
  pronouns: 'ela' | 'ele'
  conditions: string[]
  notes: string
  vitals: Vital[]
}

export type Appointment = {
  id: string
  date: string
  time: string
  patientId: string
  professionalId: string
  status: AppointmentStatus
  reason: string
}

export type ExamStatus = 'normal' | 'alterado' | 'pendente'

export type Exam = {
  id: string
  patientId: string
  date: string
  name: string
  value: string
  unit: string
  status: ExamStatus
  reference: string
}

export const CLINIC = {
  name: 'INB Health',
  unit: 'Barra da Tijuca',
  clinician: {
    name: 'Marina Alves',
    role: 'Clínica médica',
    short: 'Marina',
  },
}

export const professionals: Professional[] = [
  { id: 'marina', name: 'Dra. Marina Alves', role: 'Clínica médica' },
  { id: 'henrique', name: 'Dr. Henrique Costa', role: 'Cardiologia' },
  { id: 'sofia', name: 'Dra. Sofia Prado', role: 'Nutrição' },
]

export const patients: Patient[] = [
  {
    id: 'helena',
    name: 'Helena Duarte',
    age: 54,
    pronouns: 'ela',
    conditions: ['Hipertensão arterial'],
    notes: 'Uso irregular de losartana nas últimas três semanas. Retorno marcado para revisar adesão.',
    vitals: [
      { date: '2026-07-02', systolic: 138, diastolic: 88, hba1c: 6.4, weight: 79 },
      { date: '2026-08-14', systolic: 146, diastolic: 90, hba1c: 6.6, weight: 80 },
      { date: '2026-10-01', systolic: 152, diastolic: 94, hba1c: 7.1, weight: 81 },
    ],
  },
  {
    id: 'rafael',
    name: 'Rafael Moura',
    age: 41,
    pronouns: 'ele',
    conditions: ['Check-up ocupacional'],
    notes: 'Sem queixas. Exames de setembro dentro da referência.',
    vitals: [
      { date: '2026-09-18', systolic: 118, diastolic: 76, glucose: 92, weight: 78 },
    ],
  },
  {
    id: 'camila',
    name: 'Camila Ferreira',
    age: 33,
    pronouns: 'ela',
    conditions: ['Pré-natal · 22 semanas'],
    notes: 'Faltou à consulta de hoje. Último ultrassom sem intercorrência registrada.',
    vitals: [
      { date: '2026-09-04', systolic: 110, diastolic: 70, weight: 64 },
    ],
  },
  {
    id: 'otavio',
    name: 'Otávio Lima',
    age: 67,
    pronouns: 'ele',
    conditions: ['Diabetes mellitus tipo 2', 'Dislipidemia'],
    notes: 'Glicemia de jejum e HbA1c acima da meta. Confirmação de hoje ainda pendente.',
    vitals: [
      { date: '2026-06-12', glucose: 142, hba1c: 7.6, weight: 88 },
      { date: '2026-08-20', glucose: 164, hba1c: 8.0, weight: 89 },
      { date: '2026-10-01', glucose: 186, hba1c: 8.4, weight: 90 },
    ],
  },
  {
    id: 'beatriz',
    name: 'Beatriz Nunes',
    age: 29,
    pronouns: 'ela',
    conditions: ['Acompanhamento nutricional'],
    notes: 'Plano alimentar em adesão. Peso em queda consistente desde julho.',
    vitals: [
      { date: '2026-07-16', weight: 71.2 },
      { date: '2026-08-27', weight: 68.4 },
      { date: '2026-09-30', weight: 65.4 },
    ],
  },
  {
    id: 'paulo',
    name: 'Paulo Siqueira',
    age: 58,
    pronouns: 'ele',
    conditions: ['Pós-operatório de colecistectomia'],
    notes: 'Cirurgia em 22/09. Hemograma de controle ainda sem laudo.',
    vitals: [
      { date: '2026-09-30', systolic: 128, diastolic: 82, weight: 84 },
    ],
  },
  {
    id: 'livia',
    name: 'Lívia Castro',
    age: 46,
    pronouns: 'ela',
    conditions: ['Enxaqueca episódica'],
    notes: 'Crises menos frequentes após ajuste do sono. Consulta de hoje confirmada.',
    vitals: [
      { date: '2026-09-28', systolic: 122, diastolic: 78, weight: 63 },
    ],
  },
  {
    id: 'eduardo',
    name: 'Eduardo Pacheco',
    age: 72,
    pronouns: 'ele',
    conditions: ['Doença arterial coronariana'],
    notes: 'Faltou ao retorno de 29/09. LDL acima da meta e sem nova data na agenda.',
    vitals: [
      { date: '2026-07-09', systolic: 136, diastolic: 84, ldl: 142 },
      { date: '2026-09-20', systolic: 134, diastolic: 82, ldl: 168 },
    ],
  },
]

export const appointments: Appointment[] = [
  { id: 'a1', date: '2026-09-28', time: '09:00', patientId: 'livia', professionalId: 'marina', status: 'realizada', reason: 'Enxaqueca' },
  { id: 'a2', date: '2026-09-29', time: '10:30', patientId: 'eduardo', professionalId: 'henrique', status: 'falta', reason: 'Retorno cardiológico' },
  { id: 'a3', date: '2026-09-30', time: '15:00', patientId: 'paulo', professionalId: 'henrique', status: 'realizada', reason: 'Pós-operatório' },
  { id: 'a4', date: '2026-09-30', time: '16:00', patientId: 'beatriz', professionalId: 'sofia', status: 'realizada', reason: 'Nutrição' },
  { id: 'a5', date: '2026-10-01', time: '08:40', patientId: 'helena', professionalId: 'marina', status: 'realizada', reason: 'Hipertensão' },
  { id: 'a6', date: '2026-10-01', time: '14:20', patientId: 'otavio', professionalId: 'henrique', status: 'realizada', reason: 'Diabetes' },
  { id: 'a7', date: '2026-10-02', time: '08:30', patientId: 'helena', professionalId: 'marina', status: 'confirmada', reason: 'Retorno hipertensão' },
  { id: 'a8', date: '2026-10-02', time: '09:15', patientId: 'rafael', professionalId: 'marina', status: 'confirmada', reason: 'Check-up' },
  { id: 'a9', date: '2026-10-02', time: '10:00', patientId: 'camila', professionalId: 'marina', status: 'falta', reason: 'Pré-natal' },
  { id: 'a10', date: '2026-10-02', time: '11:30', patientId: 'livia', professionalId: 'marina', status: 'confirmada', reason: 'Enxaqueca' },
  { id: 'a11', date: '2026-10-02', time: '14:00', patientId: 'otavio', professionalId: 'henrique', status: 'aguardando', reason: 'Diabetes' },
  { id: 'a12', date: '2026-10-02', time: '15:30', patientId: 'paulo', professionalId: 'henrique', status: 'confirmada', reason: 'Pós-operatório' },
  { id: 'a13', date: '2026-10-02', time: '16:15', patientId: 'beatriz', professionalId: 'sofia', status: 'confirmada', reason: 'Nutrição' },
  { id: 'a14', date: '2026-10-03', time: '09:00', patientId: 'rafael', professionalId: 'marina', status: 'confirmada', reason: 'Check-up' },
  { id: 'a15', date: '2026-10-03', time: '10:30', patientId: 'otavio', professionalId: 'henrique', status: 'aguardando', reason: 'Diabetes' },
]

export const exams: Exam[] = [
  { id: 'e1', patientId: 'helena', date: '2026-10-01', name: 'HbA1c', value: '7,1', unit: '%', status: 'alterado', reference: '< 6,5' },
  { id: 'e2', patientId: 'otavio', date: '2026-10-01', name: 'Glicemia de jejum', value: '186', unit: 'mg/dL', status: 'alterado', reference: '70–99' },
  { id: 'e3', patientId: 'otavio', date: '2026-10-01', name: 'HbA1c', value: '8,4', unit: '%', status: 'alterado', reference: '< 7,0' },
  { id: 'e4', patientId: 'eduardo', date: '2026-09-20', name: 'LDL', value: '168', unit: 'mg/dL', status: 'alterado', reference: '< 70' },
  { id: 'e5', patientId: 'paulo', date: '2026-10-01', name: 'Hemograma', value: '—', unit: '', status: 'pendente', reference: 'laudo' },
  { id: 'e6', patientId: 'rafael', date: '2026-09-18', name: 'Glicemia de jejum', value: '92', unit: 'mg/dL', status: 'normal', reference: '70–99' },
  { id: 'e7', patientId: 'rafael', date: '2026-09-18', name: 'Hemograma', value: 'normal', unit: '', status: 'normal', reference: 'referência' },
  { id: 'e8', patientId: 'camila', date: '2026-09-04', name: 'Hemograma', value: 'normal', unit: '', status: 'normal', reference: 'gestação' },
  { id: 'e9', patientId: 'livia', date: '2026-08-12', name: 'TSH', value: '2,1', unit: 'mUI/L', status: 'normal', reference: '0,4–4,0' },
  { id: 'e10', patientId: 'beatriz', date: '2026-09-30', name: 'Ferritina', value: '48', unit: 'ng/mL', status: 'normal', reference: '15–150' },
]

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmada: 'Confirmada',
  aguardando: 'Aguardando',
  falta: 'Falta',
  realizada: 'Realizada',
}
