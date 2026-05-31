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
    <nav className="toc" aria-label={t('post.toc')}>
      <h4 className="toc-title">{t('post.toc')}</h4>
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
    </nav>
  )
}
