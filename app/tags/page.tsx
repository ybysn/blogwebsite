import type { Metadata } from 'next'
import { getAllTags } from '@/lib/posts'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tags',
  description: 'Browse all topics and tags across the blog.',
}

export default function TagsPage() {
  const tags = getAllTags()

  if (tags.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: '1.5rem' }}>Tags</h1>
        <p style={{ color: 'var(--color-muted)' }}>No tags yet.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Tags</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="chip"
            style={{ fontSize: '0.9rem', padding: '6px 14px' }}
          >
            #{tag}
            <span style={{ opacity: 0.5, marginLeft: '0.25rem' }}>({count})</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
