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
        📄 许可与署名
      </p>
      <p style={{ margin: '0 0 0.25rem 0' }}>
        内容改编自{' '}
        <a
          href="https://github.com/datawhalechina/easy-vibe"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-a)' }}
        >
          Easy-Vibe 项目
        </a>{' '}
        ，由 <strong>Datawhale</strong> 制作，基于{' '}
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-a)' }}
        >
          CC BY-NC-SA 4.0
        </a>
        。
      </p>
      <p style={{ margin: 0 }}>
        可自由分享和改编，需署名、非商业用途、相同方式共享。
      </p>
      {originalUrl && (
        <p style={{ margin: '0.5rem 0 0 0' }}>
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-a)', fontSize: '0.82rem' }}
          >
            🔗 查看 Easy-Vibe 原文 →
          </a>
        </p>
      )}
    </div>
  )
}
