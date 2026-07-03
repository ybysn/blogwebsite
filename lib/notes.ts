import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { estimateReadingTime } from '@/lib/utils'

export interface NoteFrontmatter {
  title: string
  date: string
  category: string
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
    typeof data.category === 'string' &&
    data.category.trim().length > 0 &&
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

export function getNoteBySlug(category: string, slug: string): Note | null {
  const note = getAllNotes().find((n) => n.slug === slug && n.category === category)
  if (!note) return null

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

// ---- Category config ---------------------------------------------------------

export interface CategoryConfig {
  label: string
  icon: string
  total?: number
  status: 'ongoing' | 'completed'
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  'data-structures': {
    label: '数据结构与算法',
    icon: '🖥️',
    total: 30,
    status: 'ongoing',
  },
}

export function getCategoryConfig(category: string): CategoryConfig | undefined {
  return CATEGORY_CONFIG[category]
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_CONFIG[category]?.label || category
}

export function getCategoryIcon(category: string): string {
  return CATEGORY_CONFIG[category]?.icon || '📂'
}

// ---- Slugs & Categories -----------------------------------------------------

export interface NoteCategorySlug {
  category: string
  slug: string
}

export function getAllNoteSlugs(): NoteCategorySlug[] {
  return getAllNotes().map((n) => ({ category: n.category, slug: n.slug }))
}

export interface NoteCategory {
  category: string
  label: string
  icon: string
  total?: number
  status: 'ongoing' | 'completed'
  notes: NoteMeta[]
}

export function getNoteCategories(): NoteCategory[] {
  const notes = getAllNotes()
  const map = new Map<string, NoteMeta[]>()

  for (const note of notes) {
    const existing = map.get(note.category) || []
    existing.push(note)
    map.set(note.category, existing)
  }

  return Array.from(map.entries())
    .map(([category, catNotes]) => {
      const config = CATEGORY_CONFIG[category]
      return {
        category,
        label: config?.label || category,
        icon: config?.icon || '📂',
        total: config?.total,
        status: config?.status || 'ongoing',
        notes: catNotes,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function getNotesByCategory(category: string): NoteMeta[] {
  return getAllNotes().filter((n) => n.category === category)
}

// ---- Adjacent notes ----------------------------------------------------------

export interface AdjacentNotes {
  prev: NoteMeta | null
  next: NoteMeta | null
}

export function getAdjacentNotes(category: string, slug: string): AdjacentNotes {
  const notes = getNotesByCategory(category)
  const idx = notes.findIndex((n) => n.slug === slug)
  if (idx === -1) return { prev: null, next: null }

  return {
    prev: idx > 0 ? notes[idx - 1] : null,
    next: idx < notes.length - 1 ? notes[idx + 1] : null,
  }
}
