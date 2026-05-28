import { ScoreGauge } from "./ScoreGauge"
import type { ReportResult } from "../lib/types"

export function Hero({ report }: { report: ReportResult }) {
  return (
    <header className="flex items-center gap-5 p-7 rounded-lg border border-border" style={{ background: "linear-gradient(180deg, var(--accent-tint) 0%, var(--bg) 60%)" }}>
      <ScoreGauge score={report.overall_score} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{report.repo_name}</h1>
        <p className="text-text-muted text-sm mt-1">Repository health · audited just now</p>
        <div className="mt-2 flex gap-1.5 flex-wrap">
          <Chip>Grade {report.overall_grade}</Chip>
          <Chip>6 dimensions</Chip>
          <Chip>Public</Chip>
        </div>
      </div>
    </header>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-block px-2 py-0.5 border border-border rounded-full text-xs text-text-muted">{children}</span>
}
