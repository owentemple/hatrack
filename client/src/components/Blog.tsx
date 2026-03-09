import { Link } from 'react-router-dom'
import { blogPosts } from '../lib/blogPosts'

export default function Blog() {
  return (
    <div className="blog-page">
      <h2>Blog</h2>
      <div className="blog-list">
        {blogPosts.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-card">
            <h3>{post.title}</h3>
            <p className="blog-card-subtitle">{post.subtitle}</p>
            <span className="blog-card-date">{new Date(post.date + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
