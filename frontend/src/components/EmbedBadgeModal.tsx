import { useState } from "react"
import { BadgePreview } from "./BadgePreview"
import { Button } from "./Button"

const apiBase = import.meta.env.VITE_API_URL || ""

interface Props {
  reportId: string
  grade: string
  score: number
  onClose: () => void
}

export function EmbedBadgeModal({ reportId, grade, score, onClose }: Props) {
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
        <div className="mb-3"><BadgePreview grade={grade} score={score} /></div>
        <pre className="bg-bg-elev-2 p-3 rounded-sm text-xs font-mono overflow-x-auto">{md}</pre>
        <div className="mt-3 flex gap-2 justify-end">
          <Button tone="ghost" onClick={onClose}>
            Close
          </Button>
          <Button tone="primary" onClick={copy}>
            {copied ? "Copied!" : "Copy Markdown"}
          </Button>
        </div>
      </div>
    </div>
  )
}
