import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { estimateReadingTime } from '@/lib/utils'
import type { TutorialFrontmatter, TutorialMeta, Tutorial, TutorialNode, TutorialNavigation } from '@/types'

const TUTORIAL_DIR = path.join(process.cwd(), 'content', 'tutorial')

// ─── cache ────────────────────────────────────────────────────────────

let allTutorialsCache: TutorialMeta[] | null = null
let navigationCache: TutorialNavigation | null = null

// ─── validation ───────────────────────────────────────────────────────

function validateFrontmatter(
  data: Record<string, unknown>
): data is Record<string, unknown> & TutorialFrontmatter {
  return (
    typeof data.title === 'string' &&
    typeof data.date === 'string' &&
    Array.isArray(data.tags) &&
    data.tags.every((t: unknown) => typeof t === 'string') &&
    typeof data.published === 'boolean' &&
    typeof data.stage === 'number'
  )
}

// ─── scanning ─────────────────────────────────────────────────────────

/**
 * Recursively find all .mdx files under TUTORIAL_DIR.
 * Returns relative paths from TUTORIAL_DIR (e.g. "stage-1/learning-map/index.mdx").
 */
function scanTutorialFiles(): string[] {
  if (!fs.existsSync(TUTORIAL_DIR)) return []

  const results: string[] = []

  function walk(dir: string, basePath: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relPath = basePath ? path.join(basePath, entry.name) : entry.name
      if (entry.isDirectory()) {
        walk(fullPath, relPath)
      } else if (entry.name.endsWith('.mdx')) {
        results.push(relPath)
      }
    }
  }

  walk(TUTORIAL_DIR, '')
  return results
}

/**
 * Convert a relative file path to a URL slug array.
 * "stage-1/learning-map/index.mdx" → ["stage-1", "learning-map"]
 * "appendix/8-artificial-intelligence/ai-history.mdx" → ["appendix", "8-artificial-intelligence", "ai-history"]
 */
function filePathToSlug(relPath: string): string[] {
  const parts = relPath.replace(/\.mdx$/, '').split(path.sep)
  // Remove trailing 'index' for directory index pages
  if (parts[parts.length - 1] === 'index' && parts.length > 1) {
    return parts.slice(0, -1)
  }
  return parts
}

/**
 * Stage order for sorting: stage-1, stage-2, stage-3, vibe-stories, appendix, guide
 */
function stageOrder(slugSegments: string[]): number {
  const first = slugSegments[0]
  if (first === 'stage-1') return 1
  if (first === 'stage-2') return 2
  if (first === 'stage-3') return 3
  if (first === 'vibe-stories') return 4
  if (first === 'appendix') return 5
  return 6
}

// ─── public API ───────────────────────────────────────────────────────

export function getAllTutorials(): TutorialMeta[] {
  if (allTutorialsCache) return allTutorialsCache

  const files = scanTutorialFiles()
  const tutorials: TutorialMeta[] = []

  for (const relPath of files) {
    const filePath = path.join(TUTORIAL_DIR, relPath)
    let raw: string
    try {
      raw = fs.readFileSync(filePath, 'utf-8')
    } catch {
      continue
    }

    const { data, content } = matter(raw)

    if (!validateFrontmatter(data)) {
      console.warn(`Skipping tutorial "${relPath}": invalid frontmatter`)
      continue
    }

    if (!data.published) continue

    const slugSegments = filePathToSlug(relPath)
    const slug = slugSegments.join('/')
    const stats = estimateReadingTime(content)

    // Use first # heading in content as title if it differs from frontmatter
    // (frontmatter often has generic titles like "Index" or "PRD")
    let displayTitle = data.title
    const firstH1 = content.match(/^#\s+(.+)(?:\s*\{[^}]*\})?\s*$/m)
    if (firstH1) {
      const h1Title = firstH1[1].trim()
      if (h1Title !== data.title) {
        displayTitle = h1Title
      }
    }

    tutorials.push({
      ...data,
      title: displayTitle,
      slug,
      slugSegments,
      readingTime: stats,
    })
  }

  // Sort: by stage, then by section (alphabetical within stage), then by filename
  tutorials.sort((a, b) => {
    const sa = stageOrder(a.slugSegments)
    const sb = stageOrder(b.slugSegments)

    if (sa !== sb) return sa - sb

    // Within same stage, sort by section if applicable
    const secA = a.section || ''
    const secB = b.section || ''
    if (secA !== secB) return secA.localeCompare(secB)

    // Within same stage+section, sort by slug (preserves source order roughly)
    return a.slug.localeCompare(b.slug)
  })

  allTutorialsCache = tutorials
  return tutorials
}

export function getTutorialBySlug(slug: string[]): Tutorial | null {
  const slugStr = slug.join('/')

  const files = scanTutorialFiles()

  for (const relPath of files) {
    const candidateSlug = filePathToSlug(relPath)
    if (candidateSlug.join('/') === slugStr) {
      const filePath = path.join(TUTORIAL_DIR, relPath)
      let raw: string
      try {
        raw = fs.readFileSync(filePath, 'utf-8')
      } catch {
        return null
      }

      const { data, content } = matter(raw)
      if (!validateFrontmatter(data)) return null

      const stats = estimateReadingTime(content)

      // Use first # heading in content as title if it differs from frontmatter
      let displayTitle = data.title
      let displayContent = content
      const firstH1 = content.match(/^#\s+(.+)(?:\s*\{[^}]*\})?\s*\n?/m)
      if (firstH1) {
        const h1Title = firstH1[1].trim()
        if (h1Title !== data.title) {
          displayTitle = h1Title
          // Strip the heading from content to avoid duplication
          displayContent = content.slice(firstH1.index! + firstH1[0].length)
        }
      }

      return {
        meta: {
          ...data,
          title: displayTitle,
          slug: slugStr,
          slugSegments: slug,
          readingTime: stats,
        },
        content: displayContent,
      }
    }
  }

  return null
}

export function getAllTutorialSlugs(): string[][] {
  return getAllTutorials().map((t) => t.slugSegments)
}

/**
 * Build complete navigation tree + flat adjacency map.
 */
export function getTutorialNavigation(): TutorialNavigation {
  if (navigationCache) return navigationCache

  const tutorials = getAllTutorials()
  const flat: TutorialNavigation['flat'] = {}

  // Build flat adjacency (prev/next)
  for (let i = 0; i < tutorials.length; i++) {
    flat[tutorials[i].slug] = {
      meta: tutorials[i],
      prevSlug: i > 0 ? tutorials[i - 1].slug : null,
      nextSlug: i < tutorials.length - 1 ? tutorials[i + 1].slug : null,
    }
  }

  // Build tree
  const stageLabels: TutorialNavigation['stageLabels'] = [
    { stage: 1, label: 'Stage 1 · 零基础入门' },
    { stage: 2, label: 'Stage 2 · 初中级开发' },
    { stage: 3, label: 'Stage 3 · 高级开发' },
    { stage: 4, label: 'Vibe Stories' },
    { stage: 0, label: '附录 · Appendix' },
  ]

  const tree: TutorialNode[] = []
  const stageGroups = new Map<number, TutorialNode>()

  // Group by stage
  for (const t of tutorials) {
    const s = t.stage
    let stageNode = stageGroups.get(s)
    if (!stageNode) {
      const label = stageLabels.find((sl) => sl.stage === s)?.label || `Stage ${s}`
      stageNode = {
        title: label,
        slug: `stage-${s}`,
        slugSegments: [`${s === 0 ? 'appendix' : s === 4 ? 'vibe-stories' : `stage-${s}`}`],
        children: [],
      }
      tree.push(stageNode)
      stageGroups.set(s, stageNode)
    }

    // If the tutorial has a section, group under section node
    if (t.section) {
      let sectionNode = stageNode.children.find(
        (child) => child.title === t.section && child.children
      )
      if (!sectionNode) {
        sectionNode = {
          title: t.section,
          slug: `${stageNode.slug}/${t.section}`,
          slugSegments: [...stageNode.slugSegments, t.section],
          children: [],
        }
        stageNode.children.push(sectionNode)
      }
      sectionNode.children.push({
        title: t.title,
        slug: t.slug,
        slugSegments: t.slugSegments,
        children: [],
        meta: t,
      })
    } else {
      stageNode.children.push({
        title: t.title,
        slug: t.slug,
        slugSegments: t.slugSegments,
        children: [],
        meta: t,
      })
    }
  }

  navigationCache = { tree, flat, stageLabels }
  return navigationCache
}

export function getAdjacentTutorialPages(slug: string): {
  prev: TutorialMeta | null
  next: TutorialMeta | null
} {
  const nav = getTutorialNavigation()
  const entry = nav.flat[slug]
  if (!entry) return { prev: null, next: null }

  return {
    prev: entry.prevSlug ? nav.flat[entry.prevSlug]?.meta ?? null : null,
    next: entry.nextSlug ? nav.flat[entry.nextSlug]?.meta ?? null : null,
  }
}

export function getTutorialMetaBySlug(slug: string[]): TutorialMeta | null {
  const all = getAllTutorials()
  const slugStr = slug.join('/')
  return all.find((t) => t.slug === slugStr) ?? null
}
