import { useMemo, useState } from "react"
import type { DimensionResult } from "../lib/types"
import { useAnimatedValues, easeOutBack } from "../lib/useTween"

const AXES = [
  { key: "code_quality", short: "Code" },
  { key: "docs", short: "Docs" },
  { key: "deps", short: "Deps" },
  { key: "tests", short: "Tests" },
  { key: "ci", short: "CI" },
  { key: "security", short: "Security" },
]

interface Props {
  dimensions: DimensionResult[]
  size?: number
  /** Override displayed values per dimension key (loading mode grows these over time). */
  values?: Record<string, number>
  /** Entrance grow animation on mount (hero). */
  animateIn?: boolean
  /** Rotating radar-scope sweep line. */
  sweep?: boolean
  /** Seconds per sweep revolution. */
  sweepSpeed?: number
  /** Externally-driven highlighted dimension (cross-link from synthesis). */
  highlightKey?: string | null
  onHoverDimension?: (key: string | null) => void
  onSelectDimension?: (key: string) => void
}

function polar(cx: number, cy: number, R: number, value: number, i: number): [number, number] {
  const angle = ((-90 + i * 60) * Math.PI) / 180
  const r = (Math.max(0, Math.min(10, value)) / 10) * R
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
}

function hexPoints(cx: number, cy: number, R: number): string {
  return AXES.map((_, i) => polar(cx, cy, R, 10, i).join(",")).join(" ")
}

export function RadarChart({
  dimensions,
  size = 300,
  values,
  animateIn = false,
  sweep = false,
  sweepSpeed = 6,
  highlightKey = null,
  onHoverDimension,
  onSelectDimension,
}: Props) {
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 44

  const byKey = useMemo(
    () => Object.fromEntries(dimensions.map((d) => [d.key, d])),
    [dimensions]
  )

  // Targets in fixed AXES order; loading uses `values` override (default 0).
  const targets = AXES.map((a) =>
    values ? values[a.key] ?? 0 : byKey[a.key]?.score ?? 0
  )
  const displayed = useAnimatedValues(targets, {
    duration: animateIn ? 700 : 550,
    easing: easeOutBack,
    enabled: animateIn || !!values,
  })

  const [hovered, setHovered] = useState<string | null>(null)
  const active = hovered ?? highlightKey

  function setHover(key: string | null) {
    setHovered(key)
    onHoverDimension?.(key)
  }

  const dataPts = AXES.map((_, i) => polar(cx, cy, R, displayed[i] ?? 0, i))
  const dataPolygon = dataPts.map((p) => p.join(",")).join(" ")

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: "visible" }}
      role="img"
      aria-label="Repository health radar across six dimensions"
    >
      <style>{`
        @keyframes radar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes radar-ping { 0% { r: 4; opacity: .7; } 100% { r: 22; opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .radar-sweep { display: none; }
          .radar-ping { display: none; }
        }
      `}</style>

      {/* grid rings */}
      {[10, 6.6, 3.3].map((lvl) => (
        <polygon
          key={lvl}
          points={hexPoints(cx, cy, (lvl / 10) * R)}
          fill="none"
          stroke="#1d1d22"
          strokeWidth={1}
        />
      ))}

      {/* axes */}
      {AXES.map((a, i) => {
        const [x, y] = polar(cx, cy, R, 10, i)
        const on = active === a.key
        return (
          <line
            key={a.key}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={on ? "var(--accent)" : "#1d1d22"}
            strokeWidth={on ? 1.5 : 1}
          />
        )
      })}

      {/* rotating sweep */}
      {sweep && (
        <g
          className="radar-sweep"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: `radar-spin ${sweepSpeed}s linear infinite`,
          }}
        >
          <defs>
            <linearGradient id="sweepgrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.18" />
            </linearGradient>
          </defs>
          <polygon
            points={`${cx},${cy} ${polar(cx, cy, R, 10, 0).join(",")} ${polar(cx, cy, R, 10, 1).join(",")}`}
            fill="url(#sweepgrad)"
          />
          <line x1={cx} y1={cy} x2={cx} y2={cy - R} stroke="var(--accent)" strokeWidth={1.5} opacity={0.5} />
        </g>
      )}

      {/* data polygon */}
      <polygon
        points={dataPolygon}
        fill="var(--accent)"
        fillOpacity={0.18}
        stroke="var(--accent)"
        strokeWidth={2}
        style={{ transition: "fill-opacity 200ms ease" }}
      />

      {/* ping pulses for revealed vertices (loading) */}
      {dataPts.map(([x, y], i) =>
        (displayed[i] ?? 0) > 0.1 ? (
          <circle
            key={`ping-${AXES[i].key}`}
            className="radar-ping"
            cx={x}
            cy={y}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={1.5}
            style={{ animation: "radar-ping 600ms ease-out" }}
          />
        ) : null
      )}

      {/* vertices */}
      {dataPts.map(([x, y], i) => {
        const a = AXES[i]
        const on = active === a.key
        const dim = byKey[a.key]
        return (
          <g key={a.key}>
            <circle cx={x} cy={y} r={on ? 6 : 3.5} fill="var(--accent)" style={{ transition: "r 120ms ease" }} />
            {/* invisible larger hit target */}
            <circle
              cx={x}
              cy={y}
              r={16}
              fill="transparent"
              style={{ cursor: dim ? "pointer" : "default" }}
              onMouseEnter={() => setHover(a.key)}
              onMouseLeave={() => setHover(null)}
              onClick={() => dim && onSelectDimension?.(a.key)}
            />
          </g>
        )
      })}

      {/* labels */}
      {AXES.map((a, i) => {
        const [lx, ly] = polar(cx, cy, R + 18, 10, i)
        const anchor = Math.abs(lx - cx) < 6 ? "middle" : lx > cx ? "start" : "end"
        const on = active === a.key
        const dimmed = active && !on
        const dim = byKey[a.key]
        const score = (displayed[i] ?? 0).toFixed(1)
        return (
          <text
            key={a.key}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={11}
            fontFamily="Inter, system-ui, sans-serif"
            fill={on ? "var(--accent)" : "#b6b6bd"}
            opacity={dimmed ? 0.4 : 1}
            style={{ cursor: dim ? "pointer" : "default", transition: "opacity 120ms ease" }}
            onMouseEnter={() => setHover(a.key)}
            onMouseLeave={() => setHover(null)}
            onClick={() => dim && onSelectDimension?.(a.key)}
          >
            {a.short} {score}
          </text>
        )
      })}

      {/* hover tooltip */}
      {active && byKey[active] && (() => {
        const i = AXES.findIndex((a) => a.key === active)
        const [x, y] = dataPts[i]
        const d = byKey[active]
        return (
          <g pointerEvents="none">
            <rect
              x={x - 60}
              y={y - 34}
              width={120}
              height={22}
              rx={5}
              fill="#15151a"
              stroke="#2a2a32"
            />
            <text
              x={x}
              y={y - 23}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontFamily="Inter, system-ui, sans-serif"
              fill="#e8e8ea"
            >
              {d.name} · {d.score.toFixed(1)}/10
            </text>
          </g>
        )
      })()}
    </svg>
  )
}
