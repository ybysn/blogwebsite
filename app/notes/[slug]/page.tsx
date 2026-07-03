import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getNoteBySlug, getAllNoteSlugs } from '@/lib/notes'
import { extractHeadings } from '@/lib/headings'
import { TagBadge } from '@/components/ui/tag-badge'
import { PostMetaDisplay } from '@/components/posts/post-meta-display'
import { TableOfContents } from '@/components/posts/table-of-contents'
import { SITE_URL } from '@/lib/constants'
import { MDXContent } from '@/components/posts/mdx-content'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllNoteSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const note = getNoteBySlug(slug)
  if (!note) return { title: '笔记未找到' }

  return {
    title: note.meta.title,
    description: note.meta.description,
    openGraph: {
      title: note.meta.title,
      description: note.meta.description,
      type: 'article',
      publishedTime: note.meta.date,
      tags: note.meta.tags,
      url: `${SITE_URL}/notes/${slug}`,
    },
  }
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params
  const note = getNoteBySlug(slug)
  if (!note) notFound()

  const { meta, content } = note
  const headings = extractHeadings(content)

  return (
    <div className="post-layout">
      <TableOfContents headings={headings} />
      <article className="post-article">
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ marginBottom: '0.75rem' }}>{meta.title}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem' }}>
            {meta.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
          <PostMetaDisplay date={meta.date} readingTime={meta.readingTime} />
        </header>
        <div className="prose article-content">
          <MDXContent source={content} />
        </div>
      </article>
    </div>
  )
}
