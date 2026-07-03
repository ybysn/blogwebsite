import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getNotesByCategory, getNoteCategories, getCategoryLabel, getCategoryConfig } from '@/lib/notes'
import { CategoryNotesContent } from '@/app/notes/category-content'

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return getNoteCategories().map(({ category }) => ({ category }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const label = getCategoryLabel(category)
  return {
    title: `${label} —— 学习笔记`,
    description: `${label} 相关学习笔记`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params
  const notes = getNotesByCategory(category)
  if (notes.length === 0) notFound()

  const label = getCategoryLabel(category)
  const config = getCategoryConfig(category)

  return (
    <CategoryNotesContent
      category={category}
      label={label}
      notes={notes}
      total={config?.total}
      status={config?.status}
    />
  )
}
