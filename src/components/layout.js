import * as React from "react"
import { Link } from "gatsby"
import ThemeToggle from "./ThemeToggle"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath

  const header = (
    <header className="global-header">
      <h1 className="site-title">
        <Link to="/">{title}</Link>
      </h1>
      <div className="theme-toggle-container">
        <ThemeToggle />
      </div>
    </header>
  )

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      {header}
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Built with{" "}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
