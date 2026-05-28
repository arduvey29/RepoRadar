export function TopFixes({ fixes }: { fixes: string[] }) {
  if (!fixes.length) return null
  return (
    <section
      className="rounded-md p-4 border"
      style={{
        background: "var(--accent-tint)",
        borderColor: "color-mix(in srgb, var(--accent) 28%, var(--border))",
      }}
    >
      <div
        className="text-xs uppercase tracking-wider font-semibold mb-2"
        style={{ color: "var(--accent)" }}
      >
        ⚡ Top fixes
      </div>
      <ul className="space-y-1.5 text-sm text-text">
        {fixes.map((f, i) => (
          <li key={i}>
            {i + 1}. {f}
          </li>
        ))}
      </ul>
    </section>
  )
}
