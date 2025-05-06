import * as React from "react"
import { Link, graphql } from "gatsby"
import Bio from "../components/bio"
import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <div className="home-grid">
          <aside className="sidebar">
            <Bio />
          </aside>
          <main className="post-list">
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
      <div className="home-grid">
        <aside className="sidebar">
          <Bio />
        </aside>
        <main className="post-list">
          <ol style={{ listStyle: `none` }}>
            {posts.map(post => {
              const title = post.frontmatter.title || post.fields.slug
              return (
                <li key={post.fields.slug}>
                  <article
                    className="post-list-item"
                    itemScope
                    itemType="http://schema.org/Article"
                  >
                    <header>
                      <h2>
                        <Link to={post.fields.slug} itemProp="url">
                          <span itemProp="headline">{title}</span>
                        </Link>
                      </h2>
                      <small>
                        {post.frontmatter.date}
                        {post.fields.readingTime && ` • ${post.fields.readingTime}`}
                      </small>
                    </header>
                    <section>
                      <p
                        dangerouslySetInnerHTML={{
                          __html: post.frontmatter.description || post.excerpt,
                        }}
                        itemProp="description"
                      />
                    </section>
                  </article>
                </li>
              )
            })}
          </ol>
        </main>
      </div>
    </Layout>
  )
}

export default BlogIndex

export const Head = () => <Seo title="All posts" />

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      nodes {
        excerpt
        fields {
          slug
          readingTime
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
        }
      }
    }
  }
    `