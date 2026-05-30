import Link from 'next/link'
import { DarkToggle } from '@/components/ui/dark-toggle'
import { SITE_NAME } from '@/lib/constants'

export function Header() {
  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          {SITE_NAME}
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/tags" className="nav-link">Tags</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/search" className="nav-link">Search</Link>
          <DarkToggle />
        </div>
      </div>
    </header>
  )
}
