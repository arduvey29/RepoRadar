import type { DimensionResult } from "../lib/types"
import { DimensionTile } from "./DimensionTile"

interface Props { dimensions: DimensionResult[]; onSelect?: (key: string) => void }

export function DimensionGrid({ dimensions, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {dimensions.map(d => (
        <DimensionTile key={d.key} dim={d} onClick={() => onSelect?.(d.key)} />
      ))}
    </div>
  )
}
