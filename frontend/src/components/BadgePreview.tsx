const GRADE_FILL: Record<string, string> = {
  A: "#4cc38a",
  B: "#f0b941",
  C: "#f08a3c",
  D: "#ff5d5d",
  F: "#ff5d5d",
}

/**
 * Inline SVG render of the README badge — mirrors the backend `/badge/{id}.svg`
 * endpoint (Task 34) so the embed-modal preview works without the backend running.
 */
export function BadgePreview({ grade, score }: { grade: string; score: number }) {
  const right = `${grade} ${score.toFixed(1)}`
  const fill = GRADE_FILL[grade] ?? "#f0b941"
  const leftW = 74
  const rightW = 16 + right.length * 8
  const total = leftW + rightW

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={total}
      height={20}
      role="img"
      aria-label={`RepoRadar: ${right}`}
    >
      <rect width={total} height={20} rx={3} fill="#333" />
      <rect x={leftW} width={rightW} height={20} rx={3} fill={fill} />
      <rect width={total} height={20} rx={3} fill="url(#g)" />
      <defs>
        <linearGradient id="g" x2="0" y2="100%">
          <stop offset="0" stopColor="#bbb" stopOpacity=".1" />
          <stop offset="1" stopOpacity=".1" />
        </linearGradient>
      </defs>
      <g fill="#fff" textAnchor="middle" fontFamily="Verdana,Geneva,sans-serif" fontSize={11}>
        <text x={leftW / 2} y={14}>
          RepoRadar
        </text>
        <text x={leftW + rightW / 2} y={14} fill="#0a0a0b">
          {right}
        </text>
      </g>
    </svg>
  )
}
