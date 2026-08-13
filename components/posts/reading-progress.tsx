'use client'

import { useState, useEffect } from 'react'

/**
 * 阅读进度球 — 悬浮于右下角的环形进度指示器。
 * 环形进度表示整页阅读进度，点击回到顶部。
 * 滚动超过一定距离后才显示，避免页面顶部时干扰。
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let rafId: number | null = null

    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
      setProgress(pct)
      setVisible(scrollTop > 200)
    }

    const handleScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        update()
        rafId = null
      })
    }

    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const size = 48
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <button
      type="button"
      className={`reading-progress${visible ? ' reading-progress--visible' : ''}`}
      onClick={scrollToTop}
      aria-label="回到顶部"
      title={`阅读进度 ${Math.round(progress)}%`}
      tabIndex={visible ? 0 : -1}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="reading-progress-ring"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent-b)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--accent-b)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="reading-progress-arrow"
      >
        <polyline points="6 15 12 9 18 15" />
      </svg>
    </button>
  )
}
