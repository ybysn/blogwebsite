'use client'

import Link from 'next/link'

interface TutorialStageCardProps {
  title: string
  slug: string
  count: number
}

export function TutorialStageCard({
  title,
  slug,
  count,
}: TutorialStageCardProps) {
  return (
    <Link
      href={`/tutorial/${slug}`}
      className="tutorial-stage-card"
      style={{
        display: 'block',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 600,
            color: 'var(--text-1)',
            margin: 0,
          }}
        >
          {title}
        </h3>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 500,
            color: 'var(--accent-a)',
            background: 'var(--accent-glow)',
            padding: '2px 10px',
            borderRadius: '16px',
          }}
        >
          {count} chapters
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.88rem',
          color: 'var(--accent-a)',
          fontWeight: 500,
        }}
      >
        Start Learning →
      </div>
    </Link>
  )
}
