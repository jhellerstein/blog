import React from "react"

const Callout = ({ type = "info", children }) => {
  const emoji = {
    info: "ℹ️",
    warning: "⚠️", 
    danger: "☣️",
    success: "✅"
  }
  
  const className = `callout callout-${type}`
  
  return (
    <div className={className}>
      <span className="callout-emoji">{emoji[type]}</span>
      <div className="callout-content">
        {children}
      </div>
    </div>
  )
}

export default Callout