'use client'

import Link from 'next/link'
import type { NoteMeta } from '@/lib/notes'
import { PostCard } from '@/components/posts/post-card'
import type { PostMeta } from '@/types'

export function NotesContent({ notes }: { notes: NoteMeta[] }) {
  if (notes.length === 0) {
    return (
      <main className="page-container">
        <div className="page-header">
          <h1 className="page-title">📒 学习笔记</h1>
          <p className="page-subtitle">记录学习过程中的知识点和心得</p>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>
          暂无笔记，敬请期待。
        </p>
      </main>
    )
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">📒 学习笔记</h1>
        <p className="page-subtitle">记录学习过程中的知识点和心得</p>
      </div>
      <div className="post-list">
        {notes.map((note) => (
          <Link key={note.slug} href={`/notes/${note.slug}`} style={{ textDecoration: 'none' }}>
            <PostCard post={note as unknown as PostMeta} />
          </Link>
        ))}
      </div>
    </main>
  )
}
