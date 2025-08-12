import { supabase } from "./supabase"
import { upsertDocumentChunks } from "./vector-db"
import { detectLanguage } from "./language-utils"

export async function processUploadedFile(file: File) {
  try {
    const content = await file.text()
    const language = detectLanguage(content)

    // Save to database
    const { data, error } = await supabase
      .from("kb_documents")
      .insert({
        title: file.name,
        content,
        language,
        file_path: `uploads/${file.name}`,
        version: "1.0",
      })
      .select()
      .single()

    if (error) throw error

    // Process and chunk content for vector DB
    const chunks = chunkContent(content, data.id, file.name, language)
    await upsertDocumentChunks(chunks)

    return {
      success: true,
      document: data,
      chunksProcessed: chunks.length,
    }
  } catch (error) {
    console.error("Error processing file:", error)
    throw error
  }
}

export async function getKBStatus() {
  try {
    const { data, error } = await supabase
      .from("kb_documents")
      .select("id, title, language, created_at, updated_at")
      .order("updated_at", { ascending: false })

    if (error) throw error

    const stats = {
      totalDocuments: data?.length || 0,
      languages: Array.from(new Set(data?.map((doc: { language: string }) => doc.language) || [])),
      lastUpdated: data?.[0]?.updated_at || null,
    }

    return {
      documents: data || [],
      stats,
    }
  } catch (error) {
    console.error("Error getting KB status:", error)
    throw error
  }
}

function chunkContent(content: string, docId: string, title: string, language: string) {
  const chunks: Array<{
    id: string
    documentId: string
    sectionTitle: string
    content: string
    language: string
    metadata: {
      title: string
      file_path: string
    }
  }> = []
  const sections = content.split(/\n#{1,3}\s+/)

  sections.forEach((section, index) => {
      chunks.push({
        id: `${docId}-chunk-${index}`,
        documentId: docId,
        sectionTitle: `Section ${index + 1}`,
        content: section.trim(),
        language,
        metadata: {
          title,
          file_path: `uploads/${title}`,
        },
      })
  })
  return chunks;
}
