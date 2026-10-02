import { ACTIVITIES, CONDITIONS, GOALS } from '../options'
import type { Profile, Sex } from '../../shared/types'

type Step = 'goals' | 'conditions' | 'activity' | 'profile'

type Props = {
  step: Step
  profile: Profile
  onChange: (profile: Profile) => void
  onBack: () => void
  onContinue: () => void
  onSkip: () => void
}

const COPY: Record<Step, { title: string; lede: string }> = {
  goals: {
    title: 'Quais são seus principais objetivos?',
    lede: 'Selecione as metas de saúde que você deseja alcançar conosco.',
  },
  conditions: {
    title: 'Alguma condição de saúde?',
    lede: 'Selecione ou informe condições relevantes para personalizar sua jornada.',
  },
  activity: {
    title: 'Nível de atividade atual?',
    lede: 'Como você descreveria seu nível de atividade física no seu dia a dia?',
  },
  profile: {
    title: 'Conte um pouco sobre seu perfil',
    lede: 'Essas informações nos ajudam a calcular metas metabólicas precisas.',
  },
}

export function Onboarding({ step, profile, onChange, onBack, onContinue, onSkip }: Props) {
  const copy = COPY[step]
  return (
    <section className="screen">
      <button type="button" className="back" onClick={onBack} aria-label="Voltar">
        <Chevron />
      </button>
      <h1>{copy.title}</h1>
      <p className="lede">{copy.lede}</p>
      {step === 'goals' ? (
        <OptionList
          mode="check"
          options={GOALS}
          selected={profile.goals}
          onToggle={(id) => onChange({ ...profile, goals: toggle(profile.goals, id) })}
        />
      ) : null}
      {step === 'conditions' ? (
        <OptionList
          mode="check"
          options={CONDITIONS}
          selected={profile.conditions}
          onToggle={(id) => onChange({ ...profile, conditions: toggle(profile.conditions, id) })}
        />
      ) : null}
      {step === 'activity' ? (
        <OptionList
          mode="radio"
          options={ACTIVITIES}
          selected={profile.activity ? [profile.activity] : []}
          onToggle={(id) => onChange({ ...profile, activity: id })}
        />
      ) : null}
      {step === 'profile' ? <ProfileFields profile={profile} onChange={onChange} /> : null}
      <footer className="dock">
        <button type="button" className="gold" onClick={onContinue}>
          Continuar
        </button>
        {step === 'profile' ? null : (
          <button type="button" className="skip" onClick={onSkip}>
            Prefiro não informar
          </button>
        )}
      </footer>
    </section>
  )
}

function OptionList({
  options,
  selected,
  onToggle,
  mode,
}: {
  options: { id: string; label: string; detail?: string }[]
  selected: string[]
  onToggle: (id: string) => void
  mode: 'check' | 'radio'
}) {
  return (
    <ul className="options">
      {options.map((option) => {
        const on = selected.includes(option.id)
        return (
          <li key={option.id}>
            <button type="button" className={on ? `option is-on ${mode}` : `option ${mode}`} onClick={() => onToggle(option.id)}>
              <span>
                <strong>{option.label}</strong>
                {option.detail ? <small>{option.detail}</small> : null}
              </span>
              <i aria-hidden="true" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function ProfileFields({ profile, onChange }: { profile: Profile; onChange: (profile: Profile) => void }) {
  return (
    <div className="fields">
      <label>
        Altura
        <span className="field">
          <input
            inputMode="decimal"
            value={profile.heightCm ?? ''}
            onChange={(event) => onChange({ ...profile, heightCm: read(event.target.value) })}
          />
          <em>cm</em>
        </span>
      </label>
      <label>
        Peso atual
        <span className="field">
          <input
            inputMode="decimal"
            value={profile.weightKg ?? ''}
            onChange={(event) => onChange({ ...profile, weightKg: read(event.target.value) })}
          />
          <em>kg</em>
        </span>
      </label>
      <label>
        Sexo biológico
        <span className="field">
          <select value={profile.sex ?? ''} onChange={(event) => onChange({ ...profile, sex: (event.target.value || null) as Sex | null })}>
            <option value="">Selecionar</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="intersexo">Intersexo</option>
          </select>
        </span>
      </label>
    </div>
  )
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

function read(value: string) {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) && value.trim() !== '' ? parsed : null
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M14.5 6.5 8.5 12l6 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
