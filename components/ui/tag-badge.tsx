import type { ReactNode } from 'react'

export function TagBadge({ tag, children }: { tag: string; children?: ReactNode }) {
  return (
    <span className="chip">
      <span style={{ opacity: 0.55, fontWeight: 400 }}>#</span>
      {tag}
      {children}
    </span>
  )
}
