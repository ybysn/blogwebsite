'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from '@/components/layout/language-provider'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

/* ------------------------------------------------------------------ */
/*  Tool: JSON Formatter                                              */
/* ------------------------------------------------------------------ */

function JsonTool({ t }: { t: (k: string, p?: Record<string, string | number>) => string }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState('')
  const [copied, setCopied] = useState(false)

  const format = useCallback(() => {
    try {
      const obj = JSON.parse(input)
      setOutput(JSON.stringify(obj, null, 2))
      setStatus(t('tools.validJson'))
    } catch {
      setStatus(t('tools.invalidJson'))
      setOutput(input)
    }
  }, [input, t])

  const copy = () => { copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>{t('tools.json')}</h2>
        <div className="tool-actions">
          {status && <span className={status.startsWith('✓') ? 'tool-status-ok' : 'tool-status-err'}>{status}</span>}
          <button onClick={format} className="btn btn-primary btn-sm">{t('tools.format')}</button>
          <button onClick={() => { setInput(''); setOutput(''); setStatus('') }} className="btn btn-ghost btn-sm">{t('tools.clear')}</button>
        </div>
      </div>
      <div className="tool-grid">
        <div>
          <label className="tool-label">{t('tools.input')}</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} className="tool-textarea" rows={10} placeholder='{"hello": "world"}' spellCheck={false} />
        </div>
        <div>
          <label className="tool-label">{t('tools.output')}</label>
          <textarea value={output} readOnly className="tool-textarea" rows={10} />
          {output && <button onClick={copy} className="btn btn-ghost btn-xs tool-copy-btn">{copied ? t('tools.copied') : t('tools.copy')}</button>}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tool: Base64 Encode/Decode                                        */
/* ------------------------------------------------------------------ */

function Base64Tool({ t }: { t: (k: string, p?: Record<string, string | number>) => string }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const encode = () => { try { setOutput(btoa(input)) } catch { setOutput('Invalid input') } }
  const decode = () => { try { setOutput(atob(input)) } catch { setOutput('Invalid Base64') } }
  const copy = () => { copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>{t('tools.base64')}</h2>
        <div className="tool-actions">
          <button onClick={encode} className="btn btn-primary btn-sm">{t('tools.encode')}</button>
          <button onClick={decode} className="btn btn-primary btn-sm">{t('tools.decode')}</button>
          <button onClick={() => { setInput(''); setOutput('') }} className="btn btn-ghost btn-sm">{t('tools.clear')}</button>
        </div>
      </div>
      <div className="tool-grid">
        <div>
          <label className="tool-label">{t('tools.input')}</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} className="tool-textarea" rows={6} spellCheck={false} />
        </div>
        <div>
          <label className="tool-label">{t('tools.output')}</label>
          <textarea value={output} readOnly className="tool-textarea" rows={6} />
          {output && <button onClick={copy} className="btn btn-ghost btn-xs tool-copy-btn">{copied ? t('tools.copied') : t('tools.copy')}</button>}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tool: URL Encode/Decode                                           */
/* ------------------------------------------------------------------ */

function UrlTool({ t }: { t: (k: string, p?: Record<string, string | number>) => string }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const encode = () => { try { setOutput(encodeURIComponent(input)) } catch { setOutput('Invalid input') } }
  const decode = () => { try { setOutput(decodeURIComponent(input)) } catch { setOutput('Invalid URL encoding') } }
  const copy = () => { copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>{t('tools.url')}</h2>
        <div className="tool-actions">
          <button onClick={encode} className="btn btn-primary btn-sm">{t('tools.encode')}</button>
          <button onClick={decode} className="btn btn-primary btn-sm">{t('tools.decode')}</button>
          <button onClick={() => { setInput(''); setOutput('') }} className="btn btn-ghost btn-sm">{t('tools.clear')}</button>
        </div>
      </div>
      <div className="tool-grid">
        <div>
          <label className="tool-label">{t('tools.input')}</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} className="tool-textarea" rows={4} spellCheck={false} />
        </div>
        <div>
          <label className="tool-label">{t('tools.output')}</label>
          <textarea value={output} readOnly className="tool-textarea" rows={4} />
          {output && <button onClick={copy} className="btn btn-ghost btn-xs tool-copy-btn">{copied ? t('tools.copied') : t('tools.copy')}</button>}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tool: UUID Generator                                              */
/* ------------------------------------------------------------------ */

function UuidTool({ t }: { t: (k: string, p?: Record<string, string | number>) => string }) {
  const [uuids, setUuids] = useState<string[]>([])
  const [copied, setCopied] = useState<number | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUuids([crypto.randomUUID()])
    setReady(true)
  }, [])

  const generate = () => { setUuids(prev => [crypto.randomUUID(), ...prev].slice(0, 20)) }
  const generateNew = () => setUuids([crypto.randomUUID()])
  const copy = (u: string, i: number) => { copyToClipboard(u); setCopied(i); setTimeout(() => setCopied(null), 1500) }
  const copyAll = () => { copyToClipboard(uuids.join('\n')); setCopied(-1); setTimeout(() => setCopied(null), 1500) }

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>{t('tools.uuid')}</h2>
        <div className="tool-actions">
          <button onClick={generate} className="btn btn-primary btn-sm" disabled={!ready}>{t('tools.generate')}</button>
          <button onClick={generateNew} className="btn btn-ghost btn-sm" disabled={!ready}>{t('tools.generateNew')}</button>
          {uuids.length > 1 && <button onClick={copyAll} className="btn btn-ghost btn-sm">{copied === -1 ? t('tools.copied') : 'Copy All'}</button>}
        </div>
      </div>
      {!ready ? (
        <div className="tool-result">Loading...</div>
      ) : (
      <ul className="tool-uuid-list">
        {uuids.map((u, i) => (
          <li key={i} className="tool-uuid-item" onClick={() => copy(u, i)} title="Click to copy">
            <code>{u}</code>
            <span className="tool-uuid-copy-hint">{copied === i ? t('tools.copied') : '📋'}</span>
          </li>
        ))}
      </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tool: Timestamp Converter                                         */
/* ------------------------------------------------------------------ */

function TimestampTool({ t }: { t: (k: string, p?: Record<string, string | number>) => string }) {
  const now = Date.now()
  const [tsInput, setTsInput] = useState('')
  const [tsResult, setTsResult] = useState('')
  const [dtInput, setDtInput] = useState('')
  const [dtResult, setDtResult] = useState('')

  const tsToDate = () => {
    const v = parseInt(tsInput)
    if (isNaN(v)) { setTsResult('Invalid timestamp'); return }
    const ms = v > 1e12 ? v : v * 1000
    setTsResult(new Date(ms).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }))
  }

  const dateToTs = () => {
    const d = new Date(dtInput)
    if (isNaN(d.getTime())) { setDtResult('Invalid date'); return }
    setDtResult(`${Math.floor(d.getTime() / 1000)} (seconds)\n${d.getTime()} (milliseconds)`)
  }

  const fillNow = () => {
    const now = new Date()
    // Get Beijing time components directly via Intl — works regardless of system timezone
    const beijing = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Shanghai' }))
    const pad = (n: number) => String(n).padStart(2, '0')
    setDtInput(`${beijing.getFullYear()}-${pad(beijing.getMonth() + 1)}-${pad(beijing.getDate())}T${pad(beijing.getHours())}:${pad(beijing.getMinutes())}`)
    // Unix timestamp is always UTC — timezone-agnostic
    setTsInput(String(Math.floor(now.getTime() / 1000)))
  }

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>{t('tools.timestamp')}</h2>
        <button onClick={fillNow} className="btn btn-ghost btn-sm">{t('tools.now')}</button>
      </div>
      <div className="tool-grid">
        <div>
          <label className="tool-label">Timestamp → Date</label>
          <input value={tsInput} onChange={e => setTsInput(e.target.value)} className="tool-input" placeholder="1719000000" onKeyDown={e => e.key === 'Enter' && tsToDate()} />
          <button onClick={tsToDate} className="btn btn-primary btn-xs" style={{ marginTop: 6 }}>Convert</button>
          <div className="tool-result">{tsResult}</div>
        </div>
        <div>
          <label className="tool-label">Date → Timestamp</label>
          <input type="datetime-local" value={dtInput} onChange={e => { setDtInput(e.target.value); dateToTs() }} className="tool-input" />
          <div className="tool-result" style={{ whiteSpace: 'pre-wrap' }}>{dtResult}</div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tool: JWT Decoder                                                 */
/* ------------------------------------------------------------------ */

function JwtTool({ t }: { t: (k: string, p?: Record<string, string | number>) => string }) {
  const [input, setInput] = useState('')
  const [header, setHeader] = useState('')
  const [payload, setPayload] = useState('')
  const [error, setError] = useState('')

  const decode = () => {
    try {
      const parts = input.trim().split('.')
      if (parts.length !== 3) { setError('Invalid JWT format (need 3 parts)'); return }
      setHeader(JSON.stringify(JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'))), null, 2))
      setPayload(JSON.stringify(JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))), null, 2))
      setError('')
    } catch {
      setError('Decode failed — invalid Base64 or JSON')
    }
  }

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>{t('tools.jwt')}</h2>
        <div className="tool-actions">
          <button onClick={decode} className="btn btn-primary btn-sm">{t('tools.decode')}</button>
          <button onClick={() => { setInput(''); setHeader(''); setPayload(''); setError('') }} className="btn btn-ghost btn-sm">{t('tools.clear')}</button>
        </div>
      </div>
      <div>
        <label className="tool-label">JWT Token</label>
        <textarea value={input} onChange={e => { setInput(e.target.value); setError('') }} className="tool-textarea" rows={3} placeholder="eyJhbGciOiJIUzI1NiIs..." spellCheck={false} />
        {error && <div className="tool-status-err" style={{ marginTop: 4 }}>{error}</div>}
      </div>
      {header && (
        <div className="tool-grid" style={{ marginTop: 12 }}>
          <div>
            <label className="tool-label">Header</label>
            <textarea value={header} readOnly className="tool-textarea" rows={6} />
          </div>
          <div>
            <label className="tool-label">Payload</label>
            <textarea value={payload} readOnly className="tool-textarea" rows={6} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tool: Color Converter                                             */
/* ------------------------------------------------------------------ */

function ColorTool({ t }: { t: (k: string, p?: Record<string, string | number>) => string }) {
  const [hex, setHex] = useState('#3451b2')
  const [rgb, setRgb] = useState('')
  const [hsl, setHsl] = useState('')

  const convert = useCallback((h: string) => {
    setHex(h)
    const m = /^#?([a-f0-9]{6})$/i.exec(h)
    if (!m) { setRgb(''); setHsl(''); return }
    const r = parseInt(m[1].slice(0, 2), 16)
    const g = parseInt(m[1].slice(2, 4), 16)
    const b = parseInt(m[1].slice(4, 6), 16)
    setRgb(`rgb(${r}, ${g}, ${b})`)
    const rf = r / 255, gf = g / 255, bf = b / 255
    const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf)
    let hh = 0, s = 0
    const l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      hh = max === rf ? (gf - bf) / d + (gf < bf ? 6 : 0) : max === gf ? (bf - rf) / d + 2 : (rf - gf) / d + 4
      hh /= 6
    }
    setHsl(`hsl(${Math.round(hh * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`)
  }, [])

  // Initialize
  useState(() => { convert('#3451b2'); return null })

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>{t('tools.color')}</h2>
      </div>
      <div className="tool-color-grid">
        <div>
          <label className="tool-label">HEX</label>
          <div className="tool-color-input-row">
            <input value={hex} onChange={e => convert(e.target.value)} className="tool-input" style={{ flex: 1 }} placeholder="#3451b2" />
            <div className="tool-color-swatch" style={{ backgroundColor: hex }} />
          </div>
        </div>
        <div>
          <label className="tool-label">RGB</label>
          <input value={rgb} readOnly className="tool-input" />
        </div>
        <div>
          <label className="tool-label">HSL</label>
          <input value={hsl} readOnly className="tool-input" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ToolsPage() {
  const { t } = useTranslation()

  return (
    <div className="tools-page">
      <h1 className="tools-page-title">{t('tools.title')}</h1>
      <p className="tools-page-desc">{t('tools.description')}</p>
      <JsonTool t={t} />
      <Base64Tool t={t} />
      <UrlTool t={t} />
      <UuidTool t={t} />
      <TimestampTool t={t} />
      <JwtTool t={t} />
      <ColorTool t={t} />
    </div>
  )
}
