// custom typefaces
import "@fontsource-variable/montserrat"
import "@fontsource/merriweather"
// normalize CSS across browsers
import "./src/normalize.css"
// custom CSS styles
import "./src/style.css"
import "./src/styles/global.css"

// Highlighting for code blocks
import "prismjs/themes/prism.css"

// KaTeX for math typesetting
import "katex/dist/katex.min.css"

// MDX Provider for global components
import React from "react"
import { MDXProvider } from "@mdx-js/react"
import Callout from "./src/components/Callout"

const components = {
  Callout,
}

export const wrapRootElement = ({ element }) => (
  <MDXProvider components={components}>{element}</MDXProvider>
)
