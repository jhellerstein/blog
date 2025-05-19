import * as React from "react"
import { Link, graphql } from "gatsby"
import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"
import PostPreview from "../components/PostPreview"
import Hero from "../components/hero"
import asyncStreamBanner from "../images/async-stream.png"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <Seo title="All posts" />
        <div className="home-grid">
          <aside className="sidebar">
            <Bio />
          </aside>
          <main>
            <p>
              No blog posts found. Add markdown posts to "content/blog" (or the
              directory you specified for the "gatsby-source-filesystem" plugin in
              gatsby-config.js).
            </p>
          </main>
        </div>
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
              <PostPreview key={post.id} post={post} />
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
