import { useCallback, useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { TelaAutenticacao } from './componentes/TelaAutenticacao'
import { TelaEditor } from './componentes/TelaEditor'
import { TelaNotas } from './componentes/TelaNotas'
import { TelaPerfil } from './componentes/TelaPerfil'
import { TelaClima } from './componentes/TelaClima'
import type { Nota, TipoConteudo } from './tipos'
import type { PrevisaoClima } from './lib/clima'
import { supabase } from './lib/supabase'

function converterNota(nota: { id: string; titulo: string; conteudo: string; tipo: TipoConteudo; room_id?: string | null; atualizado_em: string }, salaPessoalId?: string | null): Nota {
  return { id: nota.id, title: nota.titulo, content: nota.conteudo, type: nota.tipo, updatedAt: nota.atualizado_em, compartilhada: Boolean(salaPessoalId && nota.room_id && nota.room_id !== salaPessoalId) }
}

const CHAVE_CLIMA_RASCUNHO = 'agenda-inteligente:clima:rascunho'

function chaveClimaNota(id: string) {
  return `agenda-inteligente:clima:${id}`
}

function carregarConsultaClima(chave: string): PrevisaoClima | null {
  const valor = localStorage.getItem(chave)
  if (!valor) return null
  try {
    return JSON.parse(valor) as PrevisaoClima
  } catch {
    localStorage.removeItem(chave)
    return null
  }
}

function App() {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [verificandoSessao, setVerificandoSessao] = useState(() => Boolean(supabase))
  const [notas, setNotas] = useState<Nota[]>([])
  const [salaId, setSalaId] = useState<string | null>(null)
  const [versaoSalas, setVersaoSalas] = useState(0)
  const [notaSelecionada, setNotaSelecionada] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [tipoConteudo, setTipoConteudo] = useState<TipoConteudo>('nota')
  const [paginaEditor, setPaginaEditor] = useState(false)
  const [paginaPerfil, setPaginaPerfil] = useState(false)
  const [paginaClima, setPaginaClima] = useState(false)
  const [consultaClima, setConsultaClima] = useState<PrevisaoClima | null>(null)
  const [menuFerramentas, setMenuFerramentas] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [statusSalvamento, setStatusSalvamento] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [convites, setConvites] = useState<Array<{ id: string; note_id: string; status: 'pending' | 'accepted' | 'rejected'; created_at: string; nota?: { titulo: string } | null }>>([])
  const [carregandoConvites, setCarregandoConvites] = useState(false)
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
    async function prepararSala() {
      if (!sessao || !supabase) {
        setSalaId(null)
        return
      }
      const { data, error } = await supabase.rpc('obter_sala_pessoal')
      if (error) {
        setErro(`Não foi possível preparar a sala de notas: ${error.message}`)
        return
      }
      setSalaId(data)
    }
    void prepararSala()
  }, [sessao])

  useEffect(() => {
    async function carregarNotas() {
      if (!sessao || !salaId) {
        setNotas([])
        if (!sessao) setCarregando(false)
        return
      }
      if (!supabase) {
        setErro('Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
        setCarregando(false)
        return
      }
      const { data: salas, error: salasError } = await supabase.from('rooms').select('id')
      if (salasError) {
        setErro(`Não foi possível carregar as salas: ${salasError.message}`)
        setCarregando(false)
        return
      }
      const idsDasSalas = salas.map((sala) => sala.id)
      const { data, error } = await supabase.from('notas').select('id, titulo, conteudo, tipo, room_id, atualizado_em').in('room_id', idsDasSalas).order('atualizado_em', { ascending: false })
      if (error) setErro(`Não foi possível carregar as notas: ${error.message}`)
      else setNotas(data.map((nota) => converterNota(nota, salaId)))
      setCarregando(false)
    }
    void carregarNotas()
  }, [salaId, sessao, versaoSalas])

  async function carregarConvites() {
    if (!supabase || !sessao) return
    setCarregandoConvites(true)
    const { data, error } = await supabase.from('note_invitations').select('id, note_id, status, created_at, notas(titulo)').eq('status', 'pending').eq('recipient_id', sessao.user.id).order('created_at', { ascending: false })
    if (error) setErro(`Não foi possível carregar os convites: ${error.message}`)
    else setConvites(data.map((convite) => ({ ...convite, nota: Array.isArray(convite.notas) ? convite.notas[0] : convite.notas })))
    setCarregandoConvites(false)
  }

  async function sair() {
    if (supabase) await supabase.auth.signOut()
  }

  async function excluirNota(id: string) {
    if (!supabase) {
      setErro('Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
      return
    }

    const { error } = await supabase.from('notas').delete().eq('id', id)

    if (error) {
      setErro(`Não foi possível excluir a nota: ${error.message}`)
      return
    }

    setNotas((atuais) => atuais.filter((nota) => nota.id !== id))
  }

  async function compartilharNota(id: string, email: string) {
    if (!supabase) {
      setErro('Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
      throw new Error('Supabase não configurado.')
    }
    const { error } = await supabase.rpc('compartilhar_nota', { p_nota_id: id, p_email: email })
    if (error) {
      setErro(`Não foi possível compartilhar a nota: ${error.message}`)
      throw error
    }
    setErro(null)
  }

  function voltarParaLista() {
    setNotaSelecionada(null)
    setTitulo('')
    setConteudo('')
    setPaginaEditor(false)
    setPaginaClima(false)
    setMenuFerramentas(false)
    setStatusSalvamento('')
  }

  function abrirPerfil() {
    setPaginaEditor(false)
    setPaginaPerfil(true)
    setMenuFerramentas(false)
    void carregarConvites()
  }

  function voltarDoPerfil() {
    setPaginaPerfil(false)
  }

  async function responderConvite(id: string, aceitar: boolean) {
    if (!supabase) return
    const { error } = await supabase.rpc(aceitar ? 'aceitar_convite' : 'recusar_convite', { p_convite_id: id })
    if (error) {
      setErro(`Não foi possível responder ao convite: ${error.message}`)
      return
    }
    setConvites((atuais) => atuais.filter((convite) => convite.id !== id))
    if (aceitar) setVersaoSalas((versao) => versao + 1)
  }

  function abrirClima() {
    setMenuFerramentas(false)
    setPaginaClima(true)
  }

  function voltarDoClima() {
    setPaginaClima(false)
  }

  function removerConsultaClima() {
    if (notaSelecionada) localStorage.removeItem(chaveClimaNota(notaSelecionada))
    else localStorage.removeItem(CHAVE_CLIMA_RASCUNHO)
    setConsultaClima(null)
    setPaginaClima(false)
  }

  function abrirEditor() {
    setNotaSelecionada(null)
    setTitulo('')
    setConteudo('')
    setTipoConteudo('nota')
    ultimaVersaoSalva.current = ''
    setConsultaClima(carregarConsultaClima(CHAVE_CLIMA_RASCUNHO))
    setPaginaEditor(true)
  }

  function abrirNota(nota: Nota) {
    setNotaSelecionada(nota.id)
    setTitulo(nota.title)
    setConteudo(nota.content)
    setTipoConteudo(nota.type ?? 'nota')
    setConsultaClima(carregarConsultaClima(chaveClimaNota(nota.id)))
    ultimaVersaoSalva.current = `${nota.title}\n${nota.content}\n${nota.type ?? 'nota'}`
    setPaginaEditor(true)
  }

  const salvarNoSupabase = useCallback(async (fecharEditor: boolean) => {
    const tituloTratado = titulo.trim()
    const conteudoTratado = conteudo.trim()
    const versaoAtual = `${tituloTratado}\n${conteudoTratado}\n${tipoConteudo}`
    const usuarioId = sessao?.user.id

    if (!tituloTratado || (!conteudoTratado && !notaSelecionada) || !salaId || !usuarioId || versaoAtual === ultimaVersaoSalva.current) {
      return
    }

    if (!supabase) {
      setErro('Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
      return
    }

    setStatusSalvamento('Salvando...')
    setErro(null)

    if (notaSelecionada) {
      const { data, error } = await supabase.from('notas').update({ titulo: tituloTratado, conteudo: conteudoTratado, tipo: tipoConteudo }).eq('id', notaSelecionada).select('id, titulo, conteudo, tipo, room_id, atualizado_em').single()
      if (error) {
        setErro(`Não foi possível atualizar a nota: ${error.message}`)
        setStatusSalvamento('')
      } else {
        setNotas((atuais) => atuais.map((nota) => nota.id === notaSelecionada ? converterNota(data, salaId) : nota))
        ultimaVersaoSalva.current = versaoAtual
        setStatusSalvamento('Salvo')
        if (fecharEditor) voltarParaLista()
      }
    } else {
      const { data, error } = await supabase.from('notas').insert({ titulo: tituloTratado, conteudo: conteudoTratado, tipo: tipoConteudo, room_id: salaId, autor_id: usuarioId }).select('id, titulo, conteudo, tipo, atualizado_em').single()
      if (error) {
        setErro(`Não foi possível criar a nota: ${error.message}`)
        setStatusSalvamento('')
      } else {
        const notaCriada = converterNota(data)
        const consultaRascunho = carregarConsultaClima(CHAVE_CLIMA_RASCUNHO)
        if (consultaRascunho) {
          localStorage.setItem(chaveClimaNota(notaCriada.id), JSON.stringify(consultaRascunho))
          localStorage.removeItem(CHAVE_CLIMA_RASCUNHO)
          setConsultaClima(consultaRascunho)
        }
        setNotas((atuais) => [converterNota(data), ...atuais])
        setNotaSelecionada(notaCriada.id)
        ultimaVersaoSalva.current = versaoAtual
        setStatusSalvamento('Salvo')
        if (fecharEditor) voltarParaLista()
      }
    }

  }, [conteudo, notaSelecionada, salaId, sessao, tipoConteudo, titulo])

  useEffect(() => {
    if (!paginaEditor || !titulo.trim() || (!conteudo.trim() && !notaSelecionada)) {
      return
    }

    const temporizador = window.setTimeout(() => {
      void salvarNoSupabase(false)
    }, 1000)

    return () => window.clearTimeout(temporizador)
  }, [conteudo, notaSelecionada, paginaEditor, salvarNoSupabase, tipoConteudo, titulo])

  if (verificandoSessao) return <main className="flex min-h-screen items-center justify-center bg-[#1d1d1b] text-[#c8bda9]">Verificando sessão...</main>
  if (!sessao) return <TelaAutenticacao />
  if (paginaPerfil) return <TelaPerfil aoVoltar={voltarDoPerfil} aoSair={() => void sair()} convites={convites} carregandoConvites={carregandoConvites} aoResponderConvite={responderConvite} />
  if (paginaEditor) return <><TelaEditor titulo={titulo} conteudo={conteudo} tipoConteudo={tipoConteudo} statusSalvamento={statusSalvamento} erro={erro} menuFerramentas={menuFerramentas} aoMudarTitulo={setTitulo} aoMudarConteudo={setConteudo} aoVoltar={voltarParaLista} aoAlternarFerramentas={() => setMenuFerramentas((aberto) => !aberto)} aoFecharFerramentas={() => setMenuFerramentas(false)} aoAbrirClima={abrirClima} />{(paginaClima || consultaClima) && <TelaClima key={`${notaSelecionada ?? 'rascunho'}-${paginaClima ? 'aberto' : 'fechado'}`} consultaInicial={consultaClima} formularioAberto={paginaClima} aoSalvarConsulta={(consulta) => { setConsultaClima(consulta); localStorage.setItem(notaSelecionada ? chaveClimaNota(notaSelecionada) : CHAVE_CLIMA_RASCUNHO, JSON.stringify(consulta)) }} aoRemoverConsulta={removerConsultaClima} aoVoltar={voltarDoClima} />}</>
  return <TelaNotas notas={notas} busca={busca} carregando={carregando} erro={erro} aoMudarBusca={setBusca} aoAbrirNota={abrirNota} aoAbrirEditor={abrirEditor} aoAbrirPerfil={abrirPerfil} aoExcluirNota={excluirNota} aoCompartilharNota={compartilharNota} />
}

export default App
