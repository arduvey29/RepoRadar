import { useState } from "react"
import type { DimensionResult, ReportResult } from "../lib/types"

interface Props {
  report: ReportResult
  highlightKey?: string | null
  onHoverDimension?: (key: string | null) => void
}

export function SynthesisPanel({ report, highlightKey, onHoverDimension }: Props) {
  const [showFull, setShowFull] = useState(false)

  const strengths = report.dimensions
    .filter((d) => d.score >= 7.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  const weaknesses = report.dimensions
    .filter((d) => d.score < 6)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)

  const paragraphs = report.synthesis.split(/\n\n+/).filter(Boolean)

  return (
    <section>
      <p className="text-lg sm:text-xl font-semibold leading-snug mb-5">{report.verdict}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Column
          tone="good"
          title="Working well"
          dims={strengths}
          emptyText="No dimension scores in the strong range yet — every fix compounds."
          highlightKey={highlightKey}
          onHoverDimension={onHoverDimension}
        />
        <Column
          tone="bad"
          title="Hurting you"
          dims={weaknesses}
          emptyText="No major weaknesses — keep it up."
          highlightKey={highlightKey}
          onHoverDimension={onHoverDimension}
        />
      </div>

      <details className="mt-4 border-t border-border pt-3" open={showFull}>
        <summary
          className="cursor-pointer text-sm text-text-muted select-none"
          onClick={(e) => {
            e.preventDefault()
            setShowFull((v) => !v)
          }}
        >
          {showFull ? "Hide full assessment" : "Read the full assessment"}
        </summary>
        <div className="space-y-4 leading-relaxed text-text-muted text-sm mt-3 max-w-[65ch]">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </details>
    </section>
  )
}

interface ColumnProps {
  tone: "good" | "bad"
  title: string
  dims: DimensionResult[]
  emptyText: string
  highlightKey?: string | null
  onHoverDimension?: (key: string | null) => void
}

function Column({ tone, title, dims, emptyText, highlightKey, onHoverDimension }: ColumnProps) {
  const isGood = tone === "good"
  const accent = isGood ? "var(--tile-good)" : "var(--tile-bad)"
  const bg = isGood ? "rgba(76,195,138,0.07)" : "rgba(255,93,93,0.07)"
  const border = isGood ? "rgba(76,195,138,0.25)" : "rgba(255,93,93,0.25)"

  return (
    <div className="rounded-md p-4" style={{ background: bg, border: `1px solid ${border}` }}>
      <h4
        className="text-xs uppercase tracking-wider font-semibold mb-3"
        style={{ color: accent }}
      >
        {isGood ? "✓ " : "✗ "}
        {title}
      </h4>
      {dims.length === 0 ? (
        <p className="text-sm text-text-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-2.5">
          {dims.map((d) => (
            <li
              key={d.key}
              className="text-sm leading-snug rounded px-1.5 -mx-1.5 py-0.5 transition-colors"
              style={{ background: highlightKey === d.key ? "rgba(255,255,255,0.05)" : "transparent" }}
              onMouseEnter={() => onHoverDimension?.(d.key)}
              onMouseLeave={() => onHoverDimension?.(null)}
            >
              <b className="font-semibold">
                {d.name} {d.score.toFixed(1)}
              </b>{" "}
              <span className="text-text-muted">— {d.summary}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
