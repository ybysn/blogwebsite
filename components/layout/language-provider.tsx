'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { Locale } from '@/lib/i18n'
import { t as translate } from '@/lib/i18n'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLocale(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLocale must be used within LanguageProvider')
  return ctx
}

export function useTranslation() {
  const { t } = useLocale()
  return { t }
}

function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('locale')
  if (stored === 'en' || stored === 'zh-CN') return stored
  return null
}

function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  const nav = navigator.language
  if (nav.startsWith('zh')) return 'zh-CN'
  return 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const stored = getStoredLocale()
    setLocaleState(stored ?? getBrowserLocale())
  }, [])

  const applyLocale = useCallback((l: Locale) => {
    document.documentElement.lang = l
    localStorage.setItem('locale', l)
  }, [])

  useEffect(() => {
    applyLocale(locale)
  }, [locale, applyLocale])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
  }, [])

  const t = useMemo(
    () => (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
