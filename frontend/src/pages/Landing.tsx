import { useNavigate, useLocation } from "react-router-dom"
import { URLInput } from "../components/URLInput"

const EXAMPLES = [
  { label: "facebook/react", url: "https://github.com/facebook/react" },
  { label: "vercel/next.js", url: "https://github.com/vercel/next.js" },
  { label: "tailwindlabs/tailwindcss", url: "https://github.com/tailwindlabs/tailwindcss" },
]

export function Landing() {
  const nav = useNavigate()
  const loc = useLocation() as { state?: { error?: string } }

  function handle(url: string) {
    nav("/analyzing", { state: { url } })
  }

  return (
    <main data-grade="B" className="relative min-h-screen grid place-items-center p-6 overflow-hidden">
      <RadarBackdrop />

      <div className="relative w-full max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-text-muted mb-6">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          6-dimension static analysis · LLM synthesis
        </div>

        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">
          Repo<span style={{ color: "var(--accent)" }}>Radar</span>
        </h1>
        <p className="mt-4 text-text-muted text-lg">
          Paste a GitHub URL. Get an honest health report in 30 seconds.
        </p>

        <div className="mt-9 flex justify-center">
          <URLInput onSubmit={handle} />
        </div>

        {loc.state?.error && (
          <p className="mt-3 text-tile-bad text-sm">⚠ {loc.state.error}</p>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap text-sm">
          <span className="text-text-dim">Try:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.url}
              onClick={() => handle(ex.url)}
              className="px-3 py-1 rounded-full border border-border text-text-muted card-hover hover:text-text"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

/** Faint radar-scope motif behind the hero — ties the landing to the product. */
function RadarBackdrop() {
  const cx = 400
  const cy = 400
  const rings = [380, 285, 190, 95]
  const hex = (r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = ((-90 + i * 60) * Math.PI) / 180
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    }).join(" ")

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
      <div
        className="absolute"
        style={{
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--accent-tint) 0%, transparent 70%)",
        }}
      />
      <svg width="800" height="800" viewBox="0 0 800 800" className="opacity-[0.10]">
        {rings.map((r) => (
          <polygon key={r} points={hex(r)} fill="none" stroke="var(--accent)" strokeWidth={1} />
        ))}
        {Array.from({ length: 6 }, (_, i) => {
          const a = ((-90 + i * 60) * Math.PI) / 180
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + 380 * Math.cos(a)}
              y2={cy + 380 * Math.sin(a)}
              stroke="var(--accent)"
              strokeWidth={1}
            />
          )
        })}
        <g
          className="backdrop-spin"
          style={{ transformOrigin: `${cx}px ${cy}px`, animation: "backdrop-spin 14s linear infinite" }}
        >
          <defs>
            <linearGradient id="landing-sweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <polygon points={`${cx},${cy} ${cx},${cy - 380} ${cx + 329},${cy - 190}`} fill="url(#landing-sweep)" />
        </g>
      </svg>
    </div>
  )
}
