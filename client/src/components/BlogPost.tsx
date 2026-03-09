import { useParams, Link } from 'react-router-dom'
import { getPostBySlug } from '../lib/blogPosts'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPostBySlug(slug) : undefined

  if (!post) {
    return (
      <div className="blog-page">
        <p>Post not found.</p>
        <Link to="/blog">&larr; Back to Blog</Link>
      </div>
    )
  }

  return (
    <div className="blog-page">
      <Link to="/blog" className="back-link">&larr; Back to Blog</Link>
      <article className="blog-article">
        <h2>{post.title}</h2>
        <p className="blog-subtitle">{post.subtitle}</p>
        <p className="blog-date">{new Date(post.date + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.body }} />
      </article>
    </div>
  )
}
