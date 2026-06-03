'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { TutorialNavigation, TutorialMeta } from '@/types'
import { useTranslation } from '@/components/layout/language-provider'

const SIDEBAR_SCROLL_KEY = 'tutorial-sidebar-scroll'

interface TutorialSidebarProps {
  navigation: TutorialNavigation
  currentSlug: string
}

export function TutorialSidebar({ navigation, currentSlug }: TutorialSidebarProps) {
  const { t } = useTranslation()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarHidden, setSidebarHidden] = useState(false)
  const [sidebarReady, setSidebarReady] = useState(false)

  // Sync hidden state from localStorage on client mount (avoid hydration mismatch)
  useEffect(() => {
    setSidebarHidden(localStorage.getItem('tutorial-sidebar-hidden') === 'true')
    setSidebarReady(true)
  }, [])
  const asideRef = useRef<HTMLElement>(null)

  // Restore sidebar scroll position on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(SIDEBAR_SCROLL_KEY)
    if (saved && asideRef.current) {
      asideRef.current.scrollTop = parseInt(saved, 10)
    }
  }, [])

  const toggleSidebar = () => {
    setSidebarHidden((prev) => {
      const next = !prev
      localStorage.setItem('tutorial-sidebar-hidden', String(next))
      return next
    })
  }

  // Save scroll position when clicking a link
  const handleSidebarClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('a') && asideRef.current) {
      sessionStorage.setItem(
        SIDEBAR_SCROLL_KEY,
        String(asideRef.current.scrollTop),
      )
    }
  }

  const toggleGroup = (slug: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const isActive = (slug: string) => currentSlug === slug
  const isAncestor = (node: { slug: string; children?: typeof node[] }): boolean => {
    if (isActive(node.slug)) return true
    if ('children' in node && node.children) {
      return node.children.some((c) => isAncestor(c))
    }
    return false
  }

  const renderNode = (node: any, depth: number) => {
    const hasChildren = node.children && node.children.length > 0
    const active = isActive(node.slug)
    const ancestor = isAncestor(node)
    const collapsed = collapsedGroups.has(node.slug)
    const isLeaf = !!node.meta

    return (
      <li key={node.slug} style={{ listStyle: 'none' }}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleGroup(node.slug)}
              className={`tutorial-sidebar-group${ancestor ? ' tutorial-sidebar-group--active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                width: '100%',
                textAlign: 'left',
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: ancestor ? 'var(--accent-a)' : 'var(--text-2)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{
                  transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}
              >
                <polyline points="2 3 5 6 8 3" />
              </svg>
              {node.title}
            </button>
            {!collapsed && (
              <ul style={{ paddingLeft: '1rem', marginTop: '0.2rem' }}>
                {node.children.map((child: any) => renderNode(child, depth + 1))}
              </ul>
            )}
          </>
        ) : (
          <Link
            href={`/tutorial/${node.slug}`}
            className={`tutorial-sidebar-link${active ? ' tutorial-sidebar-link--active' : ''}`}
            style={{
              display: 'block',
              padding: '0.3rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              color: active ? 'var(--accent-a)' : 'var(--text-2)',
              background: active ? 'var(--accent-glow)' : 'transparent',
              textDecoration: 'none',
              fontWeight: active ? 500 : 400,
              transition: 'color 0.2s, background 0.2s',
              marginLeft: depth > 1 ? '1rem' : '0',
            }}
          >
            {node.title}
          </Link>
        )}
      </li>
    )
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="tutorial-sidebar-toggle"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label={t('tutorial.sidebar.toggle')}
        style={{
          display: 'none',
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 50,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--accent-a)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          fontSize: '1.2rem',
        }}
      >
        📑
      </button>

      {/* Sidebar */}
      <aside
        ref={asideRef}
        onClick={handleSidebarClick}
        className={`tutorial-sidebar${mobileOpen ? ' tutorial-sidebar--open' : ''}${sidebarReady && sidebarHidden ? ' tutorial-sidebar--hidden' : ''}`}
      >
        <div className="tutorial-sidebar-header">
          <Link
            href="/tutorial"
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-1)',
              textDecoration: 'none',
            }}
          >
            {t('tutorial.sidebar.title')}
          </Link>
          <button
            onClick={toggleSidebar}
            className="tutorial-sidebar-collapse-btn"
            aria-label={t('tutorial.sidebar.collapse')}
            title="隐藏侧边栏"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              color: 'var(--text-3)',
              padding: '2px 4px',
              borderRadius: '4px',
              lineHeight: 1,
            }}
          >
            ◀
          </button>
        </div>
        <nav>
          <ul style={{ padding: 0, margin: 0 }}>
            {navigation.tree.map((node) => renderNode(node, 0))}
          </ul>
        </nav>
      </aside>

      {/* Floating expand button when sidebar is hidden (desktop only) */}
      <button
        className={`tutorial-sidebar-expand${sidebarReady && sidebarHidden ? ' tutorial-sidebar-expand--visible' : ''}`}
        onClick={toggleSidebar}
        aria-label={t('tutorial.sidebar.expand')}
        title="显示侧边栏"
      >
        ▶
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="tutorial-sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          style={{
            display: 'none',
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(0,0,0,0.4)',
          }}
        />
      )}
    </>
  )
}
