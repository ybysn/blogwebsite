'use client'

import { useLocale } from '@/components/layout/language-provider'

export function LanguageToggle() {
  const { locale, setLocale } = useLocale()

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'zh-CN' : 'en')
  }

  return (
    <button onClick={toggleLocale} className="lang-toggle">
      {locale === 'en' ? '中' : 'EN'}
    </button>
  )
}
