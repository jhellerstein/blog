import React from "react";
import { useLocation } from "@reach/router";
import { Link } from "gatsby";
import asyncStreamBanner from "../images/async-stream.png";
import "../styles/global.css";

const Layout = ({ children }) => {
  const location = typeof window !== "undefined" ? window.location.pathname : "";
  const isHome = location === "/" || location === "/blog/" || location === "/blog";

  return (
    <>
      <div className="banner-hero">
        <img
          src={asyncStreamBanner}
          alt="Async Stream Banner"
          className="site-banner"
        />
        <div className="banner-overlay">
          <div className="banner-header">
            <div className="site-title">
              <Link to="/">Async Stream</Link>
            </div>
            <nav className="site-nav">
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>
          {isHome && (
            <div className="banner-tagline">
              Occasional thoughts on coding, computing and data.
            </div>
          )}
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
