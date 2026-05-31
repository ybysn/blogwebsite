import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPostBySlug, getAllPostSlugs, getAdjacentPosts } from '@/lib/posts'
import { extractHeadings } from '@/lib/headings'
import { TagBadge } from '@/components/ui/tag-badge'
import { PostNav } from '@/components/posts/post-nav'
import { PostMetaDisplay } from '@/components/posts/post-meta-display'
import { GiscusComments } from '@/components/posts/giscus'
import { TableOfContents } from '@/components/posts/table-of-contents'
import { SITE_URL } from '@/lib/constants'
import { MDXContent } from '@/components/posts/mdx-content'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  const { meta } = post

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      publishedTime: meta.date,
      tags: meta.tags,
      url: `${SITE_URL}/posts/${slug}`,
      ...(meta.ogImage && { images: [meta.ogImage] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const { meta, content } = post
  const { prev, next } = getAdjacentPosts(slug)
  const headings = extractHeadings(content)

  return (
    <div className="post-layout">
      <article className="post-article">
        <header style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem' }}>
            {meta.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
          <h1 style={{ marginBottom: '0.75rem' }}>{meta.title}</h1>
          <PostMetaDisplay date={meta.date} readingTime={meta.readingTime} />
        </header>

        <div className="prose">
          <MDXContent source={content} />
        </div>

        <PostNav prev={prev} next={next} />
        <GiscusComments />
      </article>

      <TableOfContents headings={headings} />
    </div>
  )
}
