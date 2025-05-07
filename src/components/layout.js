import React from "react"
import { Link } from "gatsby"
import ThemeToggle from "./ThemeToggle"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath

  const header = (
    <div className="banner">
      {isRootPath ? (
        <h1 className="site-title main-heading">
          <Link to="/">{title}</Link>
        </h1>
      ) : (
        <Link className="site-title header-link-home" to="/">
          {title}
        </Link>
      )}
      <ThemeToggle />
    </div>
  )

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{header}</header>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Built with <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
