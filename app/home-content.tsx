'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import type { PostMeta } from '@/types'
import { useTranslation } from '@/components/layout/language-provider'
import { HeroSection } from '@/components/home/hero-section'
import { PostListSection } from '@/components/home/post-list-section'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function HomeContent({ posts }: { posts: PostMeta[] }) {
  const { t } = useTranslation()

  return (
    <div>
      <HeroSection />
      <PostListSection
        posts={posts}
        number="01"
        quote={t('home.section.posts.quote')}
        subtitle={t('home.latest')}
      />
    </div>
  )
}
