'use client'

import type { PostMeta } from '@/types'
import { useTranslation } from '@/components/layout/language-provider'
import { PostCard } from '@/components/posts/post-card'

export function PostList({ posts }: { posts: PostMeta[] }) {
  const { t } = useTranslation()

  if (posts.length === 0) {
    return (
      <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '3rem 0' }}>
        {t('post.empty')}
      </p>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  )
}
