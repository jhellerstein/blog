import * as React from "react"
import { graphql } from "gatsby"  // Remove unused Link import
import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import PostPreview from "../components/PostPreview"
// Remove unused Hero and asyncStreamBanner imports

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="All posts" />
      <div className="home-grid">
        <main>
          <ol className="post-list" style={{ listStyle: `none` }}>
            {posts.map(post => (
              <PostPreview 
                key={post.fields.slug}  // Add key prop here
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
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        excerpt(pruneLength: 50)
        fields {
          slug
          readingTime
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
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
