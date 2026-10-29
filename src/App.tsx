import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [statusSalvamento, setStatusSalvamento] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const ultimaVersaoSalva = useRef('')

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
    setStatusSalvamento('')
  }

  function abrirEditor(tipo: TipoConteudo) {
    setNotaSelecionada(null)
    setTitulo('')
    setConteudo('')
    setTipoConteudo(tipo)
    ultimaVersaoSalva.current = ''
    setMenuCriacao(false)
    setPaginaEditor(true)
  }

  function abrirNota(nota: Nota) {
    setNotaSelecionada(nota.id)
    setTitulo(nota.title)
    setConteudo(nota.content)
    setTipoConteudo(nota.type ?? 'nota')
    ultimaVersaoSalva.current = `${nota.title}\n${nota.content}\n${nota.type ?? 'nota'}`
    setPaginaEditor(true)
  }

  const salvarNoSupabase = useCallback(async (fecharEditor: boolean) => {
    const tituloTratado = titulo.trim()
    const conteudoTratado = conteudo.trim()
    const versaoAtual = `${tituloTratado}\n${conteudoTratado}\n${tipoConteudo}`

    if (!tituloTratado || !conteudoTratado || versaoAtual === ultimaVersaoSalva.current) {
      return
    }

    if (!supabase) {
      setErro('Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
      return
    }

    setStatusSalvamento('Salvando...')
    setErro(null)

    if (notaSelecionada) {
      const { data, error } = await supabase.from('notas').update({ titulo: tituloTratado, conteudo: conteudoTratado, tipo: tipoConteudo }).eq('id', notaSelecionada).select('id, titulo, conteudo, tipo, atualizado_em').single()
      if (error) {
        setErro(`Não foi possível atualizar a nota: ${error.message}`)
        setStatusSalvamento('')
      } else {
        setNotas((atuais) => atuais.map((nota) => nota.id === notaSelecionada ? converterNota(data) : nota))
        ultimaVersaoSalva.current = versaoAtual
        setStatusSalvamento('Salvo')
        if (fecharEditor) voltarParaLista()
      }
    } else {
      const { data, error } = await supabase.from('notas').insert({ titulo: tituloTratado, conteudo: conteudoTratado, tipo: tipoConteudo }).select('id, titulo, conteudo, tipo, atualizado_em').single()
      if (error) {
        setErro(`Não foi possível criar a nota: ${error.message}`)
        setStatusSalvamento('')
      } else {
        const notaCriada = converterNota(data)
        setNotas((atuais) => [converterNota(data), ...atuais])
        setNotaSelecionada(notaCriada.id)
        ultimaVersaoSalva.current = versaoAtual
        setStatusSalvamento('Salvo')
        if (fecharEditor) voltarParaLista()
      }
    }

  }, [conteudo, notaSelecionada, tipoConteudo, titulo])

  useEffect(() => {
    if (!paginaEditor || !titulo.trim() || !conteudo.trim()) {
      return
    }

    const temporizador = window.setTimeout(() => {
      void salvarNoSupabase(false)
    }, 1000)

    return () => window.clearTimeout(temporizador)
  }, [conteudo, paginaEditor, salvarNoSupabase, titulo])

  if (verificandoSessao) return <main className="flex min-h-screen items-center justify-center bg-[#1d1d1b] text-[#c8bda9]">Verificando sessão...</main>
  if (!sessao) return <TelaAutenticacao />
  if (paginaEditor) return <TelaEditor notaAtual={notas.find((nota) => nota.id === notaSelecionada)} titulo={titulo} conteudo={conteudo} tipoConteudo={tipoConteudo} statusSalvamento={statusSalvamento} erro={erro} menuFerramentas={menuFerramentas} aoMudarTitulo={setTitulo} aoMudarConteudo={setConteudo} aoVoltar={voltarParaLista} aoAlternarFerramentas={() => setMenuFerramentas((aberto) => !aberto)} aoFecharFerramentas={() => setMenuFerramentas(false)} aoSair={() => void sair()} />
  return <TelaNotas notas={notas} busca={busca} carregando={carregando} erro={erro} menuCriacao={menuCriacao} aoMudarBusca={setBusca} aoAbrirNota={abrirNota} aoAbrirEditor={abrirEditor} aoAlternarMenu={() => setMenuCriacao((aberto) => !aberto)} aoSair={() => void sair()} />
}

export default App
