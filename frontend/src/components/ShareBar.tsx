import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { EmbedBadgeModal } from "./EmbedBadgeModal"
import { Button } from "./Button"
import { postAnalyze } from "../lib/api"

interface Props {
  reportId: string
  repoUrl: string
  grade: string
  score: number
}

export function ShareBar({ reportId, repoUrl, grade, score }: Props) {
  const nav = useNavigate()
  const [copied, setCopied] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)
  const [reanalyzing, setReanalyzing] = useState(false)
  const shareUrl = `${window.location.origin}/report/${reportId}`

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function reanalyze() {
    if (reanalyzing) return
    setReanalyzing(true)
    try {
      const res = await postAnalyze(repoUrl, true)
      nav("/analyzing", { state: { url: repoUrl, report_id: res.report_id } })
    } catch (e) {
      setReanalyzing(false)
      nav("/", { state: { error: (e as Error).message } })
    }
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
        <Button tone="ghost" onClick={reanalyze} disabled={reanalyzing}>
          {reanalyzing ? "Starting…" : "Re-analyze"}
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
