'use client'

import { useRef } from 'react'
import type { TutorialNavigation } from '@/types'
import { useTranslation } from '@/components/layout/language-provider'
import { TutorialStageCard } from '@/components/tutorial/tutorial-stage-card'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

interface TutorialLandingContentProps {
  navigation: TutorialNavigation
}

export function TutorialLandingContent({
  navigation,
}: TutorialLandingContentProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const cards = containerRef.current?.querySelectorAll('.tutorial-stage-card')
      if (!cards || cards.length === 0) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            scrollTrigger: {
              trigger: cards[0],
              start: 'top 85%',
            },
          },
        )
      })
      return () => mm.revert()
    },
    { scope: containerRef },
  )

  const totalChapters = navigation.tree.reduce(
    (sum, node) => {
      const countLeaf = (n: typeof node): number => {
        if (n.children.length === 0) return 1
        return n.children.reduce((s, c) => s + countLeaf(c), 0)
      }
      return sum + countLeaf(node)
    },
    0,
  )

  return (
    <div ref={containerRef}>
      {/* Hero section */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '3rem',
          paddingTop: '1rem',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            color: 'var(--text-1)',
          }}
        >
          AI 编程实战教程
        </h1>
        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-2)',
            maxWidth: '640px',
            margin: '0 auto 1rem',
            lineHeight: 1.7,
          }}
        >
          {t('tutorial.hero.description')}
        </p>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-3)',
          }}
        >
          {totalChapters} chapters · CC BY-NC-SA 4.0 · Powered by Datawhale
        </p>
      </div>

      {/* Stage cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          maxWidth: '960px',
          margin: '0 auto',
        }}
      >
        {navigation.tree.map((node) => {
          const firstChild =
            node.children.length > 0 ? node.children[0] : null
          const startSlug = firstChild
            ? 'children' in firstChild && firstChild.children && firstChild.children.length > 0
              ? firstChild.children[0]?.slug
              : firstChild.slug
            : node.slug

          // Count total leaf tutorials under this node
          const countLeaf = (n: typeof node): number => {
            if (!n.children || n.children.length === 0) return 1
            return n.children.reduce((s, c) => s + countLeaf(c), 0)
          }
          const count = countLeaf(node)

          return (
            <TutorialStageCard
              key={node.slug}
              title={node.title}
              slug={startSlug}
              count={count}
            />
          )
        })}
      </div>

      {/* Footer note */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '3rem',
          padding: '1.5rem',
          borderRadius: '12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          color: 'var(--text-3)',
          maxWidth: '640px',
          margin: '3rem auto 0',
        }}
      >
        <p style={{ margin: 0 }}>
          📄 Content from{' '}
          <a
            href="https://github.com/datawhalechina/easy-vibe"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-a)' }}
          >
            Easy-Vibe by Datawhale
          </a>
          , licensed under CC BY-NC-SA 4.0.
        </p>
      </div>
    </div>
  )
}
