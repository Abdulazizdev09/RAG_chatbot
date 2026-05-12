export interface Message {
    id: string
    content: string
    role: "user" | "assistant"
}

export interface Conversation {
    id: string
    title: string
    messages: Message[]
}

export interface UploadResponse {
    success: boolean
    message: string
    chunksProcessed: number
}

export interface VectorSearchResult {
    text: string
    source: string
    score: number
}
