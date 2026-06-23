import Link from 'next/link'
import { SOCIAL_LINKS, SITE_NAME, AUTHOR } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="site-footer">
      {/* Top row: logo + description */}
      <div className="footer-top">
        <Link href="/" className="footer-logo">{SITE_NAME}</Link>
        <p className="footer-desc">
          Next.js + MDX + Tailwind CSS 构建的个人技术博客。无广告、无追踪。
        </p>
      </div>

      {/* Grid: 2 cols on mobile, 4 on desktop */}
      <div className="footer-grid">
        <div>
          <h4 className="footer-col-title">链接</h4>
          <Link href="/posts" className="footer-col-link">文章</Link>
          <Link href="/tutorial" className="footer-col-link">教程</Link>
          <Link href="/tools" className="footer-col-link">工具</Link>
          <Link href="/about" className="footer-col-link">关于</Link>
          <Link href="/search" className="footer-col-link">搜索</Link>
        </div>

        <div>
          <h4 className="footer-col-title">订阅</h4>
          <Link href="/feed.xml" className="footer-col-link">RSS Feed</Link>
          {SOCIAL_LINKS.github && (
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="footer-col-link">
              GitHub
            </a>
          )}
        </div>

        <div>
          <h4 className="footer-col-title">技术栈</h4>
          <span className="footer-col-link">Next.js 16</span>
          <span className="footer-col-link">Tailwind CSS 4</span>
          <span className="footer-col-link">MDX</span>
        </div>

        <div>
          <h4 className="footer-col-title">更多</h4>
          <Link href="/" className="footer-col-link">首页</Link>
          <Link href="/feed.xml" className="footer-col-link">RSS</Link>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} {AUTHOR}
      </div>
    </footer>
  )
}
