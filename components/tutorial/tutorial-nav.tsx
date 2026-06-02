import Link from 'next/link'
import type { TutorialMeta } from '@/types'

interface TutorialNavProps {
  prev: TutorialMeta | null
  next: TutorialMeta | null
}

export function TutorialNav({ prev, next }: TutorialNavProps) {
  if (!prev && !next) return null

  return (
    <nav
      style={{
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '1rem',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {prev && (
          <Link
            href={`/tutorial/${prev.slug}`}
            className="tutorial-nav-link"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              textDecoration: 'none',
              color: 'var(--text-2)',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'var(--text-3)',
              }}
            >
              ← Previous
            </span>
            <span
              style={{
                fontSize: '0.92rem',
                fontWeight: 500,
                color: 'var(--text-1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
        {next && (
          <Link
            href={`/tutorial/${next.slug}`}
            className="tutorial-nav-link"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              textDecoration: 'none',
              color: 'var(--text-2)',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'var(--text-3)',
              }}
            >
              Next →
            </span>
            <span
              style={{
                fontSize: '0.92rem',
                fontWeight: 500,
                color: 'var(--text-1)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  )
}
