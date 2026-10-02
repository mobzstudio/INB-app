export type MarkerStatus = 'fora' | 'atencao' | 'otima'
export type Evolution = 'positiva' | 'negativa' | 'estavel'
export type Sex = 'masculino' | 'feminino' | 'intersexo'

export type Profile = {
  goals: string[]
  conditions: string[]
  activity: string | null
  heightCm: number | null
  weightKg: number | null
  sex: Sex | null
}

export type MarkerCard = {
  id: string
  name: string
  unit: string
  value: number
  previous: number
  valueLabel: string
  previousLabel: string
  status: MarkerStatus
  statusLabel: string
  evolution: Evolution
  evolutionLabel: string
  evolutionText: string
  why: string
  scale: [number, number]
  position: number
}

export type Analysis = {
  fileName: string
  markerCount: number
  summary: { fora: number; atencao: number; otima: number }
  markers: MarkerCard[]
  briefing: string
  profile: Profile
}

export type AgentReply = {
  text: string
  markerId?: string
}
