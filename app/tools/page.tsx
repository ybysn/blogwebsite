import Link from 'next/link'
import { TOOLS } from './tools-data'

export default function ToolsPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '0.35rem',
        color: 'var(--text)',
      }}>
        效率工具
      </h1>
      <p style={{
        fontSize: '0.9rem',
        color: 'var(--text-3)',
        marginBottom: '2rem',
      }}>
        常用开发工具集
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '0.75rem',
      }}>
        {TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.1rem',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            className="tool-card"
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--accent-glow)',
              color: 'var(--accent-a)',
              fontSize: '1.1rem',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {tool.icon}
            </span>
            <div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: '0.15rem',
              }}>
                {tool.name}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-3)',
                lineHeight: 1.3,
              }}>
                {tool.desc}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
