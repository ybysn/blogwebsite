import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { estimateReadingTime } from '@/lib/utils'

export interface NoteFrontmatter {
  title: string
  date: string
  description: string
  tags: string[]
  published: boolean
}

export interface NoteMeta extends NoteFrontmatter {
  slug: string
  readingTime: ReturnType<typeof estimateReadingTime>
}

export interface Note {
  meta: NoteMeta
  content: string
}

const NOTES_DIR = path.join(process.cwd(), 'content', 'notes')

let notesCache: NoteMeta[] | null = null

function validateFrontmatter(data: Record<string, unknown>): data is Record<string, unknown> & NoteFrontmatter {
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
    typeof data.published === 'boolean'
  )
}

function getRawNotes(): { slug: string; frontmatter: Record<string, unknown>; content: string }[] {
  if (!fs.existsSync(NOTES_DIR)) return []

  const files = fs.readdirSync(NOTES_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))

  return files.map((file) => {
    const slug = path.basename(file, path.extname(file))
    const filePath = path.join(NOTES_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return { slug, frontmatter: data, content }
  })
}

export function getAllNotes(): NoteMeta[] {
  if (notesCache) return notesCache

  const raw = getRawNotes()
  const notes: NoteMeta[] = []

  for (const { slug, frontmatter, content } of raw) {
    if (!validateFrontmatter(frontmatter)) {
      console.warn(`Skipping note "${slug}": invalid frontmatter`)
      continue
    }
    if (!frontmatter.published) continue

    notes.push({
      ...frontmatter,
      slug,
      readingTime: estimateReadingTime(content),
    })
  }

  notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  notesCache = notes
  return notes
}

export function getNoteBySlug(slug: string): Note | null {
  const filePath = path.join(NOTES_DIR, `${slug}.mdx`)
  const mdPath = path.join(NOTES_DIR, `${slug}.md`)

  let actualPath: string | null = null
  if (fs.existsSync(filePath)) actualPath = filePath
  else if (fs.existsSync(mdPath)) actualPath = mdPath
  else return null

  const raw = fs.readFileSync(actualPath, 'utf-8')
  const { data, content } = matter(raw)

  if (!validateFrontmatter(data)) {
    console.warn(`Note "${slug}" has invalid frontmatter`)
    return null
  }

  return {
    meta: {
      ...data,
      slug,
      readingTime: estimateReadingTime(content),
    },
    content,
  }
}

export function getAllNoteSlugs(): string[] {
  return getAllNotes().map((n) => n.slug)
}
