import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="面包屑导航" style={{ marginBottom: '1.5rem' }}>
      <ol
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
        }}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <span style={{ margin: '0 0.5rem' }}>/</span>}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  style={{ color: 'var(--primary)', textDecoration: 'none' }}
                >
                  {item.label}
                </Link>
              ) : (
                <span style={isLast ? { color: 'var(--text)' } : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
