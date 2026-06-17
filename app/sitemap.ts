import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'
import { getAllPosts } from '@/lib/posts'
import { getAllTutorials } from '@/lib/tutorial'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: new Date(post.date),
  }))

  const tutorials = getAllTutorials().map((tutorial) => ({
    url: `${SITE_URL}/tutorial/${tutorial.slug}`,
    lastModified: new Date(tutorial.date),
  }))

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/posts`,
      lastModified: new Date(),
    },
    {
      url: `${SITE_URL}/tutorial`,
      lastModified: new Date(),
    },
    ...posts,
    ...tutorials,
  ]
}
