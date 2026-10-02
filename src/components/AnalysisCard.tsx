import type { Analysis } from '../maia/types'

type Props = {
  analysis: Analysis
  onAction: (analysis: Analysis) => void
  onFocusMarker: (markerId: string) => void
}

export function AnalysisCard({ analysis, onAction, onFocusMarker }: Props) {
  const max = analysis.bars ? Math.max(...analysis.bars.map((bar) => bar.value)) : 0
  const min = analysis.bars ? Math.min(...analysis.bars.map((bar) => bar.value)) : 0
  const span = Math.max(max - min, max * 0.28, 1)

  return (
    <article className="analysis">
      <header className="analysis-head">
        <p className="kicker">{analysis.kicker}</p>
        <h3>{analysis.title}</h3>
        <p>{analysis.narrative}</p>
      </header>
      <div className="metric-grid">
        {analysis.metrics.map((metric) => (
          <div key={`${metric.label}-${metric.value}`} className={`metric tone-${metric.tone}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            {metric.detail ? <em>{metric.detail}</em> : null}
          </div>
        ))}
      </div>
      {analysis.bars ? (
        <ul className="bars">
          {analysis.bars.map((bar) => {
            const width = Math.max(12, ((bar.value - (max - span)) / span) * 100)
            return (
              <li key={`${bar.label}-${bar.display}`}>
                <div className="bar-label">
                  <span>{bar.label}</span>
                  <b>{bar.display}</b>
                </div>
                <div className="bar-track">
                  <div className={`bar-fill tone-${bar.tone}`} style={{ width: `${width}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
      {analysis.columns && analysis.rows ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {analysis.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysis.rows.map((row, index) => (
                <tr
                  key={`${row.cells.join('-')}-${index}`}
                  className={row.markerId ? 'is-link' : undefined}
                  onClick={row.markerId ? () => onFocusMarker(row.markerId as string) : undefined}
                >
                  {row.cells.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`} className={toneClass(cell)}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {analysis.action ? (
        <button type="button" className="text-button" onClick={() => onAction(analysis)}>
          {analysis.action.label}
        </button>
      ) : null}
    </article>
  )
}

function toneClass(cell: string) {
  const value = cell.toLowerCase()
  if (value.includes('acima') || value === 'falta' || value === 'alterado') return 'cell-alert'
  if (value.includes('em alta') || value === 'aguardando' || value === 'pendente') return 'cell-warn'
  if (value.includes('estável') || value === 'estavel' || value === 'confirmada' || value === 'realizada' || value === 'normal') return 'cell-good'
  return undefined
}
