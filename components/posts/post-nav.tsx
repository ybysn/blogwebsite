'use client'

import Link from 'next/link'
import type { PostMeta } from '@/types'
import { useTranslation } from '@/components/layout/language-provider'

export function PostNav({
  prev,
  next,
}: {
  prev: PostMeta | null
  next: PostMeta | null
}) {
  const { t } = useTranslation()

  if (!prev && !next) return null

  return (
    <nav
      className="post-nav"
      style={{
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div>
        {prev && (
          <Link href={`/posts/${prev.slug}`} className="post-nav-link">
            <span className="post-nav-label">{t('post.prev')}</span>
            <span className="post-nav-title">{prev.title}</span>
          </Link>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {next && (
          <Link href={`/posts/${next.slug}`} className="post-nav-link" style={{ alignItems: 'flex-end' }}>
            <span className="post-nav-label">{t('post.next')}</span>
            <span className="post-nav-title">{next.title}</span>
          </Link>
        )}
      </div>
    </nav>
  )
}
