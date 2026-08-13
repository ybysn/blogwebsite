import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPostBySlug, getAllPostSlugs, getAdjacentPosts } from '@/lib/posts'
import { getCategoryById } from '@/lib/categories'
import { extractHeadings } from '@/lib/headings'
import { TagBadge } from '@/components/ui/tag-badge'
import { PostNav } from '@/components/posts/post-nav'
import { PostMetaDisplay } from '@/components/posts/post-meta-display'
import { GiscusComments } from '@/components/posts/giscus'
import { TableOfContents } from '@/components/posts/table-of-contents'
import { SITE_URL, AUTHOR } from '@/lib/constants'
import { MDXContent } from '@/components/posts/mdx-content'
import { Breadcrumbs } from '@/components/notes/breadcrumbs'
import { BlogPostingJsonLd } from '@/components/seo/blog-posting-jsonld'
import { ReadingProgress } from '@/components/posts/reading-progress'

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
    alternates: {
      canonical: `${SITE_URL}/posts/${slug}`,
    },
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
  const category = getCategoryById(meta.category)

  return (
    <div className="post-layout">
      <BlogPostingJsonLd
        title={meta.title}
        description={meta.description}
        date={meta.date}
        url={`${SITE_URL}/posts/${slug}`}
        author={AUTHOR}
        tags={meta.tags}
      />
      <TableOfContents headings={headings} />
      <article className="post-article">
        <Breadcrumbs
          items={[
            { label: '📝 文章', href: '/posts' },
            ...(category
              ? [
                  {
                    label: category.name['zh-CN'] ?? category.name.en,
                    href: `/posts/category/${category.id}`,
                  },
                ]
              : []),
            { label: meta.title },
          ]}
        />

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

        <PostNav prev={prev} next={next} />
        <GiscusComments />
      </article>
      <ReadingProgress />
    </div>
  )
}
