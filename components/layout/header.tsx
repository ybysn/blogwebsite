'use client'

import Link from 'next/link'
import { DarkToggle } from '@/components/ui/dark-toggle'
import { ArticleFontToggle } from '@/components/ui/article-font-toggle'
import { SITE_NAME } from '@/lib/constants'

export function Header() {
  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          {SITE_NAME}
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">首页</Link>
          <Link href="/search" className="nav-link">搜索</Link>
          <Link href="/posts" className="nav-link">文章</Link>
          <Link href="/tutorial" className="nav-link">教程</Link>
          <Link href="/tools" className="nav-link">工具</Link>
          <Link href="/about" className="nav-link">关于</Link>
          <ArticleFontToggle />
          <DarkToggle />
        </div>
      </div>
    </header>
  )
}
