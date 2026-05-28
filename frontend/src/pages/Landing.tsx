import { useNavigate } from "react-router-dom"
import { URLInput } from "../components/URLInput"

export function Landing() {
  const nav = useNavigate()
  const DEMO_URL = "https://github.com/facebook/react"

  function handle(url: string) {
    nav("/analyzing", { state: { url } })
  }

  return (
    <main data-grade="B" className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">RepoRadar</h1>
        <p className="mt-3 text-text-muted">Audit any GitHub repo in 30 seconds.</p>
        <div className="mt-8 flex justify-center"><URLInput onSubmit={handle} /></div>
        <p className="mt-3 text-sm text-text-dim">
          No repo? <button onClick={() => handle(DEMO_URL)} className="text-accent underline">Try facebook/react</button>
        </p>
      </div>
    </main>
  )
}
