/**
 * Placeholder component for Vue interactive demos that were not converted.
 * Rendered as a static note with a link to the original page.
 */
export function VueDemoPlaceholder({ name, url }: { name: string; url: string }) {
  return (
    <div
      className="vue-demo-placeholder"
      style={{
        border: '2px dashed var(--border)',
        borderRadius: '12px',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        color: 'var(--text-3)',
        margin: '1.5rem 0',
        background: 'var(--surface)',
      }}
    >
      <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-2)' }}>
        📦 Interactive Demo: {name}
      </p>
      <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>
        This interactive visualization is not available in the static version.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'var(--accent-a)',
          fontSize: '0.88rem',
          fontWeight: 500,
        }}
      >
        🔗 View original interactive demo →
      </a>
    </div>
  )
}
