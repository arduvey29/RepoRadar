import { Link, useParams, useNavigate } from "react-router-dom"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { mockReports } from "../lib/mock-reports"
import { getReport } from "../lib/api"
import type { ReportResult } from "../lib/types"
import { Hero } from "../components/Hero"
import { ShareBar } from "../components/ShareBar"
import { TopFixes } from "../components/TopFixes"
import { SynthesisPanel } from "../components/SynthesisPanel"
import { DimensionDetail } from "../components/DimensionDetail"

/** Reveals the dashboard on the first scroll/wheel/touch. Skips the intro on
 * small screens and for reduced-motion users (renders revealed immediately). */
function useRevealOnScroll(): boolean {
  const [revealed, setRevealed] = useState(() => {
    if (typeof window === "undefined") return true
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const small = window.innerWidth < 1024
    return reduce || small
  })

  useEffect(() => {
    if (revealed) return
    const reveal = () => setRevealed(true)
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", "End", " ", "Spacebar"].includes(e.key)) reveal()
    }
    window.addEventListener("wheel", reveal, { passive: true, once: true })
    window.addEventListener("touchmove", reveal, { passive: true, once: true })
    window.addEventListener("scroll", reveal, { passive: true, once: true })
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("wheel", reveal)
      window.removeEventListener("touchmove", reveal)
      window.removeEventListener("scroll", reveal)
      window.removeEventListener("keydown", onKey)
    }
  }, [revealed])

  return revealed
}

export function Report() {
  const { id } = useParams()
  const nav = useNavigate()
  const [report, setReport] = useState<ReportResult | null>(() =>
    id && mockReports[id] ? mockReports[id] : null
  )
  const [status, setStatus] = useState<"loading" | "ready" | "notfound">(() =>
    id && mockReports[id] ? "ready" : "loading"
  )
  const [highlightKey, setHighlightKey] = useState<string | null>(null)
  const revealed = useRevealOnScroll()
  const heroRef = useRef<HTMLDivElement>(null)
  const [introTransform, setIntroTransform] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setStatus("notfound")
      return
    }
    if (mockReports[id]) {
      setReport(mockReports[id])
      setStatus("ready")
      return
    }
    let cancelled = false
    setStatus("loading")
    getReport(id)
      .then((res) => {
        if (cancelled) return
        if (res.report) {
          setReport(res.report)
          setStatus("ready")
        } else {
          setStatus("notfound")
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("notfound")
      })
    return () => {
      cancelled = true
    }
  }, [id])

  // Before paint, place the hero at viewport center while not yet revealed.
  useLayoutEffect(() => {
    if (revealed || !report) {
      setIntroTransform(null)
      return
    }
    const compute = () => {
      const el = heroRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = window.innerWidth / 2 - (r.left + r.width / 2)
      const dy = window.innerHeight / 2 - (r.top + r.height / 2)
      setIntroTransform(`translate(${dx}px, ${dy}px) scale(1.08)`)
    }
    compute()
    window.addEventListener("resize", compute)
    return () => window.removeEventListener("resize", compute)
  }, [revealed, report])

  if (status === "loading" && !report) {
    return (
      <main className="min-h-screen grid place-items-center p-8 text-text-muted">
        Loading report…
      </main>
    )
  }

  if (!report) {
    return (
      <main className="min-h-screen grid place-items-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Report not found</h2>
          <p className="text-text-muted mt-2">The link may have expired or the ID is wrong.</p>
          <Link to="/" className="link inline-block mt-4">
            Audit a new repo
          </Link>
        </div>
      </main>
    )
  }

  function scrollToDim(key: string) {
    document.getElementById(`dim-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const heroStyle = revealed
    ? { transform: "none", transition: "transform 800ms cubic-bezier(0.22,1,0.36,1)" }
    : { transform: introTransform ?? "none", transition: "none" }

  const revealStyle = {
    opacity: revealed ? 1 : 0,
    transform: revealed ? "none" : "translateY(20px)",
    transition: "opacity 600ms ease 220ms, transform 600ms ease 220ms",
    pointerEvents: revealed ? ("auto" as const) : ("none" as const),
  }

  return (
    <main data-grade={report.overall_grade} className="min-h-screen pb-16">
      <div className={revealed ? "" : "h-screen overflow-hidden"}>
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(360px,400px)_1fr] gap-6 lg:items-start">
            {/* Sticky summary column */}
            <div className="space-y-4 lg:sticky lg:top-6">
              <div ref={heroRef} style={heroStyle}>
                <Hero
                  report={report}
                  vertical
                  highlightKey={highlightKey}
                  onHoverDimension={setHighlightKey}
                  onSelectDimension={scrollToDim}
                />
              </div>
              <div style={revealStyle}>
                <ShareBar
                  reportId={report.report_id}
                  grade={report.overall_grade}
                  score={report.overall_score}
                  onReanalyze={() => nav("/")}
                />
              </div>
            </div>

            {/* Scrolling detail column */}
            <div className="space-y-6 min-w-0" style={revealStyle}>
              <SynthesisPanel
                report={report}
                highlightKey={highlightKey}
                onHoverDimension={setHighlightKey}
              />
              <TopFixes fixes={report.top_fixes} />
              <div className="space-y-4">
                {report.dimensions.map((d) => (
                  <DimensionDetail key={d.key} dim={d} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!revealed && <ScrollHint />}
    </main>
  )
}

function ScrollHint() {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-text-dim text-xs animate-pulse pointer-events-none">
      <span>Scroll to explore</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  )
}
