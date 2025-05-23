import * as React from "react"
import Giscus from "@giscus/react"

const Comments = () => {
  return (
    <div className="comments-wrapper">
      <Giscus
        repo="jhellerstein/blog"
        repoId="R_kgDOOlLShQ"
        category="Comments"
        categoryId="DIC_kwDOOlLShc4CqUp7"
        mapping="pathname"
        term="Welcome to the async stream blog."
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="light"
        lang="en"
        loading="lazy"
        crossOrigin="anonymous"
        async
      />
    </div>
  )
}

export default Comments