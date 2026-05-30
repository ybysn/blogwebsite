'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useTranslation } from '@/components/layout/language-provider'
import { AUTHOR } from '@/lib/constants'

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } })

        tl.from('.hero-greeting', { y: 30, autoAlpha: 0 }, 0)
        tl.from('.hero-name', { y: 30, autoAlpha: 0 }, '-=0.5')
        tl.from('.hero-tagline', { y: 30, autoAlpha: 0 }, '-=0.4')
        tl.from('.hero-description', { y: 20, autoAlpha: 0, duration: 0.7 }, '-=0.3')
        tl.from(
          '.hero-ctas > *',
          { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.1 },
          '-=0.2',
        )
      })
      return () => mm.revert()
    },
    { scope: containerRef },
  )

  return (
    <div ref={containerRef} className="hero-section-wrap">
      <div className="hero-gradient-bg" aria-hidden="true" />
      <section className="hero-section">
        <p className="hero-greeting">{t('home.hero.greeting')}</p>
        <h1 className="hero-name hero-gradient-text">{AUTHOR}</h1>
        <p className="hero-tagline">{t('home.hero.tagline')}</p>
        <p className="hero-description">{t('home.hero.description')}</p>
        <div className="hero-ctas">
          <Link href="/about" className="cta-primary">
            {t('home.hero.cta.about')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link href="/search" className="cta-secondary">
            {t('home.hero.cta.search')}
          </Link>
        </div>
      </section>
    </div>
  )
}
