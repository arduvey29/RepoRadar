import type { ReactNode } from "react"
import { RadarChart } from "./RadarChart"
import { useCountUp } from "../lib/useTween"
import type { ReportResult } from "../lib/types"

interface Props {
  report: ReportResult
  highlightKey?: string | null
  onHoverDimension?: (key: string | null) => void
  onSelectDimension?: (key: string) => void
  /** Stack radar above metadata (for the sticky sidebar column). */
  vertical?: boolean
}

export function Hero({
  report,
  highlightKey,
  onHoverDimension,
  onSelectDimension,
  vertical = false,
}: Props) {
  const score = useCountUp(report.overall_score)
  return (
    <header
      className={
        "flex gap-6 p-7 rounded-lg border border-border " +
        (vertical ? "flex-col items-center text-center" : "flex-col sm:flex-row items-center")
      }
      style={{ background: "linear-gradient(180deg, var(--accent-tint) 0%, var(--bg) 60%)" }}
    >
      <RadarChart
        dimensions={report.dimensions}
        size={vertical ? 280 : 300}
        animateIn
        highlightKey={highlightKey}
        onHoverDimension={onHoverDimension}
        onSelectDimension={onSelectDimension}
      />
      <div className={vertical ? "" : "text-center sm:text-left"}>
        <div className="text-text-muted text-sm">Repository health</div>
        <h1 className="text-2xl font-semibold tracking-tight mt-0.5">{report.repo_name}</h1>
        <div className="mt-1 text-4xl font-bold tracking-tight" style={{ color: "var(--accent)" }}>
          {score.toFixed(1)}
          <span className="text-text-dim text-lg font-normal"> / 10 · {report.overall_grade}</span>
        </div>
        <div
          className={
            "mt-3 flex gap-1.5 flex-wrap " +
            (vertical ? "justify-center" : "justify-center sm:justify-start")
          }
        >
          <Chip>Grade {report.overall_grade}</Chip>
          <Chip>6 dimensions</Chip>
          <Chip>Public</Chip>
        </div>
      </div>
    </header>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block px-2 py-0.5 border border-border rounded-full text-xs text-text-muted">
      {children}
    </span>
  )
}
