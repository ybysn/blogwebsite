'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

interface SectionHeaderProps {
  number?: string
  quote: string
  subtitle?: string
  align?: 'left' | 'center'
}

export function SectionHeader({ number, quote, subtitle, align = 'left' }: SectionHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            once: true,
            toggleActions: 'play none none none',
          },
        })

        if (number) {
          tl.from(
            containerRef.current!.querySelector('.section-header-number'),
            { xPercent: -50, autoAlpha: 0, duration: 0.6, ease: 'power3.out' },
            0,
          )
        }

        tl.from(
          containerRef.current!.querySelector('.section-header-quote'),
          { y: 30, autoAlpha: 0, duration: 0.7, ease: 'power3.out' },
          number ? '-=0.3' : 0,
        )

        if (subtitle) {
          tl.from(
            containerRef.current!.querySelector('.section-header-sub'),
            { y: 20, autoAlpha: 0, duration: 0.6, ease: 'power3.out' },
            '-=0.2',
          )
        }
      })
      return () => mm.revert()
    },
    { scope: containerRef },
  )

  return (
    <div
      ref={containerRef}
      className={`section-header${align === 'center' ? ' section-header--center' : ''}`}
    >
      {number && <span className="section-header-number">{number}</span>}
      <div>
        <h2 className="section-header-quote">{quote}</h2>
        {subtitle && <p className="section-header-sub">{subtitle}</p>}
      </div>
    </div>
  )
}
