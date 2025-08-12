import { searchSimilarChunks } from './vector-db'
import { supabase } from './supabase'

// OpenRouter configuration
const openai ={
  apiKey: process.env.OPENROUTER_API_KEY || 'MISSING_API_KEY',
  baseURL: 'https://openrouter.ai/api/v1/chat/completions',
  defaultHeaders: {
    'HTTP-Referer': 'https://localhost:3000', // Replace with your site URL
    'X-Title': 'Claro Energy Chatbot', // Optional, helps OpenRouter identify your app
  },
}

export async function detectLanguage(text: string): Promise<'en' | 'hi'> {
  // Simple language detection - can be enhanced with proper language detection library
  const hindiPattern = /[\u0900-\u097F]/
  return hindiPattern.test(text) ? 'hi' : 'en'
}

export async function generateRAGResponse(
  query: string,
  userId: string,
  sessionId?: string
) {
  // Detect query language
  const language = await detectLanguage(query)
  
  // Get relevant context from vector database
  const similarChunks = await searchSimilarChunks(query, language, 5)
  
  // Get recent chat history for context
  let chatHistory = []
  if (sessionId) {
    const { data } = await supabase
      .from('Chat')
      .select('messages')
      .eq('id', sessionId)
      .single()
    
    if (data?.messages) {
      chatHistory = data.messages.slice(-6) // Last 3 exchanges
    }
  }

  // Prepare context
  const context = similarChunks
    .map((chunk: { sectionTitle: string; content: string }) => `Section: ${chunk.sectionTitle}\nContent: ${chunk.content}`)
    .join('\n\n')

  const historyContext = chatHistory
    .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
    .join('\n')

  // System prompt based on language
  const systemPrompt = language === 'hi' 
    ? `आप Claro Energy के लिए एक सहायक चैटबॉट हैं। दिए गए संदर्भ के आधार पर सटीक और उपयोगी उत्तर दें। उत्तर को Markdown में स्पष्ट शीर्षकों (##), बुलेट पॉइंट्स (-), और महत्वपूर्ण तथ्यों के लिए बोल्ड (**bold**) का उपयोग करके अच्छी तरह से स्वरूपित करें। प्रत्येक शीर्षक, बुलेट पॉइंट और अनुच्छेद के बीच हमेशा एक खाली लाइन रखें ताकि उत्तर UI में स्पष्ट और पढ़ने में आसान दिखे। कभी भी बुलेट पॉइंट्स को एक साथ न जोड़ें। हमेशा उत्तर को संक्षिप्त, बिंदुवार और पढ़ने में आसान बनाएं। यदि जानकारी उपलब्ध नहीं है, तो स्पष्ट रूप से बताएं।`
    : `You are a helpful chatbot for Claro Energy. Provide accurate and helpful answers based on the given context.
ALWAYS format your answers in Markdown using:
- Headings (##) for each main section, with a blank line before and after each heading.
- Bullet points (-) for lists and steps, with a blank line before and after each list item.
- **Bold** for important facts and numbers.
- Always include a blank line between headings, bullet points, and paragraphs so the UI renders the answer with proper spacing.
- Never run bullet points together; always separate them with blank lines.
- Short, clear, and readable structure.
If information is not available, clearly state so.
Do NOT return tables, only use headings and bullet points.
ALWAYS ensure the Markdown is clean, readable, and visually separated for the user.`

  // User prompt with context
  const userPrompt = language === 'hi'
    ? `संदर्भ:\n${context}\n\nपिछली बातचीत:\n${historyContext}\n\nप्रश्न: ${query}\n\nकृपया संदर्भ के आधार पर उत्तर दें:`
    : `Context:\n${context}\n\nPrevious conversation:\n${historyContext}\n\nQuestion: ${query}\n\nPlease answer based on the context:`

  // Generate response using OpenRouter with a model that exists
  try {
    const completionRes = await fetch(openai.baseURL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openai.apiKey}`,
        'Content-Type': 'application/json',
        ...openai.defaultHeaders,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!completionRes.ok) {
      throw new Error(`OpenRouter API error: ${completionRes.status} ${completionRes.statusText}`);
    }

    const completion = await completionRes.json();

    const response = completion.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'

    // Save to chat history
    const newMessage = [
      { role: 'user', content: query, timestamp: new Date().toISOString() },
      { role: 'assistant', content: response, timestamp: new Date().toISOString() }
    ]

    if (sessionId) {
      // Update existing session
      const { data: session } = await supabase
        .from('Chat')
        .select('messages')
        .eq('id', sessionId)
        .single()

      const updatedMessages = [...(session?.messages || []), ...newMessage]
      
      await supabase
        .from('Chat')
        .update({ 
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
    } else {
      // Create new session
      await supabase
        .from('Chat')
        .insert({
          user_id: userId,
          messages: newMessage,
        })
    }

    // Stringify sources for safe React rendering
    return {
      response,
      sources: similarChunks.map((chunk: { sectionTitle: string; content: string }) => 
        `${chunk.sectionTitle}: ${chunk.content.substring(0, 100)}...`
      )
    }
  } catch (error) {
    console.error('Error generating response:', error)
    // Add more specific error handling for different error types
    if (typeof error === 'object' && error !== null && 'status' in error && (error as any).status === 404) {
      console.error('Model not found. Please check the model name in OpenRouter.')
    }
    return {
      response: 'Sorry, there was an error generating a response. Please try again later.',
      sources: []
    }
  }
}
