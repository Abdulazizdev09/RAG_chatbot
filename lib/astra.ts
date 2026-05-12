import { DataAPIClient } from "@datastax/astra-db-ts"

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
    namespace: process.env.ASTRA_DB_NAMESPACE,
})

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
