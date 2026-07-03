'use client'

import type { NoteMeta } from '@/lib/notes'
import { PostCard } from '@/components/posts/post-card'
import type { PostMeta } from '@/types'

const STATUS_MAP: Record<string, string> = {
  ongoing: '🌱 进行中',
  completed: '✅ 已完成',
}

interface Props {
  category: string
  label: string
  notes: NoteMeta[]
  total?: number
  status?: string
}

export function CategoryNotesContent({ category, label, notes, total, status }: Props) {
  const done = notes.length
  const pct = total ? Math.round((done / total) * 100) : null

  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">{label}</h1>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <a href="/notes" style={{ color: 'var(--text-muted)', textDecoration: 'underline', fontSize: '0.9rem' }}>
            ← 返回笔记分类
          </a>
          {status && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {STATUS_MAP[status]}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {pct !== null && (
        <div style={{ maxWidth: '400px', margin: '0 auto 2rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '0.35rem',
            }}
          >
            <span>已完成 {done} / {total} 篇</span>
            <span>{pct}%</span>
          </div>
          <div
            style={{
              height: '8px',
              borderRadius: '4px',
              background: 'var(--border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                borderRadius: '4px',
                background: 'var(--primary)',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      )}

      <div className="post-list">
        {notes.map((note) => (
          <PostCard
            key={note.slug}
            post={note as unknown as PostMeta}
            basePath={`/notes/${category}`}
          />
        ))}
      </div>
    </main>
  )
}
