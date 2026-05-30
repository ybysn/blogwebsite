'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import type { PostMeta } from '@/types'
import { PostList } from '@/components/posts/post-list'
import { SectionHeader } from '@/components/home/section-header'

interface PostListSectionProps {
  posts: PostMeta[]
  number?: string
  quote: string
  subtitle?: string
}

export function PostListSection({ posts, number, quote, subtitle }: PostListSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.post-list-container .post-card', {
          scrollTrigger: {
            trigger: '.post-list-container',
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
      {quote && <SectionHeader number={number} quote={quote} subtitle={subtitle} />}
      <div className="post-list-container">
        <PostList posts={posts} />
      </div>
    </div>
  )
}
