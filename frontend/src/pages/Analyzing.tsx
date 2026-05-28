import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LoadingState } from "../components/LoadingState"
import { RadarChart } from "../components/RadarChart"
import { mockReports } from "../lib/mock-reports"

const ORDER = ["code_quality", "docs", "deps", "tests", "ci", "security"]

export function Analyzing() {
  const loc = useLocation() as { state?: { url?: string } }
  const nav = useNavigate()

  // Phase 1 stub target: mock-b. Phase 6 (Task 37) feeds real SSE scores here.
  const target = mockReports["mock-b"]
  const scoreByKey = Object.fromEntries(target.dimensions.map((d) => [d.key, d.score]))

  const [done, setDone] = useState<Set<string>>(new Set())
  const [values, setValues] = useState<Record<string, number>>({})

  useEffect(() => {
    // No started-guard: under StrictMode the effect runs, cleans up, then
    // re-runs. The guard + cleanup combo would cancel every timer and never
    // reschedule. Plain schedule + cleanup reschedules correctly on re-run.
    const timers: ReturnType<typeof setTimeout>[] = []
    ORDER.forEach((k, i) => {
      timers.push(
        setTimeout(() => {
          setValues((prev) => ({ ...prev, [k]: scoreByKey[k] }))
          setDone((prev) => new Set(prev).add(k))
        }, (i + 1) * 900)
      )
    })
    timers.push(setTimeout(() => nav("/report/mock-b"), ORDER.length * 900 + 1100))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main data-grade="B" className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-lg flex flex-col items-center">
        <h2 className="text-center text-lg mb-1 text-text">Auditing repository…</h2>
        <p className="text-center text-sm text-text-dim mb-6 break-all">
          {loc.state?.url ?? "your repo"}
        </p>
        <RadarChart dimensions={target.dimensions} size={340} values={values} sweep sweepSpeed={2} />
        <div className="w-full mt-8">
          <LoadingState completed={done} scores={scoreByKey} />
        </div>
      </div>
    </main>
  )
}
