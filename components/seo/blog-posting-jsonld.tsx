interface BlogPostingJsonLdProps {
  title: string
  description: string
  date: string
  url: string
  author: string
  tags?: string[]
}

/**
 * BlogPosting JSON-LD 结构化数据，帮助搜索引擎生成富媒体搜索结果。
 * 官方推荐做法：<script type="application/ld+json"> 直接内联在组件中。
 */
export function BlogPostingJsonLd({ title, description, date, url, author, tags }: BlogPostingJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    author: { '@type': 'Person', name: author },
    url,
    ...(tags?.length ? { keywords: tags.join(', ') } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
