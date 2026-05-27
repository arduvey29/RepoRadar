// TypeScript mirror of the future Pydantic backend models.
// Keep these shapes in sync with backend/models when Task 15 lands.

export interface Finding {
  category: string
  severity: "high" | "medium" | "low"
  detail: string
}

export interface DimensionResult {
  key: string
  name: string
  score: number
  grade: string
  summary: string
  findings: Finding[]
  recommendations: string[]
}

export interface ReportResult {
  report_id: string
  repo_url: string
  repo_name: string
  overall_score: number
  overall_grade: string
  dimensions: DimensionResult[]
  synthesis: string
  top_fixes: string[]
  generated_at: string
  shareable_url: string
}
