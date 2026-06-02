import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getTutorialBySlug,
  getAllTutorialSlugs,
  getAdjacentTutorialPages,
  getTutorialNavigation,
  getTutorialMetaBySlug,
} from '@/lib/tutorial'
import { extractHeadings } from '@/lib/headings'
import { SITE_URL } from '@/lib/constants'
import { MDXContent } from '@/components/posts/mdx-content'
import { TutorialSidebar } from '@/components/tutorial/tutorial-sidebar'
import { TutorialNav } from '@/components/tutorial/tutorial-nav'
import { TutorialAttribution } from '@/components/tutorial/tutorial-attribution'
import { TableOfContents } from '@/components/posts/table-of-contents'
import { TagBadge } from '@/components/ui/tag-badge'
import { PostMetaDisplay } from '@/components/posts/post-meta-display'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateStaticParams() {
  const allSlugs = getAllTutorialSlugs()
  return allSlugs.map((segments) => ({ slug: segments }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const meta = getTutorialMetaBySlug(slug)

  if (!meta) {
    return { title: 'Not Found' }
  }

  return {
    title: meta.title,
    description: meta.description || meta.title,
    openGraph: {
      title: meta.title,
      description: meta.description || meta.title,
      type: 'article',
      publishedTime: meta.date,
      tags: meta.tags,
      url: `${SITE_URL}/tutorial/${meta.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description || meta.title,
    },
    alternates: meta.original_url
      ? { canonical: meta.original_url }
      : undefined,
  }
}

export default async function TutorialContentPage({
  params,
}: PageProps) {
  const { slug } = await params
  const tutorial = getTutorialBySlug(slug)

  if (!tutorial) {
    notFound()
  }

  const { meta, content } = tutorial
  const nav = getTutorialNavigation()
  const { prev, next } = getAdjacentTutorialPages(meta.slug)
  const headings = extractHeadings(content)

  // Build stage badge label
  const stageLabel =
    nav.stageLabels.find((s) => s.stage === meta.stage)?.label ||
    `Stage ${meta.stage}`

  return (
    <div className="tutorial-layout">
      <TutorialSidebar navigation={nav} currentSlug={meta.slug} />
      <article className="tutorial-article">
        <header style={{ marginBottom: '2.5rem' }}>
          <div
            className="tutorial-stage-badge"
            style={{ marginBottom: '0.75rem' }}
          >
            {stageLabel}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              marginBottom: '1rem',
            }}
          >
            {meta.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
          <h1 style={{ marginBottom: '0.75rem' }}>{meta.title}</h1>
          <PostMetaDisplay
            date={meta.date}
            readingTime={meta.readingTime}
          />
        </header>

        <div className="prose">
          <MDXContent source={content} />
        </div>

        <TutorialAttribution originalUrl={meta.original_url} />
        <TutorialNav prev={prev} next={next} />
      </article>
      <TableOfContents headings={headings} />
    </div>
  )
}
