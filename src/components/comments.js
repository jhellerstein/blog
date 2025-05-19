import * as React from "react"
import Giscus from "@giscus/react"

const Comments = () => {
  return (
    <div className="comments-wrapper">
      <Giscus
        repo="jhellerstein/blog"
        repoId="R_kgDOLRMqmw"
        category="Comments"
        categoryId="DIC_kwDOLRMqm84CdYYr"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="light"
        lang="en"
      />
    </div>
  )
}

export default Comments