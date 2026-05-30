import type { PostMeta } from '@/types'
import { PostCard } from '@/components/posts/post-card'

export function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return (
      <p style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '3rem 0' }}>
        No posts yet. Check back soon!
      </p>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </div>
  )
}
