export type Tone = 'good' | 'warn' | 'alert' | 'neutral'

export type AppAction = {
  markerId?: string
  label: string
}

export type AnalysisMetric = {
  label: string
  value: string
  detail?: string
  tone: Tone
}

export type AnalysisBar = {
  label: string
  value: number
  display: string
  tone: Tone
}

export type AnalysisRow = {
  cells: string[]
  markerId?: string
}

export type Analysis = {
  kicker: string
  title: string
  narrative: string
  metrics: AnalysisMetric[]
  bars?: AnalysisBar[]
  columns?: string[]
  rows?: AnalysisRow[]
  action?: AppAction
}

export type MaiaReply = {
  text: string
  analysis?: Analysis
  suggestions: string[]
}
