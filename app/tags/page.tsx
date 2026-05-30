import type { Metadata } from 'next'
import { getAllTags } from '@/lib/posts'
import { TagsContent } from '@/app/tags-content'

export const metadata: Metadata = {
  title: 'Tags',
  description: 'Browse all topics and tags across the blog.',
}

export default function TagsPage() {
  const tags = getAllTags()

  return <TagsContent tags={tags} />
}
