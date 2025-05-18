import React from "react"
import "../styles/global.css"

const Layout = ({ children, hero }) => (
  <>
    <header className="site-header">
      <div className="site-title">Async Stream</div>
      <nav className="site-nav">
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
    </header>
    {/* HERO OUTSIDE THE CONTAINER */}
    {hero}
    <div className="container">
      {children}
    </div>
    <footer className="site-footer">
      &copy; {new Date().getFullYear()} Async Stream. All rights reserved.
    </footer>
  </>
)

export default Layout
