const STEPS = [
  { key: "code_quality", label: "Code Quality" },
  { key: "docs", label: "Docs" },
  { key: "deps", label: "Dependencies" },
  { key: "tests", label: "Tests" },
  { key: "ci", label: "CI/CD" },
  { key: "security", label: "Security" },
]

interface Props { completed: Set<string>; scores?: Record<string, number> }

export function LoadingState({ completed, scores = {} }: Props) {
  return (
    <ul className="space-y-2 max-w-md mx-auto">
      {STEPS.map(s => {
        const done = completed.has(s.key)
        return (
          <li key={s.key} className="flex justify-between p-3 bg-bg-elev-1 border border-border rounded-md">
            <span className="text-text">{s.label}</span>
            <span className={done ? "text-tile-good" : "text-text-muted"}>
              {done ? `✓ ${scores[s.key]?.toFixed(1) ?? ""}/10` : "Analyzing…"}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
