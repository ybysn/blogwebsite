import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About',
  description: `About ${SITE_NAME} and its author.`,
}

export default function About() {
  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>About</h1>
      <div className="prose" style={{ color: 'var(--color-text-2)', lineHeight: 1.75 }}>
        <p>
          Welcome to my personal blog. I write about technology, programming,
          and whatever else catches my interest.
        </p>
        <p>
          This site is built with Next.js, TypeScript, Tailwind CSS, and MDX.
          It features tags, full-text search, RSS, dark mode, and comments via
          Giscus — all statically generated for maximum performance.
        </p>
        <p>
          Feel free to reach out on social media or subscribe to the RSS feed
          to stay updated with new posts.
        </p>
      </div>
    </div>
  )
}
