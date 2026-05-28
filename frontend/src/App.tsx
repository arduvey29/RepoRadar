import { ScoreGauge } from "./components/ScoreGauge"

export default function App() {
  return (
    <div data-grade="A" className="p-12">
      <ScoreGauge score={9.2} />
    </div>
  )
}
