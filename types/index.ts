export interface PostFrontmatter {
  title: string
  date: string
  description: string
  tags: string[]
  published: boolean
  lang?: string
  featured?: boolean
  ogImage?: string
  category?: string
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
  title: string
  description: string
  content: string
  tags: string[]
  date: string
}
