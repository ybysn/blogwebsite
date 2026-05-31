import GithubSlugger from 'github-slugger'
import type { TocEntry } from '@/types'

/**
 * Extract h2 and h3 headings from raw MDX content.
 * Uses github-slugger to generate IDs matching rehype-slug output.
 * Skips headings inside fenced code blocks.
 */
export function extractHeadings(content: string): TocEntry[] {
  const lines = content.split('\n')
  const headings: TocEntry[] = []
  const slugger = new GithubSlugger()

  let inCodeBlock = false
  let codeBlockFence = ''

  for (const line of lines) {
    // Track fenced code blocks (``` and ~~~)
    const fenceMatch = line.trimStart().match(/^(```|~~~)/)
    if (fenceMatch) {
      const fence = fenceMatch[1]
      if (!inCodeBlock) {
        inCodeBlock = true
        codeBlockFence = fence
      } else if (line.trimStart().startsWith(codeBlockFence)) {
        inCodeBlock = false
        codeBlockFence = ''
      }
      continue
    }

    if (inCodeBlock) continue

    // Match ATX headings: ## or ### followed by a space
    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/)
    if (!headingMatch) continue

    const level = headingMatch[1].length as 2 | 3
    const rawText = headingMatch[2].trim()

    // Strip trailing {#custom-id} if present
    const text = rawText.replace(/\s*\{#[^}]*\}\s*$/, '')

    const id = slugger.slug(text)

    headings.push({ id, text, level })
  }

  return headings
}
