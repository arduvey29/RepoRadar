import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LoadingState } from "../components/LoadingState"

const ORDER = ["code_quality", "docs", "deps", "tests", "ci", "security"]

export function Analyzing() {
  const loc = useLocation() as any
  const nav = useNavigate()
  const [done, setDone] = useState<Set<string>>(new Set())

  useEffect(() => {
    const t: any[] = []
    ORDER.forEach((k, i) => {
      t.push(setTimeout(() => setDone(prev => new Set(prev).add(k)), (i + 1) * 800))
    })
    t.push(setTimeout(() => nav("/report/mock-b"), 6000))
    return () => t.forEach(clearTimeout)
  }, [nav])

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full">
        <h2 className="text-center text-lg mb-4 text-text-muted">Auditing {loc.state?.url ?? "your repo"}…</h2>
        <LoadingState completed={done} />
      </div>
    </main>
  )
}
