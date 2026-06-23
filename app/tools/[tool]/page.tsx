import { ToolPageClient } from './tool-page-client'
import { TOOLS } from '../tools-data'

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ tool: tool.slug }))
}

export default function ToolPage() {
  return <ToolPageClient />
}
