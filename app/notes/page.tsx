import { getNoteCategories } from '@/lib/notes'
import { NotesContent } from '@/app/notes/notes-content'

export const metadata = {
  title: '学习笔记',
  description: '学习笔记 —— 数据结构与算法、编程知识整理',
}

export default function NotesPage() {
  const categories = getNoteCategories()
  return <NotesContent categories={categories} />
}
