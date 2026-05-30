import Link from 'next/link'
import { SOCIAL_LINKS, SITE_NAME, AUTHOR } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span className="footer-item">
          &copy; {new Date().getFullYear()} {AUTHOR} &mdash; {SITE_NAME}
        </span>
        <span className="footer-sep" aria-hidden="true">&middot;</span>
        {SOCIAL_LINKS.github && (
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-item"
          >
            GitHub
          </a>
        )}
        {SOCIAL_LINKS.twitter && (
          <a
            href={SOCIAL_LINKS.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-item"
          >
            Twitter
          </a>
        )}
        <Link href="/feed.xml" className="footer-item">
          RSS
        </Link>
      </div>
    </footer>
  )
}
