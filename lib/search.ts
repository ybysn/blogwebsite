import type { SearchDocument } from '@/types'
import { getAllPosts } from './posts'

export function getSearchDocuments(): SearchDocument[] {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    content: '', // content loaded on demand — titles + descriptions are enough for fast search
    tags: post.tags,
    date: post.date,
  }))
}
