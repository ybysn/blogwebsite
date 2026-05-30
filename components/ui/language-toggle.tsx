'use client'

import { useLocale } from '@/components/layout/language-provider'

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale()

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'zh-CN' : 'en')
  }

  return (
    <button
      onClick={toggleLocale}
      aria-label={`Switch to ${locale === 'en' ? 'Chinese' : 'English'}`}
      className="lang-toggle"
      title={locale === 'en' ? '切换到中文' : 'Switch to English'}
    >
      {t(locale === 'en' ? 'switchToZh' : 'switchToEn')}
    </button>
  )
}
