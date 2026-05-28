import { useState } from "react"
import type { FormEvent } from "react"

interface Props {
  onSubmit: (url: string) => void
  initialValue?: string
}

const GH_URL = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/

export function URLInput({ onSubmit, initialValue = "" }: Props) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    const v = value.trim()
    if (!GH_URL.test(v)) {
      setError("Use a full GitHub URL like https://github.com/owner/repo")
      return
    }
    setError(null)
    onSubmit(v)
  }

  return (
    <form onSubmit={submit} className="w-full max-w-2xl">
      <div
        className="flex gap-2 flex-col sm:flex-row sm:items-center sm:gap-2.5 p-2 rounded-xl border bg-bg-elev-1 transition-all duration-150"
        style={{
          borderColor: focused ? "var(--accent)" : "var(--border)",
          boxShadow: focused
            ? "0 0 0 4px var(--accent-tint), 0 8px 30px -12px var(--accent)"
            : "none",
        }}
      >
        <div className="flex items-center gap-2.5 flex-1 px-2">
          <GitHubMark />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="https://github.com/username/repo"
            className="flex-1 bg-transparent py-2.5 text-text outline-none placeholder:text-text-dim"
            aria-label="GitHub repository URL"
          />
        </div>
        <button type="submit" className="btn btn-primary px-5 py-2.5 text-sm shrink-0">
          Analyze
        </button>
      </div>
      {error && <p className="mt-2 text-tile-bad text-sm">{error}</p>}
    </form>
  )
}

function GitHubMark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="text-text-dim shrink-0"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}
