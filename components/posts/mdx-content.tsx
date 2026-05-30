import { compileMdx } from './mdx-remote'
import { useMDXComponents } from '@/mdx-components'

/**
 * Server component that compiles and renders MDX source.
 * Uses the shared MDX components from mdx-components.tsx for consistent styling.
 */
export async function MDXContent({ source }: { source: string }) {
  const components = useMDXComponents()
  const result = await compileMdx(source)

  if (!result) {
    return (
      <div className="p-4 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300">
        <p className="font-semibold">Error rendering content.</p>
        <p className="text-sm mt-1">The post could not be compiled. Please check the MDX syntax.</p>
      </div>
    )
  }

  const { Content } = result
  return <Content components={components} />
}
