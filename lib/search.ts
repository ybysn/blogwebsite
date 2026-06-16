import type { SearchDocument } from '@/types'
import { getAllPosts } from './posts'
import { getAllTutorials } from './tutorial'

export function getSearchDocuments(): SearchDocument[] {
  const posts = getAllPosts()
  const tutorials = getAllTutorials()

  const postDocs: SearchDocument[] = posts.map((post) => ({
    slug: post.slug,
    href: `/posts/${post.slug}`,
    title: post.title,
    description: post.description,
    content: '',
    tags: post.tags,
    date: post.date,
  }))

  const tutorialDocs: SearchDocument[] = tutorials.map((t) => ({
    slug: `tutorial/${t.slug}`,
    href: `/tutorial/${t.slug}`,
    title: `[教程] ${t.title}`,
    description: t.description || t.title,
    content: '',
    tags: t.tags,
    date: t.date,
  }))

  return [...postDocs, ...tutorialDocs]
}
