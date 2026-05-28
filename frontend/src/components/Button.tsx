import type { ButtonHTMLAttributes, ReactNode } from "react"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "primary" | "ghost"
  children: ReactNode
}

export function Button({ tone = "primary", children, className = "", ...rest }: Props) {
  const cls = `btn ${tone === "primary" ? "btn-primary" : "btn-ghost"} px-4 py-2 text-sm ${className}`
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}
