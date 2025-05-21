import * as React from "react"
import Layout from "../components/layout"
import Seo from "../components/seo"

const AboutPage = () => {
  return (
    <Layout>
      <Seo title="About" />
      <div className="content">
        <h1>About</h1>
        <p>
          I work as a computer scientist at UC Berkeley. I
          focus on data-centric systems and their central role in computing.
          I came up as a database systems researcher, but 
          in recent years I've been particularly focused on the design of 
          programming languages for distributed systems (e.g <a href="https://hydro.run">Hydro</a>),
          which can benefit enormously from a data-centric lens.
        </p>
        <p>
            I like to ground my work in real-world efforts, including startups I've helped lead
            like <a href="https://runllm.com">RunLLM</a>, <a href="https://en.wikipedia.org/wiki/Trifacta">Trifacta</a>,
            and <a href="https://en.wikipedia.org/wiki/Greenplum">Greenplum</a>, 
            as well as established companies I've worked with over the years.
        </p>
        <p>
            I'm also a lifelong student of the trumpet. To quote Dizzy Gillespie, 
            <blockquote>Some days you get up and put the horn to your chops and it sounds pretty good and you win. 
            Some days you try and nothing works and the horn wins. This goes on and on and then you die and the horn wins.
            </blockquote>
            Humility and a lack of control, baked into a daily practice. Highly recommended!
        </p>
      </div>
    </Layout>
  )
}

export default AboutPage