'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

export const ARTICLE_FONT_OPTIONS = [
  { value: 'sans', label: 'Default', sample: 'Aa' },
  { value: 'serif', label: 'Serif', sample: 'Aa' },
  { value: 'kai', label: 'Kai', sample: 'Aa' },
] as const

export type ArticleFont = (typeof ARTICLE_FONT_OPTIONS)[number]['value']

interface ArticleFontContextValue {
  font: ArticleFont
  setFont: (font: ArticleFont) => void
}

const ARTICLE_FONT_KEY = 'article-font'
const DEFAULT_ARTICLE_FONT: ArticleFont = 'sans'
const ArticleFontContext = createContext<ArticleFontContextValue | null>(null)

function isArticleFont(value: string | null): value is ArticleFont {
  return ARTICLE_FONT_OPTIONS.some((option) => option.value === value)
}

function getStoredArticleFont(): ArticleFont | null {
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem('article-font')
  return isArticleFont(stored) ? stored : null
}

function applyArticleFont(font: ArticleFont) {
  if (typeof document === 'undefined') return

  document.documentElement.dataset.articleFont = font
}

export function useArticleFont(): ArticleFontContextValue {
  const ctx = useContext(ArticleFontContext)
  if (!ctx) throw new Error('useArticleFont must be used within ArticleFontProvider')
  return ctx
}

export function ArticleFontProvider({ children }: { children: ReactNode }) {
  const [font, setFontState] = useState<ArticleFont>(
    () => getStoredArticleFont() ?? DEFAULT_ARTICLE_FONT,
  )

  useEffect(() => {
    applyArticleFont(font)
  }, [font])

  const setFont = useCallback((nextFont: ArticleFont) => {
    setFontState(nextFont)

    try {
      localStorage.setItem(ARTICLE_FONT_KEY, nextFont)
    } catch {
      // Ignore storage failures; the current page can still apply the font.
    }
  }, [])

  const value = useMemo(() => ({ font, setFont }), [font, setFont])

  return (
    <ArticleFontContext.Provider value={value}>
      {children}
    </ArticleFontContext.Provider>
  )
}
