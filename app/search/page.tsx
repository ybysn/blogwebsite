import type { Metadata } from 'next'
import { getSearchDocuments } from '@/lib/search'
import { SearchInput } from '@/components/posts/search-input'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search all posts by title, description, and tags.',
}

export default function SearchPage() {
  const documents = getSearchDocuments()

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Search</h1>
      <SearchInput documents={documents} />
    </div>
  )
}
