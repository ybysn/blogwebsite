import { getAllPosts } from '@/lib/posts'
import { HomeContent } from '@/app/home-content'

export default function Home() {
  const posts = getAllPosts()

  return <HomeContent posts={posts} />
}
