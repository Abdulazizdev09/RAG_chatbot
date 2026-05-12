import { getAstraCollection } from "@/lib/astra"
import { createEmbedding, generateChatResponse } from "@/lib/openai"
import { NextRequest, NextResponse } from "next/server"

const COLLECTION_NAME = process.env.ASTRA_DB_COLLECTION || "f1gpt"

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json()
        const latestMessage = messages[messages.length - 1]?.content

        if (!latestMessage) {
            return NextResponse.json({ error: "No message provided" }, { status: 400 })
        }

        // Get embedding for the latest message
        const embedding = await createEmbedding(latestMessage)

        // Search Astra DB for relevant context
        let docContext = ""
        try {
            const collection = await getAstraCollection(COLLECTION_NAME)
            const cursor = collection.find(null, {
                sort: {
                    $vector: embedding,
                },
                limit: 10,
            })
            const documents = await cursor.toArray()
            const docsMap = documents?.map((doc: any) => doc.text)
            docContext = JSON.stringify(docsMap)
        } catch (error) {
            console.log("Error querying database:", error)
            docContext = ""
        }

        // Build system prompt
        const systemPrompt = {
            role: "system" as const,
            content: `You are a concise Formula One expert assistant. Keep responses brief and focused (2-4 sentences max for simple questions, 1-2 paragraphs max for complex ones).
Be direct and avoid repetition, filler, and unnecessary details.
Use the context below to provide accurate, up-to-date information. If the context doesn't have what you need, use your knowledge without mentioning sources.
Format using markdown where helpful. Keep it natural and conversational.

CONTEXT:
${docContext}

QUESTION: ${latestMessage}`,
        }

        // Generate response with streaming
        const response = await generateChatResponse([systemPrompt, ...messages])

        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of response) {
                    const text = chunk.choices[0]?.delta?.content || ""
                    if (text) {
                        controller.enqueue(new TextEncoder().encode(text))
                    }
                }
                controller.close()
            },
        })

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        })
    } catch (error) {
        console.error("Chat API error:", error)
        return NextResponse.json(
            { error: "Failed to process chat request" },
            { status: 500 }
        )
    }
}