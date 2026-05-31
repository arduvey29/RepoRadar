import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LoadingState } from "../components/LoadingState"
import { RadarChart } from "../components/RadarChart"
import { mockReports } from "../lib/mock-reports"
import { postAnalyze, getReport } from "../lib/api"
import { subscribeProgress } from "../lib/sse"

function useResponsiveRadarSize(): number {
  const [size, setSize] = useState(() =>
    typeof window === "undefined" ? 340 : Math.min(340, window.innerWidth - 48)
  )
  useEffect(() => {
    const onResize = () => setSize(Math.min(340, window.innerWidth - 48))
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])
  return size
}

export function Analyzing() {
  const loc = useLocation() as { state?: { url?: string; report_id?: string } }
  const nav = useNavigate()
  const url = loc.state?.url
  const presetReportId = loc.state?.report_id

  // Skeleton dimensions for the radar shell; values are filled by SSE events as
  // each real analyzer completes.
  const skeleton = mockReports["mock-b"].dimensions
  const radarSize = useResponsiveRadarSize()

  const [done, setDone] = useState<Set<string>>(new Set())
  const [values, setValues] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!url) {
      nav("/")
      return
    }
    let cancelled = false
    let unsubscribe: (() => void) | null = null
    let pollHandle: ReturnType<typeof setTimeout> | null = null

    const handleEvent = (e: Parameters<Parameters<typeof subscribeProgress>[1]>[0]) => {
      if (cancelled) return
      if (e.type === "dimension") {
        setDone((prev) => new Set(prev).add(e.key))
        setValues((prev) => ({ ...prev, [e.key]: e.score }))
      } else if (e.type === "complete") {
        unsubscribe?.()
        nav(`/report/${e.report_id}`)
      } else if (e.type === "error") {
        unsubscribe?.()
        nav("/", { state: { error: e.error || "Analysis failed" } })
      }
    }

    const pollFallback = (id: string) => {
      const poll = async () => {
        if (cancelled) return
        try {
          const cur = await getReport(id)
          if (cancelled) return
          if (cur.status === "complete") {
            nav(`/report/${id}`)
            return
          }
          if (cur.status === "error") {
            nav("/", { state: { error: cur.error || "Analysis failed" } })
            return
          }
        } catch {
          /* transient — keep polling */
        }
        pollHandle = setTimeout(poll, 1500)
      }
      poll()
    }

    const start = (id: string) => {
      unsubscribe = subscribeProgress(id, handleEvent, () => {
        // SSE dropped — fall back to polling so the user still reaches the report.
        pollFallback(id)
      })
    }

    ;(async () => {
      if (presetReportId) {
        start(presetReportId)
        return
      }
      try {
        const res = await postAnalyze(url)
        if (cancelled) return
        if (res.cached && res.report) {
          nav(`/report/${res.report_id}`)
          return
        }
        start(res.report_id)
      } catch (e) {
        if (!cancelled) nav("/", { state: { error: (e as Error).message } })
      }
    })()
    return () => {
      cancelled = true
      unsubscribe?.()
      if (pollHandle) clearTimeout(pollHandle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main data-grade="B" className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-lg flex flex-col items-center">
        <h2 className="text-center text-lg mb-1 text-text">Auditing repository…</h2>
        <p className="text-center text-sm text-text-dim mb-6 break-all">{url ?? "your repo"}</p>
        <RadarChart dimensions={skeleton} size={radarSize} values={values} sweep sweepSpeed={2} />
        <div className="w-full mt-8">
          <LoadingState completed={done} scores={values} />
        </div>
      </div>
    </main>
  )
}
