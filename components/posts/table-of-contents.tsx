'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { TocEntry } from '@/types'
import { useTranslation } from '@/components/layout/language-provider'

interface TableOfContentsProps {
  headings: TocEntry[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState<string>('')
  const [collapsed, setCollapsed] = useState(false)
  const isScrollingRef = useRef(false)

  useEffect(() => {
    if (headings.length === 0) return

    const headingElements = document.querySelectorAll<HTMLElement>(
      '.prose h2[id], .prose h3[id]',
    )
    if (headingElements.length === 0) return

    const HEADER_OFFSET = 100

    const updateActive = () => {
      if (isScrollingRef.current) return

      let current = ''
      for (const heading of headingElements) {
        if (heading.getBoundingClientRect().top <= HEADER_OFFSET) {
          current = heading.id
        } else {
          break
        }
      }
      setActiveId(current)
    }

    // Initial active state
    updateActive()

    const observer = new IntersectionObserver(updateActive, {
      rootMargin: `-${HEADER_OFFSET}px 0px -60% 0px`,
    })

    headingElements.forEach((h) => observer.observe(h))

    return () => observer.disconnect()
  }, [headings.length])

  const handleClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault()
      isScrollingRef.current = true
      setActiveId(id)

      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        history.replaceState(null, '', `#${id}`)
      }

      setTimeout(() => {
        isScrollingRef.current = false
      }, 1000)
    },
    [],
  )

  if (headings.length === 0) return null

  return (
    <nav className={`toc${collapsed ? ' toc--collapsed' : ''}`} aria-label={t('post.toc')}>
      <div className="toc-header">
        {!collapsed && <h4 className="toc-title">{t('post.toc')}</h4>}
        <button
          className="toc-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? t('post.toc.expand') : t('post.toc.collapse')}
          title={collapsed ? t('post.toc.expand') : t('post.toc.collapse')}
        >
          {collapsed ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 4 10 8 6 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="10 4 6 8 10 12" />
            </svg>
          )}
        </button>
      </div>
      {!collapsed && (
        <ul className="toc-list">
          {headings.map((h) => (
            <li key={h.id} className={`toc-item toc-l${h.level}`}>
              <a
                href={`#${h.id}`}
                className={`toc-link${activeId === h.id ? ' toc-link--active' : ''}`}
                onClick={(e) => handleClick(e, h.id)}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
