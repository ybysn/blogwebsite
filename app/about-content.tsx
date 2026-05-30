'use client'

import { useTranslation } from '@/components/layout/language-provider'

export function AboutContent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>{t('about.title')}</h1>
      <div className="prose" style={{ color: 'var(--color-text-2)', lineHeight: 1.65 }}>
        <p>{t('about.p1')}</p>
        <p>{t('about.p2')}</p>
        <p>{t('about.p3')}</p>
      </div>
    </div>
  )
}
