'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { HeroSection } from '@/components/home/hero-section'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function HomeContent() {
  return (
    <div>
      <HeroSection />
    </div>
  )
}
