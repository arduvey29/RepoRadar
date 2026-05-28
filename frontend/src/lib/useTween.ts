import { useEffect, useRef, useState } from "react"

export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

export const easeOutBack = (t: number): number => {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  )
}

interface AnimatedValuesOpts {
  duration?: number
  easing?: (t: number) => number
  enabled?: boolean
}

/**
 * Eases an array of numbers toward `targets`. Whenever `targets` change, a fresh
 * tween starts from the currently displayed values. Used by RadarChart for both
 * the entrance grow (hero) and the per-spoke build-up (loading page).
 */
export function useAnimatedValues(
  targets: number[],
  { duration = 700, easing = easeOutCubic, enabled = true }: AnimatedValuesOpts = {}
): number[] {
  const reduce = prefersReducedMotion()
  const active = enabled && !reduce
  const [displayed, setDisplayed] = useState<number[]>(() =>
    active ? targets.map(() => 0) : targets
  )
  const displayedRef = useRef(displayed)
  displayedRef.current = displayed
  const rafRef = useRef<number | undefined>(undefined)

  const key = targets.join(",")
  useEffect(() => {
    if (!active) {
      setDisplayed(targets)
      return
    }
    const from = displayedRef.current.slice()
    while (from.length < targets.length) from.push(0)
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const e = easing(p)
      setDisplayed(targets.map((to, i) => from[i] + (to - (from[i] ?? 0)) * e))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active, duration])

  return displayed
}

/** Eases a single number from 0 → target (e.g. the count-up overall score). */
export function useCountUp(target: number, duration = 800, enabled = true): number {
  const reduce = prefersReducedMotion()
  const active = enabled && !reduce
  const [value, setValue] = useState(active ? 0 : target)
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!active) {
      setValue(target)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setValue(target * easeOutCubic(p))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, active])

  return value
}
