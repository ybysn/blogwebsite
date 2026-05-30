import { type MDXComponents } from 'mdx/types'
import type { ComponentType } from 'react'

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

    // evaluate needs Fragment, jsx, jsxs from the JSX runtime
    const { default: Content } = await evaluate(source, {
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
