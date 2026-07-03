'use client'

import Link from 'next/link'
import type { NoteCategory } from '@/lib/notes'

const CATEGORY_ICONS: Record<string, string> = {
  'data-structures': '🖥️',
}

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
      <div className="post-list">
        {categories.map((cat) => (
          <Link
            key={cat.category}
            href={`/notes/${cat.category}`}
            style={{ textDecoration: 'none' }}
          >
            <article className="post-card card animate-in" style={{ cursor: 'pointer' }}>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <span style={{ fontSize: '2.5rem', flexShrink: 0 }}>
                  {CATEGORY_ICONS[cat.category] || '📂'}
                </span>
                <div>
                  <div
                    className="card-title-link"
                    style={{ fontSize: '1.25rem', fontWeight: 700 }}
                  >
                    {cat.label}
                  </div>
                  <p className="card-desc" style={{ marginTop: '0.35rem' }}>
                    {cat.notes.length} 篇笔记
                  </p>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </main>
  )
}
