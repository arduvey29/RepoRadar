export type Grade = "A" | "B" | "C" | "D" | "F"

export function scoreToGrade(score: number): Grade {
  if (score >= 8.5) return "A"
  if (score >= 6.5) return "B"
  if (score >= 4.5) return "C"
  if (score >= 3.0) return "D"
  return "F"
}

export const tileStateForScore = (score: number): "good" | "mid" | "bad" =>
  score >= 8 ? "good" : score >= 6 ? "mid" : "bad"
