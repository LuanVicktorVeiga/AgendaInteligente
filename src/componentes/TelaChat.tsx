import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Mensagem = { id: string; author_id: string; body: string; created_at: string }
type Props = { roomId: string; usuarioId: string; amigoEmail: string; aoVoltar: () => void }

export function TelaChat({ roomId, usuarioId, amigoEmail, aoVoltar }: Props) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [texto, setTexto] = useState('')
  const [status, setStatus] = useState('Conectando...')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    let ativo = true
    const cliente = supabase
    const mesclar = (novas: Mensagem[]) => setMensagens((atuais) => {
      const mapa = new Map(atuais.map((mensagem) => [mensagem.id, mensagem]))
      novas.forEach((mensagem) => mapa.set(mensagem.id, mensagem))
      return [...mapa.values()].sort((a, b) => a.created_at.localeCompare(b.created_at))
    })
    async function recuperar() {
      if (!cliente) return
      const { data, error } = await cliente.from('messages').select('id, author_id, body, created_at').eq('room_id', roomId).order('created_at', { ascending: false }).limit(100)
      if (!ativo) return
      if (error) setStatus(`Falha: ${error.message}`)
      else { mesclar(data); setStatus('Conectado') }
    }
    void recuperar()
    if (!cliente) return () => { ativo = false }
    const canal = cliente.channel(`chat-${roomId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (evento) => {
      if (ativo) mesclar([evento.new as Mensagem])
    }).subscribe((estado) => { if (ativo) setStatus(estado === 'SUBSCRIBED' ? 'Conectado' : estado) })
    return () => { ativo = false; void cliente.removeChannel(canal) }
  }, [roomId])

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const corpo = texto.trim()
    if (!supabase || !corpo || enviando) return
    setEnviando(true)
    const { error } = await supabase.from('messages').insert({ room_id: roomId, author_id: usuarioId, body: corpo })
    if (error) setStatus(`Falha ao enviar: ${error.message}`)
    else setTexto('')
    setEnviando(false)
  }

  return <section className="fixed inset-0 z-30 flex flex-col bg-[#1d1d1b] text-[#eee9df]">
    <header className="flex items-center gap-3 border-b border-[#3b3a36] px-4 py-4"><button type="button" onClick={aoVoltar} aria-label="Voltar ao perfil" className="rounded-lg p-2 text-[#c8bda9]">←</button><div><h2 className="font-semibold">{amigoEmail}</h2><p className="text-xs text-[#9b978e]">{status}</p></div></header>
    <div className="flex-1 space-y-3 overflow-y-auto p-4">{mensagens.map((mensagem) => <div key={mensagem.id} className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${mensagem.author_id === usuarioId ? 'ml-auto bg-[#c8bda9] text-[#292825]' : 'bg-[#292825]'}`}>{mensagem.body}</div>)}</div>
    <form onSubmit={enviar} className="flex gap-2 border-t border-[#3b3a36] p-4"><input value={texto} onChange={(event) => setTexto(event.target.value)} maxLength={1000} placeholder="Digite uma mensagem" aria-label="Mensagem" className="min-w-0 flex-1 rounded-xl border border-[#4a4842] bg-[#292825] px-4 py-3 outline-none" /><button type="submit" disabled={enviando} className="rounded-xl bg-[#c8bda9] px-4 font-semibold text-[#292825] disabled:opacity-60">Enviar</button></form>
  </section>
}
