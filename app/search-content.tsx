'use client'

import type { SearchDocument } from '@/types'
import { useTranslation } from '@/components/layout/language-provider'
import { SearchInput } from '@/components/posts/search-input'

export function SearchContent({ documents }: { documents: SearchDocument[] }) {
  const { t } = useTranslation()

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>{t('search.title')}</h1>
      <SearchInput documents={documents} />
    </div>
  )
}
