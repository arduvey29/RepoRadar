import { useState } from "react"
import { EmbedBadgeModal } from "./EmbedBadgeModal"
import { Button } from "./Button"

interface Props { reportId: string; grade: string; score: number; onReanalyze: () => void }

export function ShareBar({ reportId, grade, score, onReanalyze }: Props) {
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
        <Button tone="primary" onClick={copyLink}>
          {copied ? "Copied!" : "Copy share link"}
        </Button>
        <Button tone="ghost" onClick={() => setShowEmbed(true)}>
          Embed badge
        </Button>
        <Button tone="ghost" onClick={onReanalyze}>
          Re-analyze
        </Button>
      </div>
      {showEmbed && (
        <EmbedBadgeModal
          reportId={reportId}
          grade={grade}
          score={score}
          onClose={() => setShowEmbed(false)}
        />
      )}
    </>
  )
}
