import { type DocumentChunk, upsertDocumentChunks, deleteDocumentSections } from "./vector-db"
import { supabaseAdmin } from "./supabase"

export interface ProcessedSection {
  id: string
  title: string
  content: string
  language: "en" | "hi"
}

export function chunkDocument(content: string, source: string): DocumentChunk[] {
  // Split document into sections based on headers
  const sections = content.split(/(?=^#{1,3}\s)/m).filter((section) => section.trim())

  const chunks: DocumentChunk[] = []

  sections.forEach((section, index) => {
    const lines = section.split("\n")
    const title = lines[0]?.replace(/^#+\s*/, "") || `Section ${index + 1}`
    const sectionContent = lines.slice(1).join("\n").trim()

    if (sectionContent.length > 0) {
      // Detect language
      const hindiPattern = /[\u0900-\u097F]/
      const language = hindiPattern.test(sectionContent) ? "hi" : "en"

      // Split large sections into smaller chunks
      const maxChunkSize = 1000
      if (sectionContent.length <= maxChunkSize) {
        chunks.push({
          id: `${source}-${title.toLowerCase().replace(/\s+/g, "-")}`,
          documentId: source,
          sectionTitle: title,
          content: sectionContent,
          language,
        })
      } else {
        // Split large sections into smaller chunks
        const sentences = sectionContent.split(/[.!?]+/)
        let currentChunk = ""
        let chunkIndex = 0

        sentences.forEach((sentence) => {
          if (currentChunk.length + sentence.length > maxChunkSize) {
            if (currentChunk.trim()) {
              chunks.push({
                id: `${source}-${title.toLowerCase().replace(/\s+/g, "-")}-${chunkIndex}`,
                documentId: source,
                sectionTitle: `${title} (Part ${chunkIndex + 1})`,
                content: currentChunk.trim(),
                language,
              })
              chunkIndex++
            }
            currentChunk = sentence
          } else {
            currentChunk += sentence
          }
        })

        if (currentChunk.trim()) {
          chunks.push({
            id: `${source}-${title.toLowerCase().replace(/\s+/g, "-")}-${chunkIndex}`,
            documentId: source,
            sectionTitle: `${title} (Part ${chunkIndex + 1})`,
            content: currentChunk.trim(),
            language,
          })
        }
      }
    }
  })

  return chunks
}

export async function processAndStoreDocument(content: string, filename: string, replaceExisting = false) {
  const source = filename.replace(/\.[^/.]+$/, "") // Remove file extension

  // If replacing existing, delete old chunks
  if (replaceExisting) {
    const { data: existingDoc } = await supabaseAdmin
      .from("documents")
      .select("sections")
      .eq("filename", filename)
      .single()

    if (existingDoc?.sections) {
      await deleteDocumentSections(source)
    }
  }

  // Process document into chunks
  const chunks = chunkDocument(content, source)

  // Store in vector database (uses Gemini for embeddings)
  await upsertDocumentChunks(chunks)

  // Update document metadata
  const sections = chunks.map((chunk) => chunk.sectionTitle)
  await supabaseAdmin.from("documents").upsert({
    filename,
    source,
    sections,
    total_chunks: chunks.length,
    languages: Array.from(new Set(chunks.map((chunk) => chunk.language))),
    updated_at: new Date().toISOString(),
  })

  return {
    chunksCreated: chunks.length,
    sections: sections.length,
    languages: Array.from(new Set(chunks.map((chunk) => chunk.language))),
  }
}

export async function updateDocumentSection(filename: string, sectionTitle: string, newContent: string) {
  const source = filename.replace(/\.[^/.]+$/, "")
  const sectionId = `${source}-${sectionTitle.toLowerCase().replace(/\s+/g, "-")}`

  // Delete old section
  await deleteDocumentSections(sectionTitle)

  // Create new chunk for updated section
  const hindiPattern = /[\u0900-\u097F]/
  const language = hindiPattern.test(newContent) ? "hi" : "en"

  const chunk: DocumentChunk = {
    id: sectionId,
    documentId: source,
    sectionTitle: sectionTitle,
    content: newContent,
    language,
  }

  // Store updated chunk
  await upsertDocumentChunks([chunk])

  // Update document metadata
  await supabaseAdmin.from("Document").update({ updatedAt: new Date().toISOString() }).eq("sections.title", sectionTitle)

  return { success: true, sectionId }
}
