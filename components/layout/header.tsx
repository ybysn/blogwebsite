'use client'

import Link from 'next/link'
import { DarkToggle } from '@/components/ui/dark-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { ArticleFontToggle } from '@/components/ui/article-font-toggle'
import { useTranslation } from '@/components/layout/language-provider'
import { SITE_NAME } from '@/lib/constants'

export function Header() {
  const { t } = useTranslation()

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          {SITE_NAME}
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">{t('nav.home')}</Link>
          <Link href="/search" className="nav-link">{t('nav.search')}</Link>
          <Link href="/posts" className="nav-link">{t('nav.posts')}</Link>
          <Link href="/about" className="nav-link">{t('nav.about')}</Link>
          <Link href="/tutorial" className="nav-link">{t('nav.tutorial')}</Link>
          <ArticleFontToggle />
          <DarkToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  )
}
