import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { TelaAutenticacao } from './componentes/TelaAutenticacao'
import { TelaEditor } from './componentes/TelaEditor'
import { TelaNotas } from './componentes/TelaNotas'
import type { Nota, TipoConteudo } from './tipos'
import { supabase } from './lib/supabase'

function converterNota(nota: { id: string; titulo: string; conteudo: string; tipo: TipoConteudo; atualizado_em: string }): Nota {
  return { id: nota.id, title: nota.titulo, content: nota.conteudo, type: nota.tipo, updatedAt: nota.atualizado_em }
}

function App() {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [verificandoSessao, setVerificandoSessao] = useState(() => Boolean(supabase))
  const [notas, setNotas] = useState<Nota[]>([])
  const [notaSelecionada, setNotaSelecionada] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [tipoConteudo, setTipoConteudo] = useState<TipoConteudo>('nota')
  const [paginaEditor, setPaginaEditor] = useState(false)
  const [menuCriacao, setMenuCriacao] = useState(false)
  const [menuFerramentas, setMenuFerramentas] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    let ativo = true
    void supabase.auth.getSession().then(({ data }) => {
      if (ativo) {
        setSessao(data.session)
        setVerificandoSessao(false)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, novaSessao) => setSessao(novaSessao))
    return () => { ativo = false; subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    async function carregarNotas() {
      if (!sessao) {
        setNotas([])
        setCarregando(false)
        return
      }
      if (!supabase) {
        setErro('Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
        setCarregando(false)
        return
      }
      const { data, error } = await supabase.from('notas').select('id, titulo, conteudo, tipo, atualizado_em').order('atualizado_em', { ascending: false })
      if (error) setErro(`Não foi possível carregar as notas: ${error.message}`)
      else setNotas(data.map(converterNota))
      setCarregando(false)
    }
    void carregarNotas()
  }, [sessao])

  async function sair() {
    if (supabase) await supabase.auth.signOut()
  }

  function voltarParaLista() {
    setNotaSelecionada(null)
    setTitulo('')
    setConteudo('')
    setPaginaEditor(false)
    setMenuFerramentas(false)
  }

  function abrirEditor(tipo: TipoConteudo) {
    setNotaSelecionada(null)
    setTitulo('')
    setConteudo('')
    setTipoConteudo(tipo)
    setMenuCriacao(false)
    setPaginaEditor(true)
  }

  function abrirNota(nota: Nota) {
    setNotaSelecionada(nota.id)
    setTitulo(nota.title)
    setConteudo(nota.content)
    setTipoConteudo(nota.type ?? 'nota')
    setPaginaEditor(true)
  }

  async function salvarConteudo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const tituloTratado = titulo.trim()
    const conteudoTratado = conteudo.trim()
    if (!tituloTratado || !conteudoTratado) return
    if (!supabase) {
      setErro('Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
      return
    }
    setSalvando(true)
    setErro(null)
    if (notaSelecionada) {
      const { data, error } = await supabase.from('notas').update({ titulo: tituloTratado, conteudo: conteudoTratado, tipo: tipoConteudo }).eq('id', notaSelecionada).select('id, titulo, conteudo, tipo, atualizado_em').single()
      if (error) setErro(`Não foi possível atualizar a nota: ${error.message}`)
      else {
        setNotas((atuais) => atuais.map((nota) => nota.id === notaSelecionada ? converterNota(data) : nota))
        voltarParaLista()
      }
    } else {
      const { data, error } = await supabase.from('notas').insert({ titulo: tituloTratado, conteudo: conteudoTratado, tipo: tipoConteudo }).select('id, titulo, conteudo, tipo, atualizado_em').single()
      if (error) setErro(`Não foi possível criar a nota: ${error.message}`)
      else {
        setNotas((atuais) => [converterNota(data), ...atuais])
        voltarParaLista()
      }
    }
    setSalvando(false)
  }

  async function excluirConteudo() {
    if (!notaSelecionada || !supabase) return
    setSalvando(true)
    setErro(null)
    const { error } = await supabase.from('notas').delete().eq('id', notaSelecionada)
    if (error) setErro(`Não foi possível excluir a nota: ${error.message}`)
    else {
      setNotas((atuais) => atuais.filter((nota) => nota.id !== notaSelecionada))
      voltarParaLista()
    }
    setSalvando(false)
  }

  if (verificandoSessao) return <main className="flex min-h-screen items-center justify-center bg-[#1d1d1b] text-[#c8bda9]">Verificando sessão...</main>
  if (!sessao) return <TelaAutenticacao />
  if (paginaEditor) return <TelaEditor notaAtual={notas.find((nota) => nota.id === notaSelecionada)} titulo={titulo} conteudo={conteudo} tipoConteudo={tipoConteudo} salvando={salvando} erro={erro} menuFerramentas={menuFerramentas} aoMudarTitulo={setTitulo} aoMudarConteudo={setConteudo} aoSalvar={salvarConteudo} aoExcluir={excluirConteudo} aoVoltar={voltarParaLista} aoAlternarFerramentas={() => setMenuFerramentas((aberto) => !aberto)} aoFecharFerramentas={() => setMenuFerramentas(false)} aoSair={() => void sair()} />
  return <TelaNotas notas={notas} busca={busca} carregando={carregando} erro={erro} menuCriacao={menuCriacao} aoMudarBusca={setBusca} aoAbrirNota={abrirNota} aoAbrirEditor={abrirEditor} aoAlternarMenu={() => setMenuCriacao((aberto) => !aberto)} aoSair={() => void sair()} />
}

export default App
