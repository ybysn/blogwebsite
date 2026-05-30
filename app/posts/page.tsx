import { getCategorizedPosts } from '@/lib/categories'
import { PostsContent } from '@/app/posts/posts-content'

export default function PostsPage() {
  const categorized = getCategorizedPosts()

  return <PostsContent categorized={categorized} />
}
