import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LoadingState } from "../components/LoadingState"
import { RadarChart } from "../components/RadarChart"
import { mockReports } from "../lib/mock-reports"
import { postAnalyze, getReport } from "../lib/api"

const ORDER = ["code_quality", "docs", "deps", "tests", "ci", "security"]

export function Analyzing() {
  const loc = useLocation() as { state?: { url?: string } }
  const nav = useNavigate()
  const url = loc.state?.url

  // Decorative build target while we wait. Real per-spoke values arrive via SSE in Task 37.
  const target = mockReports["mock-b"]
  const scoreByKey = Object.fromEntries(target.dimensions.map((d) => [d.key, d.score]))

  const [done, setDone] = useState<Set<string>>(new Set())
  const [values, setValues] = useState<Record<string, number>>({})
  const [buildDone, setBuildDone] = useState(false)
  const [realId, setRealId] = useState<string | null>(null)

  // Kick off the real analysis + poll for completion.
  useEffect(() => {
    if (!url) {
      nav("/")
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await postAnalyze(url)
        if (cancelled) return
        if (res.cached && res.report) {
          nav(`/report/${res.report_id}`)
          return
        }
        const id = res.report_id
        const poll = async () => {
          if (cancelled) return
          try {
            const cur = await getReport(id)
            if (cancelled) return
            if (cur.status === "complete") {
              setRealId(id)
              return
            }
            if (cur.status === "error") {
              nav("/", { state: { error: cur.error || "Analysis failed" } })
              return
            }
          } catch {
            /* transient — keep polling */
          }
          setTimeout(poll, 1200)
        }
        poll()
      } catch (e) {
        if (!cancelled) nav("/", { state: { error: (e as Error).message } })
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Decorative spoke build-up (no started-guard so it survives StrictMode re-run).
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    ORDER.forEach((k, i) => {
      timers.push(
        setTimeout(() => {
          setValues((prev) => ({ ...prev, [k]: scoreByKey[k] }))
          setDone((prev) => new Set(prev).add(k))
        }, (i + 1) * 900)
      )
    })
    timers.push(setTimeout(() => setBuildDone(true), ORDER.length * 900 + 400))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Navigate once BOTH the animation finished and the report is ready.
  useEffect(() => {
    if (buildDone && realId) nav(`/report/${realId}`)
  }, [buildDone, realId, nav])

  return (
    <main data-grade="B" className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-lg flex flex-col items-center">
        <h2 className="text-center text-lg mb-1 text-text">Auditing repository…</h2>
        <p className="text-center text-sm text-text-dim mb-6 break-all">{url ?? "your repo"}</p>
        <RadarChart dimensions={target.dimensions} size={340} values={values} sweep sweepSpeed={2} />
        <div className="w-full mt-8">
          <LoadingState completed={done} scores={scoreByKey} />
        </div>
      </div>
    </main>
  )
}
