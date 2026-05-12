import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_API_KEY,
})

export async function createEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
    })
    return response.data[0].embedding
}

export async function generateChatResponse(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
) {
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        stream: true,
        messages,
    })
    return response
}

export default openai
