import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatDate(dateString: string, _locale?: string): string {
  const date = new Date(dateString)
  return format(date, 'yyyy年M月d日', { locale: zhCN })
}

export function formatReadingTime(minutes: number, _locale?: string): string {
  const ceil = Math.ceil(minutes)
  if (minutes < 1) return '不到 1 分钟'
  if (minutes === 1) return '约 1 分钟'
  return `约 ${ceil} 分钟`
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
