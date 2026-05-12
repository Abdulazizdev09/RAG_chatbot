import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100,
})

export async function splitText(text: string): Promise<string[]> {
    return splitter.splitText(text)
}

export default splitter
