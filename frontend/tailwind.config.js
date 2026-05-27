/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-elev-1": "var(--bg-elev-1)",
        "bg-elev-2": "var(--bg-elev-2)",
        border: "var(--border)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        "text-dim": "var(--text-dim)",
        accent: "var(--accent)",
        "accent-tint": "var(--accent-tint)",
        "tile-good": "var(--tile-good)",
        "tile-mid": "var(--tile-mid)",
        "tile-bad": "var(--tile-bad)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: { sm: "8px", md: "12px", lg: "16px" },
    },
  },
  plugins: [],
}
