import * as React from "react"
import { Link, graphql } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import Comments from "../components/comments"

const BlogPostTemplate = ({ data, location, children }) => {
  const post = data.mdx
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const image = getImage(post.frontmatter.coverImage)
  const caption = post.frontmatter.coverImageCaption

  return (
    <Layout location={location} title={siteTitle}>
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 className="blog-post-title" itemProp="headline">{post.frontmatter.title}</h1>
          <p>
            {post.frontmatter.date}
            {` • `}
            {post.fields.readingTime}
          </p>
          {image && (
            <div style={{
              width: "30%",
              float: "right",
              marginLeft: "2rem",
              marginBottom: "2rem",
              background: "#fafaff",
              border: "1px solid #eee",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              padding: "1rem",
            }}>
              <GatsbyImage
                image={image}
                alt={post.frontmatter.title}
                style={{
                  width: "100%",
                  borderRadius: "4px",
                  marginBottom: caption ? "0.5rem" : "0",
                }}
              />
              {caption && caption.trim() && (
                <figcaption
                  className="cover-image-caption"
                  style={{
                    textAlign: "left",
                    color: "#666",
                    fontSize: "0.85rem",
                    lineHeight: "1.4",
                    margin: "0",
                  }}
                  dangerouslySetInnerHTML={{ __html: caption }}
                />
              )}
            </div>
          )}
        </header>

        <section className="content" itemProp="articleBody">
          {children}
        </section>
        <hr />
        <footer>
          <Bio />
          <Comments />
        </footer>
      </article>
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {data.previous && (
              <Link to={data.previous.fields.slug} rel="prev">
                ← {data.previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {data.next && (
              <Link to={data.next.fields.slug} rel="next">
                {data.next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export const Head = ({ data }) => (
  <Seo
    title={data.mdx.frontmatter.title}
    description={data.mdx.frontmatter.description || data.mdx.excerpt}
  />
)

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
      }
    }
    mdx(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        coverImage {
          childImageSharp {
            gatsbyImageData(width: 800, layout: CONSTRAINED)
          }
        }
        coverImageCaption
      }
      fields {
        readingTime
      }
    }
    previous: mdx(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: mdx(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
