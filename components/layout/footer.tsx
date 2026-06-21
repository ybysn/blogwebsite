import Link from 'next/link'
import { SOCIAL_LINKS, SITE_NAME, AUTHOR } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        {/* Column 1: About */}
        <div>
          <h4 className="footer-col-title">{SITE_NAME}</h4>
          <p className="footer-col-desc">
            A statically generated blog about technology, built with Next.js and MDX. No ads, no tracking — just writing.
          </p>
        </div>

        {/* Column 2: Navigation */}
        <div>
          <h4 className="footer-col-title">Links</h4>
          <Link href="/" className="footer-col-link">Home</Link>
          <Link href="/posts" className="footer-col-link">Posts</Link>
          <Link href="/about" className="footer-col-link">About</Link>
          <Link href="/search" className="footer-col-link">Search</Link>
          <Link href="/tools" className="footer-col-link">Tools</Link>
        </div>

        {/* Column 3: Social */}
        <div>
          <h4 className="footer-col-title">Social</h4>
          {SOCIAL_LINKS.github && (
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="footer-col-link">
              GitHub
            </a>
          )}
          {SOCIAL_LINKS.twitter && (
            <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="footer-col-link">
              Twitter / X
            </a>
          )}
        </div>

        {/* Column 4: Subscribe */}
        <div>
          <h4 className="footer-col-title">Subscribe</h4>
          <Link href="/feed.xml" className="footer-col-link">RSS Feed</Link>
        </div>

        {/* Column 5: Stack */}
        <div>
          <h4 className="footer-col-title">Stack</h4>
          <span className="footer-col-link">Next.js 16</span>
          <span className="footer-col-link">Tailwind CSS 4</span>
          <span className="footer-col-link">MDX</span>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} {AUTHOR}. All rights reserved.
      </div>
    </footer>
  )
}
