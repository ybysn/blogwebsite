import type { ReactNode } from 'react'

export function TagBadge({ tag, children }: { tag: string; children?: ReactNode }) {
  return (
    <span className="chip">
      #{tag}
      {children}
    </span>
  )
}
