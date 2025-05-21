import React from "react";
import { Link } from "gatsby";
import { withPrefix } from "gatsby";  // Add this import
import "../styles/global.css";

const Layout = ({ children }) => {
  const location = typeof window !== "undefined" ? window.location.pathname : "";
  const isHome = location === "/" || location === "/blog/" || location === "/blog";

  return (
    <>
      <div className="banner-hero">
        <Link to="/">
          <img
            src={withPrefix("img/async-banner.svg")}  // Use withPrefix
            alt="Async Stream Banner"
            className="site-banner"
          />
        </Link>
        <div className="banner-overlay">
          <div className="banner-header">
            <nav className="site-nav">
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="container">
        {children}
      </div>
      <footer className="site-footer">
        &copy; {new Date().getFullYear()} Async Stream. All rights reserved.
      </footer>
    </>
  );
};

export default Layout;
