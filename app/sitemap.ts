import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'
import { getAllPosts } from '@/lib/posts'
import { getAllTutorials } from '@/lib/tutorial'
import { getAllNotes, getNoteCategories } from '@/lib/notes'
import { getAllCategoryIds } from '@/lib/categories'
import { TOOLS } from '@/app/tools/tools-data'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.date),
  }))

  const categories = getAllCategoryIds().map((id) => ({
    url: `${SITE_URL}/posts/category/${id}`,
    lastModified: new Date(),
  }))

  const tutorials = getAllTutorials().map((tutorial) => ({
    url: `${SITE_URL}/tutorial/${tutorial.slug}`,
    lastModified: new Date(tutorial.date),
  }))

  const notes = getAllNotes().map((note) => ({
    url: `${SITE_URL}/notes/${note.category}/${note.slug}`,
    lastModified: new Date(note.date),
  }))

  const noteCategories = getNoteCategories().map((cat) => ({
    url: `${SITE_URL}/notes/${cat.category}`,
    lastModified: new Date(),
  }))

  const tools = TOOLS.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: new Date(),
  }))

  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/posts`, lastModified: new Date() },
    { url: `${SITE_URL}/tutorial`, lastModified: new Date() },
    { url: `${SITE_URL}/notes`, lastModified: new Date() },
    { url: `${SITE_URL}/about`, lastModified: new Date() },
    { url: `${SITE_URL}/tools`, lastModified: new Date() },
    ...posts,
    ...categories,
    ...tutorials,
    ...notes,
    ...noteCategories,
    ...tools,
  ]
}
