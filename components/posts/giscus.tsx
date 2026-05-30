'use client'

import Giscus from '@giscus/react'
import { useTheme } from '@/components/layout/theme-provider'
import { useLocale } from '@/components/layout/language-provider'
import { GISCUS_CONFIG } from '@/lib/constants'

export function GiscusComments() {
  const { theme } = useTheme()
  const { locale, t } = useLocale()

  return (
    <section
      style={{
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        {t('post.comments')}
      </h2>
      <Giscus
        repo={GISCUS_CONFIG.repo}
        repoId={GISCUS_CONFIG.repoId}
        category={GISCUS_CONFIG.category}
        categoryId={GISCUS_CONFIG.categoryId}
        mapping="pathname"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === 'dark' ? 'dark_dimmed' : 'light'}
        lang={locale}
        loading="lazy"
      />
    </section>
  )
}
