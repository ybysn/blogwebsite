'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ARTICLE_FONT_OPTIONS,
  useArticleFont,
} from '@/components/layout/article-font-provider'
import { useLocale } from '@/components/layout/language-provider'

const ARTICLE_FONT_LABELS = {
  en: {
    sans: 'Default',
    serif: 'Serif',
    kai: 'Kai',
  },
  'zh-CN': {
    sans: '默认',
    serif: '宋体',
    kai: '文楷',
  },
} as const

export function ArticleFontToggle() {
  const { font, setFont } = useArticleFont()
  const { locale } = useLocale()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const labels = ARTICLE_FONT_LABELS[locale]

  // Close on outside click/touch — use click event which works reliably on
  // both desktop (mouse) and mobile (touch). Delayed registration prevents
  // the opening tap from immediately closing the menu.
  useEffect(() => {
    if (!open) return

    const timer = setTimeout(() => {
      function handleClickOutside(event: MouseEvent | TouchEvent) {
        if (
          event.target instanceof Node &&
          !wrapRef.current?.contains(event.target)
        ) {
          setOpen(false)
        }
      }

      document.addEventListener('click', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)

      return () => {
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div className="font-toggle-wrap" ref={wrapRef}>
      <button
        type="button"
        className="font-toggle"
        aria-label="Article font"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Article font"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
      >
        Aa
      </button>
      {open ? (
        <div className="font-menu" role="menu" aria-label="Article font">
          {ARTICLE_FONT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={font === option.value}
              className={`font-menu-item${
                font === option.value ? ' font-menu-item--active' : ''
              }`}
              onClick={() => {
                setFont(option.value)
                setOpen(false)
              }}
            >
              <span className="font-menu-sample" aria-hidden="true">
                {option.sample}
              </span>
              <span>{labels[option.value]}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
