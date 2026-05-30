import { format } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import type { Locale as DateFnsLocale } from 'date-fns'
import type { Locale } from '@/lib/i18n'

const dateLocaleMap: Record<Locale, DateFnsLocale> = {
  en: enUS,
  'zh-CN': zhCN,
}

export function formatDate(dateString: string, locale: Locale = 'en'): string {
  const date = new Date(dateString)
  if (locale === 'zh-CN') {
    return format(date, 'yyyy年M月d日', { locale: zhCN })
  }
  return format(date, 'MMMM d, yyyy', { locale: enUS })
}

export function formatReadingTime(minutes: number, locale: Locale = 'en'): string {
  const ceil = Math.ceil(minutes)
  if (locale === 'zh-CN') {
    if (minutes < 1) return '不到 1 分钟'
    if (minutes === 1) return '约 1 分钟'
    return `约 ${ceil} 分钟`
  }
  if (minutes < 1) return 'Less than 1 min read'
  if (minutes === 1) return '1 min read'
  return `${ceil} min read`
}

// CJK characters: ~400 chars/min vs English: ~200 words/min (reading-time default)
const CJK_REGEX = /[一-鿿㐀-䶿豈-﫿]/g

export function estimateReadingTime(text: string): number {
  const cjkChars = (text.match(CJK_REGEX) ?? []).length
  const nonCjkText = text.replace(CJK_REGEX, '')

  // Use reading-time for English portion
  let englishMinutes = 0
  if (nonCjkText.trim().length > 0) {
    // reading-time counts words by whitespace split
    const words = nonCjkText.trim().split(/\s+/).length
    englishMinutes = words / 200
  }

  // CJK: ~400 chars per minute
  const cjkMinutes = cjkChars / 400

  return Math.max(cjkMinutes, englishMinutes)
}
