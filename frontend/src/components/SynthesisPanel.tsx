export function SynthesisPanel({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean)
  return (
    <section className="max-w-[65ch] mx-auto">
      <div
        className="text-xs uppercase tracking-wider font-semibold mb-3"
        style={{ color: "var(--accent)" }}
      >
        Synthesis
      </div>
      <div className="space-y-4 leading-relaxed text-text">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  )
}
