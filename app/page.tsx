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

interface UploadedFile {
    id: string
    name: string
    uploadedAt: string
    status: "success" | "failed" | "partial" | "canceled"
    chunksProcessed?: number
    totalChunks?: number
}

type UploadStatus = "idle" | "uploading" | "processing" | "saving" | "completed" | "failed" | "canceled"

const Home = () => {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
    const [uploadStatusText, setUploadStatusText] = useState("")
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const uploadAbortControllerRef = useRef<AbortController | null>(null)

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

    // Load uploaded files from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("f1gpt_uploaded_files")
        if (saved) {
            try {
                setUploadedFiles(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to load uploaded files:", e)
            }
        }
    }, [])

    // Save conversations to localStorage
    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem("f1gpt_conversations", JSON.stringify(conversations))
        }
    }, [conversations])

    // Save uploaded files to localStorage
    useEffect(() => {
        if (uploadedFiles.length > 0) {
            localStorage.setItem("f1gpt_uploaded_files", JSON.stringify(uploadedFiles))
        }
    }, [uploadedFiles])

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
        alert("Theme follows your system preference. Change it in your OS settings.")
    }

    const handleUploadCancel = () => {
        if (uploadAbortControllerRef.current) {
            uploadAbortControllerRef.current.abort()
            uploadAbortControllerRef.current = null
            setUploadStatus("canceled")
            setUploadStatusText("Upload canceled")
            // Keep modal open briefly to show canceled state
            setTimeout(() => {
                setIsUploadModalOpen(false)
                setUploadStatus("idle")
                setUploadStatusText("")
            }, 1500)
        }
    }

    const handleUpload = async (file: File) => {
        // Create abort controller for this upload
        uploadAbortControllerRef.current = new AbortController()
        const signal = uploadAbortControllerRef.current.signal

        setUploadStatus("uploading")
        setUploadStatusText("uploading")

        try {
            const formData = new FormData()
            formData.append("file", file)

            setUploadStatusText("processing")

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                signal, // Pass abort signal
            })

            // Check if request was aborted
            if (signal.aborted) {
                setUploadStatus("canceled")
                setUploadStatusText("canceled")
                return
            }

            const data = await response.json()

            if (response.ok) {
                setUploadStatus("completed")
                setUploadStatusText("completed")

                // Add to file history
                const uploadedFile: UploadedFile = {
                    id: crypto.randomUUID(),
                    name: file.name,
                    uploadedAt: new Date().toISOString(),
                    status: data.failedChunks && data.failedChunks.length > 0 ? "partial" : "success",
                    chunksProcessed: data.chunksProcessed,
                    totalChunks: data.totalChunks,
                }
                setUploadedFiles((prev) => [uploadedFile, ...prev])

                // Close modal after a short delay
                setTimeout(() => {
                    setIsUploadModalOpen(false)
                    setUploadStatus("idle")
                    setUploadStatusText("")
                }, 1500)
            } else {
                // Check for hibernation error
                if (data.hibernating) {
                    setUploadStatus("failed")
                    setUploadStatusText(data.error || "Database is waking up. Please try again.")
                } else {
                    setUploadStatus("failed")
                    setUploadStatusText(data.error || "Upload failed. Please try again.")
                }

                // Keep modal open for user to retry or cancel
            }
        } catch (error: any) {
            // Check if abort error
            if (error.name === "AbortError") {
                setUploadStatus("canceled")
                setUploadStatusText("canceled")
            } else {
                console.error("Upload error:", error)
                setUploadStatus("failed")
                setUploadStatusText("Network error. Please try again.")
            }
        } finally {
            uploadAbortControllerRef.current = null
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
                onClose={() => {
                    // Allow closing even during upload
                    if (uploadStatus === "canceled" || uploadStatus === "idle" || uploadStatus === "completed" || uploadStatus === "failed") {
                        setIsUploadModalOpen(false)
                        setUploadStatus("idle")
                        setUploadStatusText("")
                    } else {
                        // Just close - the abort will be handled by cancel button
                        setIsUploadModalOpen(false)
                    }
                }}
                onUpload={handleUpload}
                onCancel={handleUploadCancel}
                uploadStatus={uploadStatus}
                uploadStatusText={uploadStatusText}
                uploadedFiles={uploadedFiles}
            />
        </main>
    )
}

export default Home