import { type MDXComponents } from 'mdx/types'
import type { ComponentType } from 'react'

/**
 * Preprocess MDX source to fix common patterns incompatible with MDX/JSX parsing:
 * 1. Auto-links <https://...> → bare URL (MDX treats <https as JSX tag)
 * 2. Vue.js template syntax {{ }} → HTML-encoded {&#123;{ }} (MDX treats { as JSX expr)
 * 3. <el-xxx> custom elements → wrapped in backticks (avoid JSX parsing)
 */
function preprocessMdxSource(source: string): string {
  // Split into sections: code blocks (preserved) and non-code blocks (transformed)
  const parts: string[] = []
  let inBlock = false
  let openFenceLength = 0

  // Match fenced code blocks (``` or ~~~ with optional language)
  const fenceRe = /^( {0,3})(`{3,}|~{3,})(\S*)\s*$/gm
  let match: RegExpExecArray | null
  let lastIndex = 0

  while ((match = fenceRe.exec(source)) !== null) {
    const fenceLine = match[0]
    const fenceStart = match.index

    if (inBlock) {
      // Closing fence — check if it matches the opening fence
      const openLen = openFenceLength
      const closeLen = match[2].length
      if (closeLen >= openLen) {
        // End of code block
        parts.push(source.slice(lastIndex, fenceStart + fenceLine.length))
        lastIndex = fenceStart + fenceLine.length
        inBlock = false
      }
      continue
    }

    // Opening fence
    inBlock = true
    openFenceLength = match[2].length
    // Push the non-code section before this fence
    parts.push(source.slice(lastIndex, fenceStart))
    lastIndex = fenceStart
  }

  // Push remaining content
  if (lastIndex < source.length) {
    parts.push(source.slice(lastIndex))
  }

  // Transform only non-code sections (even indices: 0, 2, 4, ...)
  // Code sections (odd indices: 1, 3, 5, ...) are preserved as-is
  const transformed = parts.map((part, i) => {
    if (i % 2 === 1) return part // Skip code blocks

    return transformSection(part)
  })

  return transformed.join('')
}

/**
 * Transform a non-code-block section of MDX source to fix common
 * patterns incompatible with MDX/JSX parsing.
 */
function transformSection(text: string): string {
  return text
    // Fix auto-link syntax: <https://url> → bare URL
    // MDX treats <https as opening JSX tag
    .replace(/<(https?:\/\/[^>\s]+)>/g, '$1')
    // Fix Vue.js template syntax: {{ expr }} → HTML-encoded
    // MDX treats { } as JSX expression delimiters
    .replace(/\{\{(.+?)\}\}/g, '&#123;&#123;$1&#125;&#125;')
    // Fix Markdown heading custom IDs: ## Title {#custom-id} → ## Title
    // MDX treats {#...} as a JSX expression which acorn can't parse
    .replace(/^(\s*#{1,6}\s+.*)\s*\{#[^}]*\}\s*$/gm, '$1')
    // Fix Vue slot shorthand: <template #slot> → <div class="tpl-slot tpl-slotName">
    // MDX treats # as invalid attribute character after tag name
    .replace(
      /<template\s+#([a-zA-Z][\w-]*)(?:\s*=\s*"(\w+)")?\s*>/g,
      (_, slot: string, scope: string) =>
        scope
          ? `<div class="tpl-slot tpl-${slot}" data-scope="${scope}">`
          : `<div class="tpl-slot tpl-${slot}">`,
    )
    .replace(/<\/template>/g, '</div>')
    // Fix Vue v-else-if and similar directives
    .replace(/\sv-else-if="([^"]*)"/g, ' data-v-else-if="$1"')
    .replace(/\sv-else\b/g, ' data-v-else')
    // Fix orphan closing HTML tags that appear as examples outside code blocks
    // </html>, </body>, </head> never appear as legitimate tags in MDX
    .replace(/<\/(html|body|head)>/g, '`</$1>`')
    // Also escape opening <html>, <body>, <head> tags used as examples
    // These never appear as legitimate tags in MDX content
    .replace(/<(html|body|head)(\s[^>]*)?>/g, '`<$1$2>`')
    // Fix React fragment shorthand <> and </> used as literal text
    // MDX treats <> as a JSX fragment opening
    .replace(/<>/g, '`<>`')
    .replace(/<\/>/g, '`</>`')
    // Fix <el-xxx> custom element tags (Element UI components)
    // Use [\s\S]*? for multiline matching (tags can span multiple lines)
    .replace(/<el-([\w-]+)([\s\S]*?)>/g, '`<el-$1$2>`')
    .replace(/<\/el-([\w-]+)>/g, '`</el-$1>`')
    // Fix JS template literals / code in <code> blocks that contain { }
    // Escape braces inside <code>...</code> to prevent JSX expression parsing
    .replace(/(<code[^>]*>)([\s\S]*?)(<\/code>)/g, (_, open, inner, close) => {
      const escaped = inner.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')
      return open + escaped + close
    })
    // Fix braces inside <pre>...</pre> (often contain code examples)
    .replace(/(<pre[^>]*>)([\s\S]*?)(<\/pre>)/g, (_, open, inner, close) => {
      // Only escape if inner contains <code> (otherwise leave as-is)
      if (inner.includes('{') || inner.includes('}')) {
        const escaped = inner.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')
        return open + escaped + close
      }
      return open + inner + close
    })
}

/**
 * Compiles and renders MDX source on the server.
 * Returns the compiled component and the components context.
 */
export async function compileMdx(source: string): Promise<{
  Content: ComponentType<{ components?: MDXComponents }>
} | null> {
  try {
    const { evaluate } = await import('@mdx-js/mdx')
    const jsxRuntime = await import('react/jsx-runtime')
    const remarkGfm = (await import('remark-gfm')).default
    const rehypeSlug = (await import('rehype-slug')).default
    const rehypePrettyCode = (await import('rehype-pretty-code')).default

    // Preprocess source to fix common MDX-incompatible patterns
    const processedSource = preprocessMdxSource(source)

    // evaluate needs Fragment, jsx, jsxs from the JSX runtime
    const { default: Content } = await evaluate(processedSource, {
      Fragment: jsxRuntime.Fragment,
      jsx: jsxRuntime.jsx,
      jsxs: jsxRuntime.jsxs,
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: {
              light: 'github-light',
              dark: 'github-dark-dimmed',
            },
            keepBackground: false,
            defaultLang: 'plaintext',
          },
        ],
      ],
      development: false,
    })

    return { Content: Content as ComponentType<{ components?: MDXComponents }> }
  } catch (err) {
    console.error('MDX compilation error:', err)
    return null
  }
}
