import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateRAGResponse } from '@/lib/rag'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Generate RAG response
    const { response, sources } = await generateRAGResponse(message, session.user.id)

    // Fix database saving errors by using the correct data types and providing required fields
    try {
      // Generate a UUID for the chat entry
      const chatId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
      
      // First attempt: Save to Chat table with proper structure
      const { error: saveError } = await supabase
        .from('Chat')
        .insert({
          id: chatId, // Add required ID field
          userId: session.user.id, // Use actual user ID from session
          messages: JSON.stringify(message),
          response: JSON.stringify(response),
          importance: 1, // Use a numeric value instead of text for double precision field
          language: 'en', // Set a default language or obtain from another source
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

      if (saveError) {
        console.error('Error saving to Chat:', saveError)
        }
      }
    catch (dbError) {
      console.error('Error saving chat message:', dbError)
      // Continue execution even if saving to database fails
    }

    return NextResponse.json({ response, sources })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
