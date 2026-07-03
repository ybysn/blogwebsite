'use client'

import Link from 'next/link'
import type { PostMeta } from '@/types'
import { formatDate, formatReadingTime } from '@/lib/utils'
import { useLocale } from '@/components/layout/language-provider'
import { TagBadge } from '@/components/ui/tag-badge'

export function PostCard({ post, basePath = '/posts' }: { post: PostMeta; basePath?: string }) {
  const { locale } = useLocale()

  return (
    <article className="post-card card animate-in">
      <div className="card-body">
        <Link
          href={`${basePath}/${post.slug}`}
          className="card-title-link"
        >
          {post.title}
        </Link>
        <div className="card-meta">
          <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          <span className="card-meta-dot" aria-hidden="true">&middot;</span>
          <span>{formatReadingTime(post.readingTime, locale)}</span>
        </div>
        <p className="card-desc">{post.description}</p>
        <div className="card-tags">
          {post.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      </div>
    </article>
  )
}
