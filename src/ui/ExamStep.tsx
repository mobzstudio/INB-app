type Props = {
  reading: boolean
  error: string
  onBack: () => void
  onExample: () => void
  onFile: (file: File) => void
}

export function ExamStep({ reading, error, onBack, onExample, onFile }: Props) {
  return (
    <section className="screen">
      <button type="button" className="back" onClick={onBack} aria-label="Voltar">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M14.5 6.5 8.5 12l6 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <h1>Envie seu exame</h1>
      <p className="lede">A Maia lê o laudo no servidor, compara com o resultado anterior e monta os cards dos seus marcadores.</p>
      <div className="upload-card">
        <strong>Laudo em texto</strong>
        <p>Uma linha por marcador: nome;valor atual;valor anterior.</p>
        <label className="file">
          Escolher arquivo
          <input
            type="file"
            accept=".txt,.csv,text/plain"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onFile(file)
            }}
          />
        </label>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <footer className="dock">
        <button type="button" className="gold" onClick={onExample} disabled={reading}>
          {reading ? 'A Maia está lendo…' : 'Usar exame de exemplo'}
        </button>
      </footer>
    </section>
  )
}
