import type { Metadata } from 'next'
import { getSearchDocuments } from '@/lib/search'
import { SearchContent } from '@/app/search-content'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search all posts by title, description, and tags.',
}

export default function SearchPage() {
  const documents = getSearchDocuments()

  return <SearchContent documents={documents} />
}
