import { describe, it, expect } from "vitest"
import { tileStateForScore } from "./grade"

describe("tileStateForScore", () => {
  it("returns good for >= 8.5", () => {
    expect(tileStateForScore(8.5)).toBe("good")
    expect(tileStateForScore(10)).toBe("good")
  })
  it("returns mid for 6.5 to 8.4", () => {
    expect(tileStateForScore(6.5)).toBe("mid")
    expect(tileStateForScore(8.4)).toBe("mid")
  })
  it("returns bad below 6.5", () => {
    expect(tileStateForScore(6.4)).toBe("bad")
    expect(tileStateForScore(0)).toBe("bad")
  })
})
