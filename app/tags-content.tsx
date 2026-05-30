'use client'

import Link from 'next/link'
import type { TagWithCount } from '@/types'
import { useTranslation } from '@/components/layout/language-provider'

export function TagsContent({ tags }: { tags: TagWithCount[] }) {
  const { t } = useTranslation()

  if (tags.length === 0) {
    return (
      <div>
        <h1 style={{ marginBottom: '1.5rem' }}>{t('tags.title')}</h1>
        <p style={{ color: 'var(--color-muted)' }}>{t('tags.empty')}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>{t('tags.title')}</h1>
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
