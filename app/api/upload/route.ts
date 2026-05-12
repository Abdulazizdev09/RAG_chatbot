import { NextRequest, NextResponse } from "next/server"
import { getAstraCollection } from "@/lib/astra"
import { createEmbedding } from "@/lib/openai"
import { splitText } from "@/lib/splitter"

const COLLECTION_NAME = process.env.ASTRA_DB_COLLECTION || "f1gpt"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 })
        }

        // Read file content
        const fileContent = await file.text()

        if (!fileContent.trim()) {
            return NextResponse.json({ error: "File is empty" }, { status: 400 })
        }

        // Split text into chunks
        const chunks = await splitText(fileContent)

        if (chunks.length === 0) {
            return NextResponse.json({ error: "Failed to process file" }, { status: 400 })
        }

        // Get collection
        const collection = await getAstraCollection(COLLECTION_NAME)

        // Process each chunk
        let successCount = 0
        for (const chunk of chunks) {
            try {
                // Create embedding
                const embedding = await createEmbedding(chunk)

                // Store in database
                await collection.insertOne({
                    text: chunk,
                    $vector: embedding,
                    source: file.name,
                    uploadedAt: new Date().toISOString(),
                })

                successCount++
            } catch (error) {
                console.error("Error processing chunk:", error)
                continue
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully uploaded ${successCount} chunks from ${file.name}`,
            chunksProcessed: successCount,
        })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        )
    }
}
