import { mockReports } from "./lib/mock-reports"
import { Hero } from "./components/Hero"

export default function App() {
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      {["mock-a", "mock-b", "mock-c", "mock-f"].map((k) => {
        const r = mockReports[k]
        return (
          <div key={k} data-grade={r.overall_grade}>
            <Hero report={r} />
          </div>
        )
      })}
    </div>
  )
}
