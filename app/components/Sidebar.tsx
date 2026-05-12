"use client"

import React from "react"
import { useTheme } from "./ThemeProvider"

interface SidebarProps {
    onNewChat: () => void
    onSelectHistory: (id: string) => void
    onThemeToggle: () => void
    onUploadClick: () => void
    chatHistory: Array<{ id: string; title: string }>
    activeChat: string | null
}

const Sidebar: React.FC<SidebarProps> = ({
    onNewChat,
    onSelectHistory,
    onThemeToggle,
    onUploadClick,
    chatHistory,
    activeChat,
}) => {
    const { theme, toggleTheme } = useTheme()

    const handleThemeToggle = () => {
        toggleTheme()
        onThemeToggle()
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <span className="sidebar-logo">F1GPT</span>
                <button className="new-chat-button" onClick={onNewChat} title="New chat">
                    ➕
                </button>
            </div>

            <div className="chat-history">
                {chatHistory.length > 0 ? (
                    chatHistory.map((item) => (
                        <button
                            key={item.id}
                            className={`history-item ${activeChat === item.id ? "active" : ""}`}
                            onClick={() => onSelectHistory(item.id)}
                            title={item.title}
                        >
                            {item.title}
                        </button>
                    ))
                ) : (
                    <p style={{ fontSize: "12px", color: "var(--text-tertiary)", margin: "8px 0" }}>
                        No history
                    </p>
                )}
            </div>

            <div className="sidebar-footer">
                <button 
                    className="theme-toggle-button" 
                    onClick={handleThemeToggle} 
                    title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                >
                    <span className="theme-toggle-icon">
                        {theme === "light" ? "🌙" : "☀️"}
                    </span>
                </button>
                <button className="upload-button" onClick={onUploadClick} title="Upload FAQ">
                    📤 Upload FAQ
                </button>
            </div>
        </aside>
    )
}

export default Sidebar

