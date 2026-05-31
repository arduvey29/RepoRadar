const BASE = import.meta.env.VITE_API_URL || ""

export type ProgressEvent =
  | { type: "dimension"; key: string; score: number }
  | { type: "complete"; report_id: string }
  | { type: "error"; error?: string }

export function subscribeProgress(
  reportId: string,
  onEvent: (e: ProgressEvent) => void,
  onError?: () => void,
): () => void {
  const es = new EventSource(`${BASE}/report/${reportId}/stream`)
  es.onmessage = (m) => {
    try {
      onEvent(JSON.parse(m.data) as ProgressEvent)
    } catch {
      /* malformed event — ignore */
    }
  }
  es.onerror = () => {
    es.close()
    onError?.()
  }
  return () => es.close()
}
