'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLocale } from '@/components/layout/language-provider'
import type { Category } from '@/lib/categories'
import type { PostMeta } from '@/types'
import { SectionHeader } from '@/components/home/section-header'
import { PostList } from '@/components/posts/post-list'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function CategoryContent({ category, posts }: { category: Category; posts: PostMeta[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { locale } = useLocale()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.category-page-list .post-card', {
          scrollTrigger: {
            trigger: '.category-page-list',
            start: 'top 80%',
            once: true,
            toggleActions: 'play none none none',
          },
          y: 40,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
        })
      })
      return () => mm.revert()
    },
    { scope: containerRef },
  )

  return (
    <div ref={containerRef}>
      <SectionHeader
        number="01"
        quote={category.name[locale] ?? category.name.en}
        subtitle={category.description[locale] ?? category.description.en}
      />
      <div className="category-page-list">
        <PostList posts={posts} />
      </div>
      <div style={{ marginTop: '2rem' }}>
        <Link href="/posts" className="cta-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          {locale === 'zh-CN' ? '返回全部文章' : 'All Posts'}
        </Link>
      </div>
    </div>
  )
}
