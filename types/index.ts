export type ContentLocale = 'en' | 'zh-CN'

export interface PostFrontmatter {
  title: string
  date: string
  description: string
  tags: string[]
  published: boolean
  lang: ContentLocale
  featured?: boolean
  ogImage?: string
  category: string
}

export interface PostMeta extends PostFrontmatter {
  slug: string
  readingTime: number
}

export interface Post {
  meta: PostMeta
  content: string
}

export interface TagWithCount {
  tag: string
  count: number
}

export interface SearchDocument {
  slug: string
  href: string
  title: string
  description: string
  content: string
  tags: string[]
  date: string
}

export interface TocEntry {
  id: string
  text: string
  level: 2 | 3
}

// ─── Tutorial types ───────────────────────────────────────────────

export interface TutorialFrontmatter {
  title: string
  description?: string
  date: string
  tags: string[]
  published: boolean
  stage: number
  lang: ContentLocale
  section?: string
  original_url: string
}

export interface TutorialMeta extends TutorialFrontmatter {
  slug: string           // URL path string e.g. "stage-1/learning-map"
  slugSegments: string[] // path segments for catch-all route
  readingTime: number
}

export interface Tutorial {
  meta: TutorialMeta
  content: string
}

export interface TutorialNode {
  title: string
  slug: string
  slugSegments: string[]
  children: TutorialNode[]
  meta?: TutorialMeta
}

export interface TutorialNavigation {
  tree: TutorialNode[]
  flat: Record<string, {          // slug → adjacency
    meta: TutorialMeta
    prevSlug: string | null
    nextSlug: string | null
  }>
  stageLabels: { stage: number; label: string }[]
}
