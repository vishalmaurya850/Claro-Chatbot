import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'USER' | 'ADMIN'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'USER' | 'ADMIN'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'USER' | 'ADMIN'
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          title: string
          content: string
          language: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          language: string
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          language?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      document_sections: {
        Row: {
          id: string
          document_id: string
          section_title: string
          content: string
          embedding: number[]
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          document_id: string
          section_title: string
          content: string
          embedding: number[]
          language: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          section_title?: string
          content?: string
          embedding?: number[]
          language?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          messages: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          messages: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          messages?: any[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
