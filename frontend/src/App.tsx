import { mockReports } from "./lib/mock-reports"
import { DimensionGrid } from "./components/DimensionGrid"

export default function App() {
  const r = mockReports["mock-a"]
  return (
    <div data-grade={r.overall_grade} className="p-8 max-w-2xl mx-auto">
      <DimensionGrid dimensions={r.dimensions} />
    </div>
  )
}
