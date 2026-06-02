import type { Metadata } from 'next'
import { getTutorialNavigation } from '@/lib/tutorial'
import { TutorialLandingContent } from '@/components/tutorial/tutorial-landing-content'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: '教程 | Easy-Vibe AI 编程教程',
  description:
    'Easy-Vibe 教程 —— Datawhale 出品的 AI 编程教程，从零基础到高级开发，三步掌握 Vibe Coding。',
  openGraph: {
    title: 'Easy-Vibe AI 编程教程',
    description:
      'Datawhale 出品的 AI 编程教程，从零基础到高级开发，三步掌握 Vibe Coding。',
    type: 'website',
    url: `${SITE_URL}/tutorial`,
  },
}

export default function TutorialPage() {
  const nav = getTutorialNavigation()

  return <TutorialLandingContent navigation={nav} />
}
