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
      <div className="flex gap-2 flex-col sm:flex-row">
        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="https://github.com/username/repo"
          className="flex-1 px-4 py-3 bg-bg-elev-1 border border-border rounded-md text-text outline-none focus:border-[var(--accent)]"
        />
        <button type="submit" className="px-5 py-3 rounded-md font-medium" style={{ background: "var(--accent)", color: "var(--bg)" }}>
          Analyze
        </button>
      </div>
      {error && <p className="mt-2 text-tile-bad text-sm">{error}</p>}
    </form>
  )
}
