import { describe, it, expect } from "vitest"
import { scoreToGrade, tileStateForScore } from "./grade"

describe("scoreToGrade", () => {
  it("returns A for >= 8.5", () => {
    expect(scoreToGrade(8.5)).toBe("A")
    expect(scoreToGrade(10)).toBe("A")
  })
  it("returns B for 6.5–8.4", () => {
    expect(scoreToGrade(6.5)).toBe("B")
    expect(scoreToGrade(8.4)).toBe("B")
  })
  it("returns C for 4.5–6.4", () => {
    expect(scoreToGrade(4.5)).toBe("C")
    expect(scoreToGrade(6.4)).toBe("C")
  })
  it("returns D for 3.0–4.4", () => {
    expect(scoreToGrade(3.0)).toBe("D")
    expect(scoreToGrade(4.4)).toBe("D")
  })
  it("returns F below 3.0", () => {
    expect(scoreToGrade(2.9)).toBe("F")
    expect(scoreToGrade(0)).toBe("F")
  })
})

describe("tileStateForScore", () => {
  it("returns good for >= 8", () => {
    expect(tileStateForScore(8)).toBe("good")
    expect(tileStateForScore(10)).toBe("good")
  })
  it("returns mid for 6 to 8", () => {
    expect(tileStateForScore(6)).toBe("mid")
    expect(tileStateForScore(7.9)).toBe("mid")
  })
  it("returns bad below 6", () => {
    expect(tileStateForScore(5.9)).toBe("bad")
    expect(tileStateForScore(0)).toBe("bad")
  })
})
