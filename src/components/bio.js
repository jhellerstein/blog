/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import { FaGithub, FaLinkedin, FaCloud } from "react-icons/fa"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          description
          social {
            github
            linkedin
            bluesky
          }
        }
      }
    }
  `)

  const { author, description, social } = data.site.siteMetadata

  return (
    <div className="bio">
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile-pic.jpg"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />
      {author?.name && (
        <p>
          <strong>{author.name}</strong>
          <br />
          <em>{author?.summary}</em>
          {description && (
            <>
              <br />
              <em>{description}</em>
            </>
          )}
          <br />
          <a href={`https://github.com/${social.github}`} title="GitHub" style={{ marginRight: '0.5rem' }}>
            <FaGithub />
          </a>
          <a href={`https://linkedin.com/in/${social.linkedin}`} title="LinkedIn" style={{ marginRight: '0.5rem' }}>
            <FaLinkedin />
          </a>
          <a href={`https://${social.bluesky}`} title="Bluesky">
            <FaCloud />
          </a>
        </p>
      )}
    </div>
  )
}

export default Bio
