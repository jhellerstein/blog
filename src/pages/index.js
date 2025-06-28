import * as React from "react"
import { graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import PostPreview from "../components/PostPreview"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMdx.nodes

  console.log(posts.map(p => p.frontmatter.date));
  console.log(posts.map(p => p.frontmatter.dateRaw));

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <Bio />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    )
  }

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="All posts" />
      <div className="home-grid">
        <main>
          <ol className="post-list" style={{ listStyle: `none` }}>
            {posts.map(post => (
              <PostPreview 
                key={post.fields.slug}
                post={post} 
              />
            ))}
          </ol>
        </main>
        <aside className="sidebar">
          <Bio />
        </aside>
      </div>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMdx(sort: [
    { frontmatter: { date: DESC } }
    { frontmatter: { order: DESC } }
    ]
  ) {
      nodes {
        excerpt(pruneLength: 50)
        fields {
          slug
          readingTime
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          dateRaw: date
          title
          description
          coverImage {
            childImageSharp {
              gatsbyImageData(
                width: 280
                height: 200
                transformOptions: {fit: COVER}
                placeholder: BLURRED
                formats: [AUTO, WEBP]
              )
            }
          }
        }
      }
    }
  }
`
