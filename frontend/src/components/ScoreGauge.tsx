interface Props {
  score: number
  size?: number
}

export function ScoreGauge({ score, size = 92 }: Props) {
  const pct = Math.min(100, Math.max(0, (score / 10) * 100))
  return (
    <div
      role="img"
      aria-label={`Score ${score.toFixed(1)} out of 10`}
      className="relative grid place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(var(--accent) 0 ${pct}%, #1a1a1f ${pct}%)`,
      }}
    >
      <div className="absolute inset-[7px] bg-bg rounded-full" />
      <span
        className="relative text-2xl font-semibold tracking-tight"
        style={{ color: "var(--accent)" }}
      >
        {score.toFixed(1)}
      </span>
    </div>
  )
}
