import React from "react"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import { Link } from "gatsby"

const PostPreview = ({ post }) => {
  const image = getImage(post.frontmatter.coverImage)
  return (
    <li className="post-preview">
      <Link to={post.fields.slug} className="post-preview-link">
        <div className="post-preview-image-wrapper">
          {image && (
            <GatsbyImage
              image={image}
              alt={post.frontmatter.title}
              className="post-preview-image"
              style={{ aspectRatio: "1 / 1" }}
              imgStyle={{ objectFit: "cover", aspectRatio: "1 / 1" }}
            />
          )}
          <div className="post-preview-gradient-border"></div>
          <div className="post-preview-overlay">
            <div className="post-meta">
              <span>{post.frontmatter.date}</span>
              <span>•</span>
              <span>{post.fields.readingTime}</span>
            </div>
            <h2>{post.frontmatter.title}</h2>
            <p>{post.frontmatter.description || post.excerpt}</p>
          </div>
        </div>
      </Link>
    </li>
  )
}

export default PostPreview