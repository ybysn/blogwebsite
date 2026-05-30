'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useTranslation, useLocale } from '@/components/layout/language-provider'
import type { CategoryGroup } from '@/lib/categories'
import { SectionHeader } from '@/components/home/section-header'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function PostsContent({ categorized }: { categorized: CategoryGroup[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const { locale } = useLocale()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.category-card', {
          scrollTrigger: {
            trigger: '.category-cards',
            start: 'top 80%',
            once: true,
            toggleActions: 'play none none none',
          },
          y: 40,
          autoAlpha: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
        })
      })
      return () => mm.revert()
    },
    { scope: containerRef },
  )

  if (categorized.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-muted)' }}>
        {t('posts.empty')}
      </div>
    )
  }

  return (
    <div ref={containerRef}>
      <SectionHeader
        number="01"
        quote={t('posts.title')}
        subtitle={t('posts.description')}
      />
      <div className="category-cards">
        {categorized.map((group, index) => (
          <Link
            key={group.category.id}
            href={`/posts/category/${group.category.id}`}
            className="category-card card"
          >
            <span className="category-card-number">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="category-card-body">
              <h2 className="category-card-title">
                {group.category.name[locale] ?? group.category.name.en}
              </h2>
              <p className="category-card-desc">
                {group.category.description[locale] ?? group.category.description.en}
              </p>
              <span className="category-card-count">
                {group.posts.length} {locale === 'zh-CN' ? '篇文章' : 'posts'}
              </span>
            </div>
            <svg className="category-card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
