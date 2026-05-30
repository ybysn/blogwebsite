import Link from 'next/link'
import type { ReactNode } from 'react'

export function TagBadge({ tag, children }: { tag: string; children?: ReactNode }) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      className="chip"
    >
      #{tag}
      {children}
    </Link>
  )
}
