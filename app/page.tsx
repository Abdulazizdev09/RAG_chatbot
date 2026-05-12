"use client"
import Image from "next/image"
import f1GPTLogo from "./assets/f1_image.webp"
import Bubble from "./components/Bubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"
import LoadingBubble from "./components/LoadingBubble"
import Sidebar from "./components/Sidebar"
import UploadModal from "./components/UploadModal"
import { useEffect, useRef, useState } from "react"

interface Message {
    id: string
    content: string
    role: "user" | "assistant"
}

interface Conversation {
    id: string
    title: string
    messages: Message[]
}

const Home = () => {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [uploadLoading, setUploadLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Load conversations from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("f1gpt_conversations")
        if (saved) {
            const parsed = JSON.parse(saved)
            setConversations(parsed)
            if (parsed.length > 0) {
                setActiveConversationId(parsed[0].id)
            }
        }
    }, [])

    // Save conversations to localStorage
    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem("f1gpt_conversations", JSON.stringify(conversations))
        }
    }, [conversations])

    const activeConversation = conversations.find((c) => c.id === activeConversationId)
    const messages = activeConversation?.messages || []
    const noMessages = !messages || messages.length === 0

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleNewChat = () => {
        const newConv: Conversation = {
            id: crypto.randomUUID(),
            title: "New Conversation",
            messages: [],
        }
        setConversations((prev) => [newConv, ...prev])
        setActiveConversationId(newConv.id)
    }

    const handleSelectHistory = (id: string) => {
        setActiveConversationId(id)
    }

    const updateConversation = (id: string, messages: Message[]) => {
        setConversations((prev) =>
            prev.map((conv) =>
                conv.id === id
                    ? {
                          ...conv,
                          messages,
                          title:
                              messages.length > 0
                                  ? messages[0].content.substring(0, 30) + "..."
                                  : conv.title,
                      }
                    : conv
            )
        )
    }

    const handlePrompt = (promptText: string) => {
        submitMessage(promptText)
    }

    const submitMessage = async (text: string) => {
        if (!text.trim() || !activeConversationId) return

        const userMessage: Message = {
            id: crypto.randomUUID(),
            content: text,
            role: "user",
        }

        const newMessages = [...messages, userMessage]
        updateConversation(activeConversationId, newMessages)
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: newMessages,
                }),
            })

            if (!response.body) {
                setIsLoading(false)
                return
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let assistantMessage = ""

            const assistantMsg: Message = {
                id: crypto.randomUUID(),
                content: "",
                role: "assistant",
            }

            const messagesWithAssistant = [...newMessages, assistantMsg]

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                assistantMessage += chunk

                updateConversation(
                    activeConversationId,
                    messagesWithAssistant.map((msg) =>
                        msg.id === assistantMsg.id ? { ...msg, content: assistantMessage } : msg
                    )
                )
            }

            setIsLoading(false)
        } catch (error) {
            console.error("Error:", error)
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        submitMessage(input)
    }

    const handleThemeToggle = () => {
        // Note: In production, you'd use a proper theme context/provider
        // For now, we rely on system preference (prefers-color-scheme CSS media query)
        // Users can set their OS theme preference
        alert("Theme follows your system preference. Change it in your OS settings.")
    }

    const handleUpload = async (file: File) => {
        setUploadLoading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (response.ok) {
                setIsUploadModalOpen(false)
                // Show a brief notification (in a real app, use a toast library)
                alert("FAQ uploaded successfully!")
            } else {
                alert("Upload failed. Please try again.")
            }
        } catch (error) {
            console.error("Upload error:", error)
            alert("Upload error. Please try again.")
        } finally {
            setUploadLoading(false)
        }
    }

    const chatHistory = conversations.map((conv) => ({
        id: conv.id,
        title: conv.title || "New Conversation",
    }))

    return (
        <main>
            <Sidebar
                onNewChat={handleNewChat}
                onSelectHistory={handleSelectHistory}
                onThemeToggle={handleThemeToggle}
                onUploadClick={() => setIsUploadModalOpen(true)}
                chatHistory={chatHistory}
                activeChat={activeConversationId}
            />

            <div className="chat-container">
                <div className="chat-header">
                    <div className="logo-section">
                        <Image src={f1GPTLogo} width={40} height={40} alt="f1GPT Logo" />
                        <span className="header-title">Formula 1 Q&A</span>
                    </div>
                </div>

                <section className="messages-section">
                    {noMessages ? (
                        <div className="empty-state">
                            <Image src={f1GPTLogo} width={80} height={80} alt="f1GPT Logo" />
                            <h2 className="empty-state-title">Ask anything about F1</h2>
                            <p className="empty-state-subtitle">
                                Get instant answers about drivers, teams, races, and more
                            </p>
                            <PromptSuggestionsRow onPromptClick={handlePrompt} />
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <Bubble key={message.id} message={message} />
                            ))}
                            {isLoading && <LoadingBubble />}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </section>

                <form onSubmit={handleSubmit} className="chat-form">
                    <input
                        className="question-box"
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        placeholder="Ask me something..."
                        disabled={isLoading}
                    />
                    <input
                        type="submit"
                        value="Send"
                        className="submit-button"
                        disabled={isLoading || !input.trim()}
                    />
                </form>
            </div>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
                isLoading={uploadLoading}
            />
        </main>
    )
}

export default Home