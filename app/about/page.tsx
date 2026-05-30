import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'
import { AboutContent } from '@/app/about-content'

export const metadata: Metadata = {
  title: 'About',
  description: `About ${SITE_NAME} and its author.`,
}

export default function About() {
  return <AboutContent />
}
