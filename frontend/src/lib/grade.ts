export type Grade = "A" | "B" | "C" | "D" | "F"

export const tileStateForScore = (score: number): "good" | "mid" | "bad" =>
  score >= 8.5 ? "good" : score >= 6.5 ? "mid" : "bad"
