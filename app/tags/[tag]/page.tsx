import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllTags, getPostsByTag } from '@/lib/posts'
import { PostList } from '@/components/posts/post-list'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map(({ tag }) => ({ tag: encodeURIComponent(tag) }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params
  return {
    title: `#${tag}`,
    description: `Browse all posts tagged with "${tag}".`,
  }
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params
  const posts = getPostsByTag(tag)
  const allTags = getAllTags()
  const tagInfo = allTags.find((t) => t.tag === tag)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ marginBottom: '0.4rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>#</span>
          {tag}
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
          {tagInfo?.count ?? posts.length} post{posts.length !== 1 ? 's' : ''} tagged with this topic.
        </p>
      </div>

      <PostList posts={posts} />

      <div
        style={{
          marginTop: '3rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '0.75rem' }}>
          Browse all tags:
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
