'use client'

import type { PostMeta } from '@/types'
import { useTranslation } from '@/components/layout/language-provider'
import { PostList } from '@/components/posts/post-list'

export function HomeContent({ posts }: { posts: PostMeta[] }) {
  const { t } = useTranslation()

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{t('home.latest')}</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem' }}>
          {t('home.tagline')}
        </p>
      </div>
      <PostList posts={posts} />
    </div>
  )
}
