import Link from 'next/link'
import type { NoteMeta } from '@/lib/notes'

interface Props {
  category: string
  prev: NoteMeta | null
  next: NoteMeta | null
}

export function NoteNav({ category, prev, next }: Props) {
  if (!prev && !next) return null

  return (
    <nav
      aria-label="上一篇 / 下一篇"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '3rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div style={{ flex: 1, textAlign: 'left' }}>
        {prev ? (
          <Link
            href={`/notes/${category}/${prev.slug}`}
            style={{ color: 'var(--primary)', textDecoration: 'none' }}
          >
            ← {prev.title}
          </Link>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>—</span>
        )}
      </div>
      <div style={{ flex: 1, textAlign: 'right' }}>
        {next ? (
          <Link
            href={`/notes/${category}/${next.slug}`}
            style={{ color: 'var(--primary)', textDecoration: 'none' }}
          >
            {next.title} →
          </Link>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>—</span>
        )}
      </div>
    </nav>
  )
}
