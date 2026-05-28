import { useState } from "react"
import { EmbedBadgeModal } from "./EmbedBadgeModal"

interface Props { reportId: string; onReanalyze: () => void }

export function ShareBar({ reportId, onReanalyze }: Props) {
  const [copied, setCopied] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)
  const shareUrl = `${window.location.origin}/report/${reportId}`

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <button onClick={copyLink} className="px-3 py-2 rounded-md font-medium text-sm" style={{ background: "var(--accent)", color: "var(--bg)" }}>
          {copied ? "Copied!" : "Copy share link"}
        </button>
        <button onClick={() => setShowEmbed(true)} className="px-3 py-2 rounded-md font-medium text-sm border border-border text-text">Embed badge</button>
        <button onClick={onReanalyze} className="px-3 py-2 rounded-md font-medium text-sm border border-border text-text-muted">Re-analyze</button>
      </div>
      {showEmbed && <EmbedBadgeModal reportId={reportId} onClose={() => setShowEmbed(false)} />}
    </>
  )
}
