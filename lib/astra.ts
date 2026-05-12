import { DataAPIClient } from "@datastax/astra-db-ts"

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
    namespace: process.env.ASTRA_DB_NAMESPACE,
})

/**
 * Retry logic with exponential backoff for Astra DB operations
 * Handles hibernation/resuming errors (503, 400)
 */
export async function retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    initialDelayMs: number = 1000
): Promise<T> {
    let lastError: any
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation()
        } catch (error: any) {
            lastError = error
            
            // Check if this is a hibernation/resuming error
            const isHibernationError = 
                error.status === 503 || 
                error.status === 400 ||
                error.statusCode === 503 ||
                error.statusCode === 400 ||
                (error.message && (
                    error.message.includes("Resuming") ||
                    error.message.includes("resuming") ||
                    error.message.includes("hibernation")
                ))
            
            if (!isHibernationError || attempt === maxAttempts) {
                throw error
            }
            
            // Calculate backoff: 1s, 2s, 4s
            const delayMs = initialDelayMs * Math.pow(2, attempt - 1)
            console.log(`Retry attempt ${attempt}/${maxAttempts} after ${delayMs}ms due to:`, error.message)
            
            await new Promise(resolve => setTimeout(resolve, delayMs))
        }
    }
    
    throw lastError
}

export async function getAstraCollection(collectionName: string) {
    try {
        return await db.collection(collectionName)
    } catch (error) {
        console.error("Failed to get Astra collection:", error)
        throw error
    }
}

export async function createAstraCollection(
    collectionName: string,
    dimension: number = 1536
) {
    try {
        return await db.createCollection(collectionName, {
            vector: {
                dimension,
                metric: "dot_product",
            },
        })
    } catch (error: any) {
        if (error.name === "CollectionAlreadyExistsError") {
            console.log(`Collection ${collectionName} already exists`)
        } else {
            throw error
        }
    }
}

export default db
