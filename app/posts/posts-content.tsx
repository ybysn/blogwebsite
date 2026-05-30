'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useTranslation, useLocale } from '@/components/layout/language-provider'
import type { CategoryGroup } from '@/lib/categories'
import { SectionHeader } from '@/components/home/section-header'
import { PostList } from '@/components/posts/post-list'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function PostsContent({ categorized }: { categorized: CategoryGroup[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const { locale } = useLocale()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Animate each category section on scroll
        const sections = containerRef.current?.querySelectorAll('.category-section')
        sections?.forEach((section, i) => {
          gsap.from(section.querySelectorAll('.post-card'), {
            scrollTrigger: {
              trigger: section,
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
      {categorized.map((group, index) => (
        <div key={group.category.id} className="category-section">
          <SectionHeader
            number={String(index + 1).padStart(2, '0')}
            quote={group.category.name[locale] ?? group.category.name.en}
            subtitle={group.category.description[locale] ?? group.category.description.en}
          />
          <div className="post-list-container" style={{ marginBottom: index < categorized.length - 1 ? '3rem' : 0 }}>
            <PostList posts={group.posts} />
          </div>
        </div>
      ))}
    </div>
  )
}
