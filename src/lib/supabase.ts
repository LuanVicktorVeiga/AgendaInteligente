import { createClient } from '@supabase/supabase-js'

export type TipoConteudo = 'nota' | 'lista'

export type BancoDeDados = {
  public: {
    Tables: {
      notas: {
        Row: {
          id: string
          titulo: string
          conteudo: string
          tipo: TipoConteudo
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          titulo: string
          conteudo: string
          tipo?: TipoConteudo
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          titulo?: string
          conteudo?: string
          tipo?: TipoConteudo
          criado_em?: string
          atualizado_em?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      tipo_conteudo: TipoConteudo
    }
    CompositeTypes: Record<string, never>
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<BancoDeDados>(supabaseUrl, supabaseAnonKey)
    : null
