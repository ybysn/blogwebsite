'use client'

import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import Link from 'next/link'
import type { SearchDocument } from '@/types'
import { formatDate } from '@/lib/utils'
import { TagBadge } from '@/components/ui/tag-badge'

export function SearchInput({ documents }: { documents: SearchDocument[] }) {
  const [query, setQuery] = useState('')

  const fuse = useMemo(
    () =>
      new Fuse(documents, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'description', weight: 1.5 },
          { name: 'tags', weight: 1 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [documents],
  )

  const results = useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query.trim()).slice(0, 20)
  }, [fuse, query])

  return (
    <div>
      <div className="search-input-wrap">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="search-icon"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="search-input-field"
        />
      </div>

      {query.trim() === '' ? (
        <p className="text-center py-8" style={{ color: 'var(--muted)' }}>
          Start typing to search across {documents.length} posts.
        </p>
      ) : results.length === 0 ? (
        <p className="text-center py-8" style={{ color: 'var(--muted)' }}>
          No results found for &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map(({ item }) => (
              <Link
                key={item.slug}
                href={`/posts/${item.slug}`}
                className="card search-result-link"
              >
                <div className="card-body">
                  <h2 className="card-title-link" style={{ marginBottom: '0.25rem' }}>
                    {item.title}
                  </h2>
                  <div className="card-meta">
                    {formatDate(item.date)}
                  </div>
                  <p className="card-desc">{item.description}</p>
                  <div className="card-tags">
                    {item.tags.map((tag) => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
