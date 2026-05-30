import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllTags, getPostsByTag } from '@/lib/posts'
import { TagContent } from '@/app/tag-content'

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
    <TagContent
      tag={tag}
      posts={posts}
      allTags={allTags}
      count={tagInfo?.count ?? posts.length}
    />
  )
}
