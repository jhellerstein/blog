import * as React from "react"
import Layout from "../components/layout"
import Seo from "../components/seo"

const ContactPage = () => {
  return (
    <Layout>
      <Seo title="Contact" />
      <div className="content">
        <h1>Contact</h1>
        <p>
          The best way to reach me is through email at lastname@berkeley.edu.
          You can also find me on <a href="https://github.com/jhellerstein">GitHub</a>.
        </p>
      </div>
    </Layout>
  )
}

export default ContactPage