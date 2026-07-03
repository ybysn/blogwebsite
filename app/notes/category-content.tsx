'use client'

import type { NoteMeta } from '@/lib/notes'
import { PostCard } from '@/components/posts/post-card'
import type { PostMeta } from '@/types'

interface Props {
  category: string
  label: string
  notes: NoteMeta[]
}

export function CategoryNotesContent({ category, label, notes }: Props) {
  return (
    <main className="page-container">
      <div className="page-header">
        <h1 className="page-title">{label}</h1>
        <p className="page-subtitle">
          <a href="/notes" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>
            ← 返回笔记分类
          </a>
        </p>
      </div>
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
