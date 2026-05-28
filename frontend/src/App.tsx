import { ShareBar } from "./components/ShareBar"

export default function App() {
  return (
    <div data-grade="B" className="max-w-3xl mx-auto p-8">
      <ShareBar reportId="mock-b" onReanalyze={() => alert("re-analyze clicked")} />
    </div>
  )
}
