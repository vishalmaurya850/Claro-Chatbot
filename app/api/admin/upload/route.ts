import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { upsertDocumentChunks } from '@/lib/vector-db'
import { v4 as uuidv4 } from 'uuid'
import pdfParse from 'pdf-parse'; // Add import for PDF parsing

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file content based on file type
    let content: string
    const fileType = file.type || 'text/plain'
    const fileName = file.name || ''

    if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      // Parse PDF to text using pdf-parse
      console.log("Processing PDF file:", fileName)
      const buffer = Buffer.from(await file.arrayBuffer())
      try {
        const pdfData = await pdfParse(buffer)
        content = pdfData.text
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError)
        return NextResponse.json({ error: 'Failed to parse PDF file' }, { status: 400 })
      }
    } else {
      // Handle as regular text file
      content = await file.text()
    }
    
    content = content.replace(/\u0000/g, "") // Remove null characters
    
    // Detect language (simple detection)
    const isHindi = /[\u0900-\u097F]/.test(content)
    const language = isHindi ? 'hi' : 'en'

    // Process document into chunks
    const documentId = uuidv4()
    const chunks = chunkDocument(content, documentId, file.name, language)

    // Create document record
    const now = new Date().toISOString()
    const { error: docError } = await supabaseAdmin
      .from('Document')
      .insert({
        id: documentId,
        title: file.name,
        content: content,
        language: language,
        sections: chunks.map(chunk => ({
          id: chunk.id,
          title: chunk.sectionTitle,
          content: chunk.content,
          language: chunk.language,
        })),
        uploadedBy: session.user.id,
        createdAt: now,
        updatedAt: now,
      })

    if (docError) {
      console.error('Error creating document:', docError)
      return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
    }
    
    // Generate embeddings and store in vector database
    await upsertDocumentChunks(chunks)

    // Update document status
    await supabaseAdmin
      .from('documents')
      .update({ status: 'completed' })
      .eq('id', documentId)

    return NextResponse.json({ 
      message: 'File uploaded and processed successfully',
      documentId 
    })
  } catch (error) {
    console.error('Error in upload API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function chunkDocument(content: string, documentId: string, title: string, language: string) {
  // Simple chunking by paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)
  
  return paragraphs.map((paragraph, index) => ({
    id: `${documentId}-chunk-${index}`,
    content: paragraph.trim(),
    documentId: documentId,
    sectionTitle: `Section ${index + 1}`,
    language: language,
    embedding: undefined, // Placeholder for embedding
  }))
}
