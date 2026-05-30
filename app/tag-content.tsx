'use client'

import Link from 'next/link'
import type { PostMeta, TagWithCount } from '@/types'
import { useTranslation } from '@/components/layout/language-provider'
import { PostList } from '@/components/posts/post-list'

export function TagContent({
  tag,
  posts,
  allTags,
  count,
}: {
  tag: string
  posts: PostMeta[]
  allTags: TagWithCount[]
  count: number
}) {
  const { t } = useTranslation()

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ marginBottom: '0.4rem' }}>
          <span style={{ color: 'var(--text-3)', fontWeight: 400, opacity: 0.5 }}>#</span>
          {tag}
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
          {t('tags.postCount', { count })}
        </p>
      </div>

      <PostList posts={posts} />

      <div
        style={{
          marginTop: '3rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border)',
        }}
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
          {t('tags.browse')}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {allTags.map(({ tag: t, count }) => (
            <Link
              key={t}
              href={`/tags/${encodeURIComponent(t)}`}
              className="chip"
            >
              #{t}
              {t !== tag && (
                <span style={{ opacity: 0.5 }}>({count})</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
