import { useState } from "react"

const apiBase = import.meta.env.VITE_API_URL || ""

export function EmbedBadgeModal({ reportId, onClose }: { reportId: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/report/${reportId}`
  const badgeUrl = `${apiBase}/badge/${reportId}.svg`
  const md = `[![RepoRadar](${badgeUrl})](${shareUrl})`

  async function copy() {
    await navigator.clipboard.writeText(md)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-bg-elev-1 border border-border rounded-lg p-6 max-w-lg w-full">
        <h3 className="font-semibold mb-3">Embed in your README</h3>
        <img src={badgeUrl} alt="Badge preview" className="mb-3" />
        <pre className="bg-bg-elev-2 p-3 rounded-sm text-xs font-mono overflow-x-auto">{md}</pre>
        <div className="mt-3 flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-text-muted">Close</button>
          <button onClick={copy} className="px-3 py-1.5 text-sm rounded-md" style={{ background: "var(--accent)", color: "var(--bg)" }}>
            {copied ? "Copied!" : "Copy Markdown"}
          </button>
        </div>
      </div>
    </div>
  )
}
