import { mockReports } from "./lib/mock-reports"
import { TopFixes } from "./components/TopFixes"
import { SynthesisPanel } from "./components/SynthesisPanel"
import { DimensionDetail } from "./components/DimensionDetail"

export default function App() {
  const r = mockReports["mock-b"]
  return (
    <div data-grade={r.overall_grade} className="max-w-3xl mx-auto p-8 space-y-6">
      <TopFixes fixes={r.top_fixes} />
      <SynthesisPanel text={r.synthesis} />
      {r.dimensions.map((d) => (
        <DimensionDetail key={d.key} dim={d} />
      ))}
    </div>
  )
}
