interface TutorialAttributionProps {
  originalUrl?: string
}

export function TutorialAttribution({ originalUrl }: TutorialAttributionProps) {
  return (
    <div
      className="tutorial-attribution"
      style={{
        marginTop: '3rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        fontSize: '0.85rem',
        color: 'var(--text-3)',
        lineHeight: 1.7,
      }}
    >
      <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-2)' }}>
        📄 License & Attribution
      </p>
      <p style={{ margin: '0 0 0.25rem 0' }}>
        This content is adapted from the{' '}
        <a
          href="https://github.com/datawhalechina/easy-vibe"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-a)' }}
        >
          Easy-Vibe project
        </a>{' '}
        by <strong>Datawhale</strong>, licensed under{' '}
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-a)' }}
        >
          CC BY-NC-SA 4.0
        </a>
        .
      </p>
      <p style={{ margin: 0 }}>
        You are free to share and adapt this material with attribution, for
        non-commercial purposes, under the same license.
      </p>
      {originalUrl && (
        <p style={{ margin: '0.5rem 0 0 0' }}>
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-a)', fontSize: '0.82rem' }}
          >
            🔗 View original on Easy-Vibe →
          </a>
        </p>
      )}
    </div>
  )
}
