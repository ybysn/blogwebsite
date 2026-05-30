'use client'

import { formatDate, formatReadingTime } from '@/lib/utils'
import { useLocale } from '@/components/layout/language-provider'

export function PostMetaDisplay({
  date,
  readingTime,
}: {
  date: string
  readingTime: number
}) {
  const { locale } = useLocale()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '0.92rem',
        color: 'var(--color-muted)',
      }}
    >
      <time dateTime={date}>{formatDate(date, locale)}</time>
      <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.3)' }}>&middot;</span>
      <span>{formatReadingTime(readingTime, locale)}</span>
    </div>
  )
}
