'use client'

import { useState, useCallback, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { TOOLS } from '../tools-data'

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

function safeUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/* ------------------------------------------------------------------ */

function JsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [status, setStatus] = useState('')
  const [copied, setCopied] = useState(false)

  const format = useCallback(() => {
    try { const obj = JSON.parse(input); setOutput(JSON.stringify(obj, null, 2)); setStatus('✓ 有效 JSON') }
    catch { setStatus('✗ 无效 JSON'); setOutput(input) }
  }, [input])

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>JSON 格式化</h2>
        <div className="tool-actions">
          {status && <span className={status.startsWith('✓') ? 'tool-status-ok' : 'tool-status-err'}>{status}</span>}
          <button onClick={format} className="btn btn-primary btn-sm">格式化</button>
          <button onClick={() => { setInput(''); setOutput(''); setStatus('') }} className="btn btn-ghost btn-sm">清空</button>
        </div>
      </div>
      <div className="tool-grid">
        <div>
          <label className="tool-label">输入</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="tool-textarea" rows={10} placeholder='{"key": "value"}' spellCheck={false} />
        </div>
        <div>
          <label className="tool-label">输出</label>
          <textarea value={output} readOnly className="tool-textarea" rows={10} />
          {output && (
            <button onClick={() => { copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
              className="btn btn-ghost btn-xs" style={{ marginTop: '0.35rem' }}>
              {copied ? '已复制' : '复制'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const encode = () => { try { setOutput(btoa(input)) } catch { setOutput('编码失败') } }
  const decode = () => { try { setOutput(atob(input)) } catch { setOutput('解码失败') } }
  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>Base64</h2>
        <div className="tool-actions">
          <button onClick={encode} className="btn btn-primary btn-sm">编码</button>
          <button onClick={decode} className="btn btn-primary btn-sm">解码</button>
        </div>
      </div>
      <div className="tool-grid">
        <div>
          <label className="tool-label">输入</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="tool-textarea" rows={6} placeholder="输入文本..." />
        </div>
        <div>
          <label className="tool-label">输出</label>
          <textarea value={output} readOnly className="tool-textarea" rows={6} />
          {output && (
            <button onClick={() => { copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
              className="btn btn-ghost btn-xs" style={{ marginTop: '0.35rem' }}>
              {copied ? '已复制' : '复制'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function UrlTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const encode = () => { try { setOutput(encodeURIComponent(input)) } catch { setOutput('编码失败') } }
  const decode = () => { try { setOutput(decodeURIComponent(input)) } catch { setOutput('解码失败') } }
  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>URL 编解码</h2>
        <div className="tool-actions">
          <button onClick={encode} className="btn btn-primary btn-sm">编码</button>
          <button onClick={decode} className="btn btn-primary btn-sm">解码</button>
        </div>
      </div>
      <div className="tool-grid">
        <div>
          <label className="tool-label">输入</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="tool-textarea" rows={6} placeholder="输入 URL 或文本..." />
        </div>
        <div>
          <label className="tool-label">输出</label>
          <textarea value={output} readOnly className="tool-textarea" rows={6} />
          {output && (
            <button onClick={() => { copyToClipboard(output); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
              className="btn btn-ghost btn-xs" style={{ marginTop: '0.35rem' }}>
              {copied ? '已复制' : '复制'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function UuidTool() {
  const [uuids, setUuids] = useState<string[]>([])
  const [copied, setCopied] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => { setUuids([safeUuid()]); setReady(true) }, [])
  if (!ready) return <div className="tool-panel"><div className="tool-header"><h2>UUID 生成器</h2></div><p style={{ color: 'var(--text-3)' }}>加载中...</p></div>
  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>UUID 生成器</h2>
        <div className="tool-actions">
          <button onClick={() => setUuids(prev => [safeUuid(), ...prev].slice(0, 20))} className="btn btn-primary btn-sm">生成</button>
          <button onClick={() => setUuids([safeUuid()])} className="btn btn-ghost btn-sm">重新生成</button>
          <button onClick={() => { copyToClipboard(uuids.join('\n')); setCopied(-1); setTimeout(() => setCopied(null), 1500) }}
            className="btn btn-ghost btn-sm">{copied === -1 ? '已复制' : '复制全部'}</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {uuids.map((u, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <code className="tool-result" style={{ flex: 1, margin: 0 }}>{u}</code>
            <button onClick={() => { copyToClipboard(u); setCopied(i); setTimeout(() => setCopied(null), 1500) }}
              className="btn btn-ghost btn-xs">{copied === i ? '已复制' : '复制'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function TimestampTool() {
  const now = Date.now()
  const [tsInput, setTsInput] = useState('')
  const [tsResult, setTsResult] = useState('')
  const [copied, setCopied] = useState(false)
  const toDate = () => { const ts = parseInt(tsInput); if (isNaN(ts)) { setTsResult('无效时间戳'); return }; const d = new Date(ts < 1e12 ? ts * 1000 : ts); setTsResult(d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })) }
  const toNow = () => { const t = String(Math.floor(now / 1000)); setTsInput(t); setTsResult(new Date(now).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })) }
  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>时间戳</h2>
        <div className="tool-actions">
          <button onClick={toNow} className="btn btn-ghost btn-sm">当前时间</button>
        </div>
      </div>
      <div className="tool-grid">
        <div>
          <label className="tool-label">Unix 时间戳</label>
          <input value={tsInput} onChange={(e) => setTsInput(e.target.value)} className="tool-input" placeholder="1700000000" />
          <button onClick={toDate} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>转换</button>
        </div>
        <div>
          <label className="tool-label">北京时间</label>
          <input value={tsResult} readOnly className="tool-input" />
          {tsResult && (
            <button onClick={() => { copyToClipboard(tsResult); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
              className="btn btn-ghost btn-xs" style={{ marginTop: '0.35rem' }}>
              {copied ? '已复制' : '复制'}
            </button>
          )}
        </div>
      </div>
      <p className="tool-result" style={{ marginTop: '0.75rem' }}>
        当前：{Math.floor(now / 1000)} — {new Date(now).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function JwtTool() {
  const [input, setInput] = useState('')
  const [header, setHeader] = useState('')
  const [payload, setPayload] = useState('')
  const [error, setError] = useState('')
  const decode = () => {
    try { const p = input.split('.'); if (p.length !== 3) throw new Error(); setHeader(JSON.stringify(JSON.parse(atob(p[0])), null, 2)); setPayload(JSON.stringify(JSON.parse(atob(p[1])), null, 2)); setError('') }
    catch { setError('解码失败：无效的 JWT Token'); setHeader(''); setPayload('') }
  }
  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>JWT 解码</h2>
        <div className="tool-actions">
          <button onClick={decode} className="btn btn-primary btn-sm">解码</button>
          <button onClick={() => { setInput(''); setHeader(''); setPayload(''); setError('') }} className="btn btn-ghost btn-sm">清空</button>
        </div>
      </div>
      <label className="tool-label">JWT Token</label>
      <textarea value={input} onChange={(e) => { setInput(e.target.value); setError('') }} className="tool-textarea" rows={3} placeholder="粘贴 JWT Token..." />
      {error && <p className="tool-status-err" style={{ marginTop: '0.5rem' }}>{error}</p>}
      {header && (
        <>
          <h3 style={{ fontSize: '0.85rem', margin: '1rem 0 0.25rem', color: 'var(--text-2)', fontWeight: 600 }}>Header</h3>
          <pre className="tool-result">{header}</pre>
        </>
      )}
      {payload && (
        <>
          <h3 style={{ fontSize: '0.85rem', margin: '1rem 0 0.25rem', color: 'var(--text-2)', fontWeight: 600 }}>Payload</h3>
          <pre className="tool-result">{payload}</pre>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

function ColorTool() {
  const [hex, setHex] = useState('#3451b2')
  const [rgb, setRgb] = useState('')
  const [hsl, setHsl] = useState('')
  const [copied, setCopied] = useState<Record<string, boolean>>({})
  const convert = (value: string) => {
    setHex(value)
    try {
      const h = value.replace('#', '')
      if (h.length === 6) {
        const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16)
        setRgb(`rgb(${r}, ${g}, ${b})`)
        const rr = r / 255, gg = g / 255, bb = b / 255
        const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb)
        const l = (max + min) / 2
        const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min)
        let hue = 0
        if (max !== min) { if (max === rr) hue = ((gg - bb) / (max - min)) * 60; else if (max === gg) hue = (2 + (bb - rr) / (max - min)) * 60; else hue = (4 + (rr - gg) / (max - min)) * 60 }
        if (hue < 0) hue += 360
        setHsl(`hsl(${Math.round(hue)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`)
      }
    } catch { setRgb(''); setHsl('') }
  }
  const copy = (label: string, text: string) => { copyToClipboard(text); setCopied(prev => ({ ...prev, [label]: true })); setTimeout(() => setCopied(prev => ({ ...prev, [label]: false })), 1500) }
  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>颜色转换</h2>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: hex, border: '2px solid var(--border)', flexShrink: 0 }} />
        <input value={hex} onChange={(e) => { const v = e.target.value; convert(v.startsWith('#') ? v : '#' + v) }}
          className="tool-input" style={{ flex: 1, fontSize: '0.95rem' }} placeholder="#3451b2" />
      </div>
      <div className="tool-grid">
        {[{ label: 'HEX', value: hex }, { label: 'RGB', value: rgb }, { label: 'HSL', value: hsl }].map(({ label, value }) => (
          <div key={label}>
            <label className="tool-label">{label}</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input value={value} readOnly className="tool-input" style={{ flex: 1 }} />
              {value && (
                <button onClick={() => copy(label, value)} className="btn btn-ghost btn-xs">
                  {copied[label] ? '已复制' : '复制'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TOOL_MAP: Record<string, React.FC> = {
  json: JsonTool, base64: Base64Tool, url: UrlTool, uuid: UuidTool,
  timestamp: TimestampTool, jwt: JwtTool, color: ColorTool,
}

export function ToolPageClient() {
  const params = useParams()
  const slug = params.tool as string
  const Component = TOOL_MAP[slug]
  if (!Component) return <p style={{ padding: '2rem', color: 'var(--text-3)' }}>工具未找到</p>
  return (
    <div className="tools-page">
      <Component />
    </div>
  )
}
