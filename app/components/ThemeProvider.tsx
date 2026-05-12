"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"

type ThemeMode = "light" | "dark"

interface ThemeContextType {
    theme: ThemeMode
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error("useTheme must be used within ThemeProvider")
    }
    return context
}

interface ThemeProviderProps {
    children: ReactNode
}

/**
 * ThemeProvider handles dark/light mode state management
 * - Persists theme to localStorage
 * - Detects system preference on first load
 * - Applies theme to html[data-theme] attribute
 * - Provides useTheme hook for components
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeMode>("light")
    const [mounted, setMounted] = useState(false)

    // Initialize theme on client side only (prevent hydration mismatch)
    useEffect(() => {
        // Check localStorage first
        const savedTheme = localStorage.getItem("theme") as ThemeMode | null

        if (savedTheme) {
            setTheme(savedTheme)
            applyTheme(savedTheme)
        } else {
            // Check system preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
            const initialTheme: ThemeMode = prefersDark ? "dark" : "light"
            setTheme(initialTheme)
            applyTheme(initialTheme)
        }

        setMounted(true)
    }, [])

    const applyTheme = (newTheme: ThemeMode) => {
        const html = document.documentElement
        html.setAttribute("data-theme", newTheme)
        html.style.colorScheme = newTheme
        localStorage.setItem("theme", newTheme)
    }

    const toggleTheme = () => {
        setTheme((prevTheme) => {
            const newTheme: ThemeMode = prevTheme === "light" ? "dark" : "light"
            applyTheme(newTheme)
            return newTheme
        })
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export default ThemeProvider
