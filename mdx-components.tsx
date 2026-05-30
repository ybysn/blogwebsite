import type { MDXComponents } from 'mdx/types'
import Image, { type ImageProps } from 'next/image'
import Link from 'next/link'

const components: MDXComponents = {
  h1: ({ children, ...props }) => (
    <h1 style={{ fontSize: 'clamp(1.6rem, 1.1rem + 1.8vw, 2.2rem)', fontWeight: 800, marginTop: '2.5rem', marginBottom: '1rem' }} {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 style={{ fontSize: 'clamp(1.2rem, 0.95rem + 0.7vw, 1.45rem)', fontWeight: 800, marginTop: '2rem', marginBottom: '0.75rem' }} {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem' }} {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' }} {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p style={{ lineHeight: 1.65, margin: '1rem 0' }} {...props}>
      {children}
    </p>
  ),
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith('http')
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-accent-a)', textDecoration: 'underline', textUnderlineOffset: '2px', fontWeight: 500 }}
          {...props}
        >
          {children}
        </a>
      )
    }
    return (
      <Link
        href={href ?? '#'}
        style={{ color: 'var(--color-accent-a)', textDecoration: 'underline', textUnderlineOffset: '2px', fontWeight: 500 }}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    )
  },
  img: (props) => (
    <Image
      sizes="100vw"
      style={{ width: '100%', height: 'auto', borderRadius: '12px', margin: '2rem 0' }}
      {...(props as ImageProps)}
    />
  ),
  ul: ({ children, ...props }) => (
    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', margin: '1rem 0' }} {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol style={{ listStyle: 'decimal', paddingLeft: '1.5rem', margin: '1rem 0' }} {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li style={{ lineHeight: 1.75, marginBottom: '0.25rem' }} {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      style={{
        borderLeft: '4px solid var(--accent-a)',
        paddingLeft: '1rem',
        fontStyle: 'italic',
        color: 'var(--color-text-3)',
        margin: '1.5rem 0',
      }}
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: (props) => (
    <hr
      style={{
        margin: '2rem 0',
        border: 'none',
        borderTop: '1px solid var(--border)',
      }}
      {...props}
    />
  ),
  table: ({ children, ...props }) => (
    <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children, style: propStyle, ...props }) => (
    <th
      style={{
        padding: '10px 16px',
        textAlign: 'left',
        background: 'var(--surface)',
        color: 'var(--text)',
        fontWeight: 700,
        fontSize: '0.9rem',
        ...(propStyle as React.CSSProperties),
      }}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, style: propStyle, ...props }) => (
    <td
      style={{
        padding: '8px 16px',
        borderTop: '1px solid var(--border)',
        fontSize: '0.9rem',
        ...(propStyle as React.CSSProperties),
      }}
      {...props}
    >
      {children}
    </td>
  ),
  pre: ({ children, style: propStyle, ...props }) => (
    <pre
      style={{
        background: 'var(--pre-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        overflowX: 'auto',
        margin: '1.5rem 0',
        color: 'var(--text-2)',
        ...(propStyle as React.CSSProperties),
      }}
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ children, style: propStyle, ...props }) => {
    return (
      <code
        style={{
          fontSize: '0.875rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-accent-a)',
          fontWeight: 500,
          ...(propStyle as React.CSSProperties),
        }}
        {...props}
      >
        {children}
      </code>
    )
  },
}

export function useMDXComponents(): MDXComponents {
  return components
}
