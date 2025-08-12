import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: documents, error } = await supabaseAdmin
      .from('Document')
      .select('id, title, content, language, sections, uploadedBy, createdAt, updatedAt')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
    }

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error in documents API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
