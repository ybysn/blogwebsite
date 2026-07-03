'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DarkToggle } from '@/components/ui/dark-toggle'
import { ArticleFontToggle } from '@/components/ui/article-font-toggle'
import { SITE_NAME } from '@/lib/constants'

const NAV_LINKS = [
  { href: '/', label: '首页' },
  { href: '/search', label: '搜索' },
  { href: '/posts', label: '文章' },
  { href: '/tutorial', label: '教程' },
  { href: '/notes', label: '笔记' },
  { href: '/tools', label: '工具' },
  { href: '/about', label: '关于' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          {SITE_NAME}
        </Link>

        {/* Desktop nav */}
        <div className="nav-links">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
          <ArticleFontToggle />
          <DarkToggle />
        </div>

        {/* Mobile hamburger + toggles */}
        <div className="nav-mobile-actions">
          <ArticleFontToggle />
          <DarkToggle />
          <button
            className={`nav-hamburger${menuOpen ? ' nav-hamburger--open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
          >
            <span className="nav-hamburger-line" />
            <span className="nav-hamburger-line" />
            <span className="nav-hamburger-line" />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <nav className="nav-mobile-menu">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
