import React from "react"
import { useStaticQuery, graphql } from "gatsby"

const Hero = () => {
  const data = useStaticQuery(graphql`
    query HeroQuery {
      site {
        siteMetadata {
          hero {
            title
            tagline
            # callToAction
          }
        }
      }
    }
  `)

  const { hero } = data.site.siteMetadata

  return (
    <section className="hero">
      <h1>{hero.title}</h1>
      <p className="hero-tagline">{hero.tagline}</p>
      {/* <a href="#latest-posts" className="hero-cta">{hero.callToAction}</a> */}
    </section>
  )
}

export default Hero