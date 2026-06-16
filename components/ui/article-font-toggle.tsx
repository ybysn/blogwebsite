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

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !wrapRef.current?.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
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
        onClick={() => setOpen((prev) => !prev)}
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
