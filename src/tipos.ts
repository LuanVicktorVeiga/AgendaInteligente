import type { TipoConteudo as TipoConteudoBanco } from './lib/supabase'

export type TipoConteudo = TipoConteudoBanco

export type Nota = {
  id: string
  title: string
  content: string
  updatedAt: string
  type?: TipoConteudo
}
