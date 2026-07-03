'use client'

import type { NoteCategory } from '@/lib/notes'
import { PostCard } from '@/components/posts/post-card'
import type { PostMeta } from '@/types'

export function NotesContent({ categories }: { categories: NoteCategory[] }) {
  if (categories.length === 0) {
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
      {categories.map((cat) => (
        <section key={cat.category} style={{ marginBottom: '3rem' }}>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid var(--border)',
            }}
          >
            {cat.label}
          </h2>
          <div className="post-list">
            {cat.notes.map((note) => (
              <PostCard
                key={note.slug}
                post={note as unknown as PostMeta}
                basePath={`/notes/${note.category}`}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
