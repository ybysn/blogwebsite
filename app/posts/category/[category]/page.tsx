import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPostsByCategory, getCategoryById, getAllCategoryIds } from '@/lib/categories'
import { SITE_URL } from '@/lib/constants'
import { CategoryContent } from './category-content'

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return getAllCategoryIds().map((id) => ({ category: id }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const cat = getCategoryById(category)
  if (!cat) return { title: 'Category Not Found' }

  return {
    title: cat.name['zh-CN'] ?? cat.name.en,
    description: cat.description['zh-CN'] ?? cat.description.en,
    openGraph: {
      title: cat.name['zh-CN'] ?? cat.name.en,
      description: cat.description['zh-CN'] ?? cat.description.en,
      url: `${SITE_URL}/posts/category/${category}`,
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const cat = getCategoryById(category)
  if (!cat) notFound()

  const posts = getPostsByCategory(category)
  return <CategoryContent category={cat} posts={posts} />
}
