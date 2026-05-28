import { tileStateForScore } from "../lib/grade"
import type { DimensionResult } from "../lib/types"

interface Props { dim: DimensionResult; onClick?: () => void }

const COLOR: Record<string, string> = {
  good: "var(--tile-good)", mid: "var(--tile-mid)", bad: "var(--tile-bad)",
}

export function DimensionTile({ dim, onClick }: Props) {
  const state = tileStateForScore(dim.score)
  return (
    <button
      onClick={onClick}
      className="bg-bg-elev-2 border border-border rounded-md px-3 py-2 flex justify-between items-baseline card-hover text-left w-full"
    >
      <span className="text-text-muted text-sm">{dim.name}</span>
      <span className="font-semibold" style={{ color: COLOR[state] }}>
        {dim.score.toFixed(1)}<small className="text-text-dim font-normal ml-0.5 text-xs">/10</small>
      </span>
    </button>
  )
}
