import React, { useState, useEffect } from "react"

const ThemeToggle = () => {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "light"
    setTheme(storedTheme)
    document.documentElement.setAttribute("data-theme", storedTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  return (
    <label className="theme-switch">
      <input
        type="checkbox"
        onChange={toggleTheme}
        checked={theme === "dark"}
        aria-label="Toggle theme"
      />
      <span className="slider">
        <span className="icon sun">☀️</span>
        <span className="icon moon">🌙</span>
      </span>
    </label>
  )
}

export default ThemeToggle
