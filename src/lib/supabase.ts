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
          room_id: string | null
          autor_id: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          titulo: string
          conteudo: string
          tipo?: TipoConteudo
          room_id: string
          autor_id: string
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          titulo?: string
          conteudo?: string
          tipo?: TipoConteudo
          room_id?: string
          autor_id?: string
          criado_em?: string
          atualizado_em?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          id: string
          nome: string
          proprietario_id: string
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          proprietario_id: string
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          proprietario_id?: string
          criado_em?: string
        }
        Relationships: []
      }
      note_invitations: {
        Row: {
          id: string
          note_id: string
          sender_id: string
          recipient_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: never
        Update: {
          status?: 'pending' | 'accepted' | 'rejected'
          responded_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      obter_sala_pessoal: {
        Args: Record<string, never>
        Returns: string
      }
      compartilhar_nota: {
        Args: { p_nota_id: string; p_email: string }
        Returns: undefined
      }
      aceitar_convite: {
        Args: { p_convite_id: string }
        Returns: undefined
      }
      recusar_convite: {
        Args: { p_convite_id: string }
        Returns: undefined
      }
    }
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
