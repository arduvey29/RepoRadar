import type { DimensionResult } from "../lib/types"
import { tileStateForScore } from "../lib/grade"

const COLOR: Record<string, string> = {
  good: "var(--tile-good)",
  mid: "var(--tile-mid)",
  bad: "var(--tile-bad)",
}

export function DimensionDetail({ dim }: { dim: DimensionResult }) {
  const color = COLOR[tileStateForScore(dim.score)]
  return (
    <section
      id={`dim-${dim.key}`}
      className="rounded-md border border-border bg-bg-elev-1 p-5 scroll-mt-20"
    >
      <div className="flex justify-between items-baseline mb-2">
        <h3 className="text-lg font-semibold">{dim.name}</h3>
        <span className="text-xl font-semibold" style={{ color }}>
          {dim.score.toFixed(1)}
          <small className="text-text-dim font-normal text-sm">/10</small>
        </span>
      </div>
      <p className="text-text-muted text-sm mb-4">{dim.summary}</p>

      {dim.findings.length > 0 && (
        <div className="mb-3">
          <div className="text-xs uppercase tracking-wider text-text-dim mb-1">
            Findings
          </div>
          <ul className="text-sm text-text space-y-1">
            {dim.findings.map((f, i) => (
              <li key={i}>• {f.detail}</li>
            ))}
          </ul>
        </div>
      )}

      {dim.recommendations.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-text-dim mb-1">
            Recommendations
          </div>
          <ul className="text-sm text-text space-y-1">
            {dim.recommendations.map((r, i) => (
              <li key={i}>→ {r}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
