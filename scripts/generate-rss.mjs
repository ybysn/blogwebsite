import { Feed } from 'feed'
import matter from 'gray-matter'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const SITE_URL = 'https://ny.ybysn.org'
const SITE_NAME = "凌's Blog"
const SITE_DESCRIPTION = 'A personal blog about technology and more.'
const AUTHOR = '凌'

function getAllPosts() {
  const postsDir = path.join(projectRoot, 'content', 'posts')
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'))

  const posts = files.map(file => {
    const slug = path.basename(file, path.extname(file))
    const raw = fs.readFileSync(path.join(postsDir, file), 'utf-8')
    const { data } = matter(raw)
    return { slug, ...data }
  }).filter(p => p.published)

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return posts
}

const posts = getAllPosts()

const feed = new Feed({
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  id: SITE_URL,
  link: SITE_URL,
  language: 'en',
  favicon: `${SITE_URL}/favicon.ico`,
  copyright: `All rights reserved ${new Date().getFullYear()}`,
  updated: posts.length > 0 ? new Date(posts[0].date) : new Date(),
  feedLinks: {
    rss2: `${SITE_URL}/feed.xml`,
  },
  author: {
    name: AUTHOR,
  },
})

for (const post of posts) {
  feed.addItem({
    title: post.title,
    id: `${SITE_URL}/posts/${post.slug}`,
    link: `${SITE_URL}/posts/${post.slug}`,
    description: post.description,
    date: new Date(post.date),
    category: (post.tags ?? []).map(tag => ({ name: tag })),
  })
}

const outDir = path.join(projectRoot, 'public')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'feed.xml'), feed.rss2(), 'utf-8')
console.log('✓ Generated public/feed.xml')
