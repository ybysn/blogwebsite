import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { estimateReadingTime } from '@/lib/utils'
import type { PostFrontmatter, PostMeta, Post, TagWithCount } from '@/types'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')

let postsCache: PostMeta[] | null = null

function validateFrontmatter(data: Record<string, unknown>): data is Record<string, unknown> & PostFrontmatter {
  return (
    typeof data.title === 'string' &&
    data.title.trim().length > 0 &&
    typeof data.date === 'string' &&
    data.date.trim().length > 0 &&
    typeof data.description === 'string' &&
    data.description.trim().length > 0 &&
    Array.isArray(data.tags) &&
    data.tags.length > 0 &&
    data.tags.every((t: unknown) => typeof t === 'string' && t.trim().length > 0) &&
    typeof data.published === 'boolean' &&
    typeof data.lang === 'string' &&
    (data.lang === 'en' || data.lang === 'zh-CN') &&
    typeof data.category === 'string' &&
    data.category.trim().length > 0
  )
}

function getRawPosts(): { slug: string; frontmatter: Record<string, unknown>; content: string }[] {
  if (!fs.existsSync(POSTS_DIR)) {
    return []
  }

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))

  return files.map((file) => {
    const slug = path.basename(file, path.extname(file))
    const filePath = path.join(POSTS_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return { slug, frontmatter: data, content }
  })
}

export function getAllPosts(): PostMeta[] {
  if (postsCache) return postsCache

  const raw = getRawPosts()
  const posts: PostMeta[] = []

  for (const { slug, frontmatter, content } of raw) {
    if (!validateFrontmatter(frontmatter)) {
      console.warn(`Skipping post "${slug}": invalid frontmatter`)
      continue
    }

    if (!frontmatter.published) continue

    const stats = estimateReadingTime(content)

    posts.push({
      ...frontmatter,
      slug,
      readingTime: stats,
    })
  }

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  postsCache = posts
  return posts
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)
  const mdPath = path.join(POSTS_DIR, `${slug}.md`)

  let actualPath: string | null = null
  if (fs.existsSync(filePath)) actualPath = filePath
  else if (fs.existsSync(mdPath)) actualPath = mdPath
  else return null

  const raw = fs.readFileSync(actualPath, 'utf-8')
  const { data, content } = matter(raw)

  if (!validateFrontmatter(data)) {
    console.warn(`Post "${slug}" has invalid frontmatter`)
    return null
  }

  const stats = estimateReadingTime(content)

  return {
    meta: {
      ...data,
      slug,
      readingTime: stats,
    },
    content,
  }
}

export function getAllTags(): TagWithCount[] {
  const posts = getAllPosts()
  const tagCounts = new Map<string, number>()

  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export function getPostsByTag(tag: string): PostMeta[] {
  const posts = getAllPosts()
  return posts.filter((p) => p.tags.includes(tag))
}

export function getAdjacentPosts(slug: string): {
  prev: PostMeta | null
  next: PostMeta | null
} {
  const posts = getAllPosts()
  const index = posts.findIndex((p) => p.slug === slug)

  if (index === -1) return { prev: null, next: null }

  return {
    prev: index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
  }
}

export function getAllPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug)
}
