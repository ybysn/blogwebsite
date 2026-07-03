'use client'

import Link from 'next/link'
import type { NoteCategory } from '@/lib/notes'

const CATEGORY_ICONS: Record<string, string> = {
  'data-structures': '🖥️',
}

const STATUS_MAP: Record<string, string> = {
  ongoing: '🌱 进行中',
  completed: '✅ 已完成',
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
        {categories.map((cat) => {
          const total = cat.total
          const done = cat.notes.length
          const pct = total ? Math.round((done / total) * 100) : null

          return (
            <Link
              key={cat.category}
              href={`/notes/${cat.category}`}
              style={{ textDecoration: 'none' }}
            >
              <article className="post-card card animate-in" style={{ cursor: 'pointer' }}>
                <div className="card-body">
                  {/* Top row: icon + title + status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '2rem', flexShrink: 0 }}>
                      {CATEGORY_ICONS[cat.category] || '📂'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div className="card-title-link" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                        {cat.label}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {STATUS_MAP[cat.status]}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {pct !== null && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          marginBottom: '0.3rem',
                        }}
                      >
                        <span>
                          {done} / {total} 篇
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div
                        style={{
                          height: '6px',
                          borderRadius: '3px',
                          background: 'var(--border)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: '3px',
                            background: 'var(--primary)',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
