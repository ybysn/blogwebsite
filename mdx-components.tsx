import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import { CodeBlock } from '@/components/posts/code-block'
import { ThemedImage } from '@/components/ui/themed-image'

const components: MDXComponents = {
  h1: ({ children, ...props }) => (
    <h1 {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p {...props}>
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
  img: ThemedImage,
  ul: ({ children, ...props }) => (
    <ul {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote {...props}>
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
    <table {...props}>
      {children}
    </table>
  ),
  th: ({ children, ...props }) => (
    <th {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td {...props}>
      {children}
    </td>
  ),
  pre: (props) => <CodeBlock {...props} />,
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

export { components }
