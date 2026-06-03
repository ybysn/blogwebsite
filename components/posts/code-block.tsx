'use client'

import { useState, useRef, useCallback } from 'react'

interface CodeBlockProps {
  children: React.ReactNode
  /** Optional filename/title displayed in the header bar (e.g. from rehype-pretty-code) */
  'data-language'?: string
  [key: string]: unknown
}

export function CodeBlock({ children, 'data-language': language, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  const handleCopy = useCallback(async () => {
    const code = preRef.current?.querySelector('code')
    const text = code?.textContent ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers or insecure contexts
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // silently fail
      }
      document.body.removeChild(textarea)
    }
  }, [])

  return (
    <div className="code-block-wrapper" style={{ position: 'relative', margin: '1.5rem 0' }}>
      {/* Header bar with language label and copy button */}
      <div
        className="code-block-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.4rem 1rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          borderRadius: '12px 12px 0 0',
          fontSize: '0.8rem',
          color: 'var(--text-3)',
        }}
      >
        <span>{language ?? 'code'}</span>
        <button
          onClick={handleCopy}
          className="copy-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: copied ? 'var(--accent-glow)' : 'transparent',
            color: copied ? 'var(--accent-a)' : 'var(--text-3)',
            fontSize: '0.78rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre
        ref={preRef}
        style={{
          background: 'var(--pre-bg)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: '1rem 1.25rem',
          overflowX: 'auto',
          margin: 0,
          color: 'var(--text-2)',
        }}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}
