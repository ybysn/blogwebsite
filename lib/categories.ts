import { getAllPosts } from '@/lib/posts'
import type { PostMeta } from '@/types'
import type { Locale } from '@/lib/i18n'

export interface Category {
  id: string
  name: Record<Locale, string>
  description: Record<Locale, string>
}

export const CATEGORIES: Category[] = [
  {
    id: 'network-proxy',
    name: { en: 'Network & Proxy', 'zh-CN': '网络与代理' },
    description: {
      en: 'Proxy servers, CDN, censorship circumvention, and networking tools.',
      'zh-CN': '代理服务器、CDN、网络优化与代理工具。',
    },
  },
  {
    id: 'server-infra',
    name: { en: 'Server & Infrastructure', 'zh-CN': '服务器与基础设施' },
    description: {
      en: 'VPS setup, SSH, SSL/TLS, self-hosting, and server security.',
      'zh-CN': 'VPS 配置、SSH、SSL/TLS、自托管服务与服务器安全。',
    },
  },
  {
    id: 'dev-tools',
    name: { en: 'Dev Tools', 'zh-CN': '开发工具' },
    description: {
      en: 'CLI tools, dev environments, WSL, and productivity.',
      'zh-CN': '命令行工具、开发环境、WSL 与效率提升。',
    },
  },
  {
    id: 'windows',
    name: { en: 'Windows Tips', 'zh-CN': 'Windows 技巧' },
    description: {
      en: 'Windows tips, activation, updates, and registry tweaks.',
      'zh-CN': 'Windows 使用技巧、激活、更新与注册表优化。',
    },
  },
]

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}

export function getPostsByCategory(categoryId: string): PostMeta[] {
  const allPosts = getAllPosts()
  return allPosts.filter((p) => p.category === categoryId)
}

export function getAllCategoryIds(): string[] {
  return CATEGORIES.map((c) => c.id)
}

export interface CategoryGroup {
  category: Category
  posts: PostMeta[]
}

export function getCategorizedPosts(): CategoryGroup[] {
  const allPosts = getAllPosts()
  const grouped = new Map<string, PostMeta[]>()

  // Initialize groups in category order
  for (const cat of CATEGORIES) {
    grouped.set(cat.id, [])
  }

  const uncategorized: PostMeta[] = []

  for (const post of allPosts) {
    const catId = post.category
    if (catId && grouped.has(catId)) {
      grouped.get(catId)!.push(post)
    } else {
      uncategorized.push(post)
    }
  }

  const result: CategoryGroup[] = []

  for (const cat of CATEGORIES) {
    const posts = grouped.get(cat.id)!
    if (posts.length > 0) {
      result.push({ category: cat, posts })
    }
  }

  if (uncategorized.length > 0) {
    result.push({
      category: {
        id: 'uncategorized',
        name: { en: 'Other', 'zh-CN': '其他' },
        description: { en: 'Miscellaneous posts.', 'zh-CN': '其他文章。' },
      },
      posts: uncategorized,
    })
  }

  return result
}
