import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { mockReports } from "../lib/mock-reports"
import type { ReportResult } from "../lib/types"
import { Hero } from "../components/Hero"
import { DimensionGrid } from "../components/DimensionGrid"
import { ShareBar } from "../components/ShareBar"
import { TopFixes } from "../components/TopFixes"
import { SynthesisPanel } from "../components/SynthesisPanel"
import { DimensionDetail } from "../components/DimensionDetail"

export function Report() {
  const { id } = useParams()
  const nav = useNavigate()
  const [report, setReport] = useState<ReportResult | null>(null)

  useEffect(() => {
    // Phase 1: read from mocks only. Phase 2+: fetch from API.
    if (id && mockReports[id]) setReport(mockReports[id])
  }, [id])

  if (!report) return <main className="p-8 text-text-muted">Report not found.</main>

  function scrollToDim(key: string) {
    document.getElementById(`dim-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <main data-grade={report.overall_grade} className="min-h-screen pb-16">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Hero report={report} />
        <DimensionGrid dimensions={report.dimensions} onSelect={scrollToDim} />
        <ShareBar reportId={report.report_id} onReanalyze={() => nav("/")} />
        <TopFixes fixes={report.top_fixes} />
        <SynthesisPanel text={report.synthesis} />
        <div className="space-y-4">
          {report.dimensions.map(d => <DimensionDetail key={d.key} dim={d} />)}
        </div>
      </div>
    </main>
  )
}
