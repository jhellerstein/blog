import React from "react"
import asyncStreamBanner from "../images/async-banner.svg"

const TestBanner = () => {
  console.log("Banner path:", asyncStreamBanner)
  return (
    <img 
      src={asyncStreamBanner} 
      alt="Test Banner" 
      style={{width: '100%', height: 'auto'}}
    />
  )
}

export default TestBanner