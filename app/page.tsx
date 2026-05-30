import { getAllPosts } from '@/lib/posts'
import { PostList } from '@/components/posts/post-list'

export default function Home() {
  const posts = getAllPosts()

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Latest Posts</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '1.05rem' }}>
          Thoughts on technology, programming, and more.
        </p>
      </div>
      <PostList posts={posts} />
    </div>
  )
}
