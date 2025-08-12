import { Pinecone } from '@pinecone-database/pinecone';
import { MistralAIEmbeddings } from "@langchain/mistralai"

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

const indexName = 'claro-kb';

// Check if index exists before attempting to create it
async function initializeIndex() {
  try {
    // First check if the index already exists
    const indexList = await pinecone.listIndexes();
    const indexExists = (indexList.indexes ?? []).some(idx => idx.name === indexName);
    
    // Only create the index if it doesn't already exist
    if (!indexExists) {
      console.log(`Creating new Pinecone index: ${indexName}`);
      await pinecone.createIndexForModel({
        name: indexName,
        cloud: 'aws',
        region: 'us-east-1',
        embed: {
          model: 'llama-text-embed-v2',
          fieldMap: { text: 'chunk_text' },
        },
        waitUntilReady: true,
      });
    } else {
      console.log(`Pinecone index ${indexName} already exists, using existing index`);
    }
    
    return pinecone.index(indexName);
  } catch (error) {
    console.error('Error initializing Pinecone index:', error);
    throw error;
  }
}

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY!

const embeddings = new MistralAIEmbeddings({
  apiKey: MISTRAL_API_KEY,
  model: "mistral-embed"
})

// Initialize index with error handling
let index: any;
let indexInitPromise: Promise<any>;

// Create a function that returns a promise for the initialized index
async function getIndex() {
  if (index) return index;
  
  if (!indexInitPromise) {
    indexInitPromise = initializeIndex()
      .then((initializedIndex) => {
        console.log(`Connected to Pinecone index: ${indexName}`);
        index = initializedIndex;
        return index;
      })
      .catch((error) => {
        console.error(`Failed to connect to Pinecone index: ${indexName}`, error);
        throw error;
      });
  }
  
  return indexInitPromise;
}

// Mistral embedding generation
export async function generateEmbedding(text: string): Promise<number[]> {
  return await embeddings.embedQuery(text)
}

// Define the DocumentChunk type if not already imported
export type DocumentChunk = {
  id: string;
  documentId: string;
  sectionTitle?: string;
  content: string;
  language?: string;
  embedding?: number[];
};

export async function upsertDocumentChunks(chunks: DocumentChunk[]) {
  try {
    // Get initialized index
    const pineconeIndex = await getIndex();
    
    const vectors = await Promise.all(
      chunks.map(async (chunk) => ({
        id: chunk.id,
        values: chunk.embedding || await generateEmbedding(chunk.content),
        metadata: {
          documentId: chunk.documentId,
          sectionTitle: chunk.sectionTitle,
          content: chunk.content,
          language: chunk.language,
        },
      }))
    )

    await pineconeIndex.upsert(vectors)
    console.log(`Successfully upserted ${vectors.length} vectors to Pinecone`)
  } catch (error) {
    console.error("Error upserting vectors to Pinecone:", error)
    throw error
  }
}

export async function deleteDocumentSections(documentId: string) {
  try {
    // Get initialized index
    const pineconeIndex = await getIndex();
    
    await pineconeIndex.deleteMany({
      filter: { documentId }
    })
    console.log(`Successfully deleted vectors with documentId: ${documentId}`)
  } catch (error) {
    console.error(`Error deleting vectors for document ${documentId}:`, error)
    throw error
  }
}

export async function searchSimilarChunks(
  query: string,
  language?: string,
  topK: number = 5
) {
  try {
    // Get initialized index
    const pineconeIndex = await getIndex();
    
    const queryEmbedding = await generateEmbedding(query)
    
    const searchResults = await pineconeIndex.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter: language ? { language } : undefined,
    })

    return searchResults.matches?.map((match: { 
      id: string; 
      score?: number; 
      metadata?: { 
        content?: string; 
        sectionTitle?: string; 
        documentId?: string; 
        language?: string; 
      }; 
    }) => ({
      id: match.id,
      score: match.score || 0,
      content: match.metadata?.content as string,
      sectionTitle: match.metadata?.sectionTitle as string,
      documentId: match.metadata?.documentId as string,
      language: match.metadata?.language as string,
    })) || []
  } catch (error) {
    console.error("Error searching similar chunks:", error)
    return [] // Return empty array on error
  }
}