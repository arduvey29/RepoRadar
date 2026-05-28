import type { ReportResult } from "./types"

const BASE = import.meta.env.VITE_API_URL || ""

export interface AnalyzeResponse {
  report_id: string
  status: "processing" | "complete" | "error" | "queued"
  cached?: boolean
  report?: ReportResult | null
  error?: string | null
}

export async function postAnalyze(repo_url: string, force = false): Promise<AnalyzeResponse> {
  const r = await fetch(`${BASE}/analyze${force ? "?force=1" : ""}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url }),
  })
  if (r.status === 429) {
    throw new Error("Slow down — too many audits in the last minute. Try again shortly.")
  }
  if (!r.ok) throw new Error(`Analyze failed (${r.status})`)
  return r.json()
}

export async function getReport(id: string): Promise<AnalyzeResponse> {
  const r = await fetch(`${BASE}/report/${id}`)
  if (r.status === 404) throw new Error("not_found")
  if (!r.ok) throw new Error(`Report fetch failed (${r.status})`)
  return r.json()
}
