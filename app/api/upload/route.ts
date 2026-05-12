import { NextRequest, NextResponse } from "next/server"
import { getAstraCollection, retryWithBackoff } from "@/lib/astra"
import { createEmbedding } from "@/lib/openai"
import { splitText } from "@/lib/splitter"

const COLLECTION_NAME = process.env.ASTRA_DB_COLLECTION || "f1gpt"

/**
 * Checks if error is due to Astra DB hibernation/resuming
 */
function isHibernationError(error: any): boolean {
    return (
        error.status === 503 ||
        error.status === 400 ||
        error.statusCode === 503 ||
        error.statusCode === 400 ||
        (error.message && (
            error.message.includes("Resuming") ||
            error.message.includes("resuming") ||
            error.message.includes("hibernation")
        ))
    )
}

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

        // Get collection with retry for hibernation
        let collection
        try {
            collection = await retryWithBackoff(
                () => getAstraCollection(COLLECTION_NAME),
                3,
                1000
            )
        } catch (error: any) {
            console.error("Failed to get collection after retries:", error)
            
            if (isHibernationError(error)) {
                return NextResponse.json(
                    {
                        error: "Database is waking up. Please try again in a moment.",
                        hibernating: true,
                        retryAfter: 5,
                    },
                    { status: 503 }
                )
            }
            
            return NextResponse.json(
                { error: "Failed to connect to database" },
                { status: 500 }
            )
        }

        // Process each chunk with retry
        let successCount = 0
        let failedCount = 0
        const failedChunks: string[] = []

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i]
            try {
                // Create embedding
                const embedding = await createEmbedding(chunk)

                // Store in database with retry for hibernation
                await retryWithBackoff(
                    () =>
                        collection.insertOne({
                            text: chunk,
                            $vector: embedding,
                            source: file.name,
                            uploadedAt: new Date().toISOString(),
                            chunkIndex: i,
                            totalChunks: chunks.length,
                        }),
                    3,
                    1000
                )

                successCount++
            } catch (error: any) {
                console.error(`Error processing chunk ${i}:`, error)
                failedCount++
                failedChunks.push(`Chunk ${i}`)

                // If this is a hibernation error, inform the user
                if (isHibernationError(error)) {
                    return NextResponse.json(
                        {
                            error: "Database is waking up. Please try again in a moment.",
                            hibernating: true,
                            retryAfter: 5,
                            processedSoFar: successCount,
                            totalChunks: chunks.length,
                        },
                        { status: 503 }
                    )
                }

                // Continue with other chunks for non-critical errors
                continue
            }
        }

        // If some chunks succeeded, return partial success
        if (successCount > 0) {
            return NextResponse.json({
                success: true,
                message: `Successfully uploaded ${successCount} chunks from ${file.name}`,
                chunksProcessed: successCount,
                totalChunks: chunks.length,
                failedChunks: failedChunks.length > 0 ? failedChunks : undefined,
                uploadedAt: new Date().toISOString(),
            })
        } else {
            // All chunks failed
            return NextResponse.json(
                {
                    error: "Failed to upload file - no chunks were processed successfully",
                    totalChunks: chunks.length,
                },
                { status: 500 }
            )
        }
    } catch (error: any) {
        console.error("Upload error:", error)

        // Check for hibernation error
        if (isHibernationError(error)) {
            return NextResponse.json(
                {
                    error: "Database is waking up. Please try again in a moment.",
                    hibernating: true,
                    retryAfter: 5,
                },
                { status: 503 }
            )
        }

        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        )
    }
}
