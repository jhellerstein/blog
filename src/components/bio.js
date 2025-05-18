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
    <div className="profile">
      <StaticImage
        className="profile-img"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/profile-pic.jpg"
        width={80}
        height={80}
        quality={95}
        alt={author.name}
      />
      <h2>{author.name}</h2>
      <p>{author.summary}</p>
      <p>{description}</p>
      <div className="social-links">
        <a href={`https://github.com/${social.github}`} title="GitHub">
          <FaGithub />
        </a>
        <a href={`https://linkedin.com/in/${social.linkedin}`} title="LinkedIn">
          <FaLinkedin />
        </a>
        <a href={`https://${social.bluesky}`} title="Bluesky">
          <FaCloud />
        </a>
      </div>
    </div>
  )
}

export default Bio
