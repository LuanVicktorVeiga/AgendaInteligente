import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from './lib/supabase'
import type { TipoConteudo as TipoConteudoBanco } from './lib/supabase'

type TipoConteudo = TipoConteudoBanco

type Nota = {
  id: string
  title: string
  content: string
  updatedAt: string
  type?: TipoConteudo
}

function converterNota(nota: {
  id: string
  titulo: string
  conteudo: string
  tipo: TipoConteudo
  atualizado_em: string
}): Nota {
  return {
    id: nota.id,
    title: nota.titulo,
    content: nota.conteudo,
    type: nota.tipo,
    updatedAt: nota.atualizado_em,
  }
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(data))
}

function App() {
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

  const notaAtual = notas.find((nota) => nota.id === notaSelecionada)
  const notasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return notas
    }

    return notas.filter(
      (nota) =>
        nota.title.toLowerCase().includes(termo) ||
        nota.content.toLowerCase().includes(termo),
    )
  }, [notas, busca])

  useEffect(() => {
    async function carregarNotas() {
      if (!supabase) {
        setErro(
          'Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
        )
        setCarregando(false)
        return
      }

      const { data, error } = await supabase
        .from('notas')
        .select('id, titulo, conteudo, tipo, atualizado_em')
        .order('atualizado_em', { ascending: false })

      if (error) {
        setErro(`Não foi possível carregar as notas: ${error.message}`)
      } else {
        setNotas(data.map(converterNota))
      }

      setCarregando(false)
    }

    void carregarNotas()
  }, [])

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

    if (!tituloTratado || !conteudoTratado) {
      return
    }

    if (!supabase) {
      setErro(
        'Supabase não configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
      )
      return
    }

    setSalvando(true)
    setErro(null)

    if (notaSelecionada) {
      const { data, error } = await supabase
        .from('notas')
        .update({
          titulo: tituloTratado,
          conteudo: conteudoTratado,
          tipo: tipoConteudo,
        })
        .eq('id', notaSelecionada)
        .select('id, titulo, conteudo, tipo, atualizado_em')
        .single()

      if (error) {
        setErro(`Não foi possível atualizar a nota: ${error.message}`)
      } else {
        setNotas((notasAtuais) =>
          notasAtuais.map((nota) =>
            nota.id === notaSelecionada ? converterNota(data) : nota,
          ),
        )
        voltarParaLista()
      }
    } else {
      const { data, error } = await supabase
        .from('notas')
        .insert({
          titulo: tituloTratado,
          conteudo: conteudoTratado,
          tipo: tipoConteudo,
        })
        .select('id, titulo, conteudo, tipo, atualizado_em')
        .single()

      if (error) {
        setErro(`Não foi possível criar a nota: ${error.message}`)
      } else {
        setNotas((notasAtuais) => [converterNota(data), ...notasAtuais])
        voltarParaLista()
      }
    }

    setSalvando(false)
  }

  async function excluirConteudo() {
    if (!notaSelecionada || !supabase) {
      return
    }

    setSalvando(true)
    setErro(null)

    const { error } = await supabase
      .from('notas')
      .delete()
      .eq('id', notaSelecionada)

    if (error) {
      setErro(`Não foi possível excluir a nota: ${error.message}`)
    } else {
      setNotas((notasAtuais) =>
        notasAtuais.filter((nota) => nota.id !== notaSelecionada),
      )
      voltarParaLista()
    }

    setSalvando(false)
  }

  if (paginaEditor) {
    return (
      <main className="min-h-screen bg-[#1d1d1b] text-[#eee9df]">
        <header className="border-b border-[#3b3a36] bg-[#171715]">
          <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-5">
            <button
              type="button"
              onClick={voltarParaLista}
              aria-label="Voltar para as notas"
              className="rounded-lg p-2 text-[#c8bda9] transition hover:bg-[#302f2b] hover:text-[#eee9df]"
            >
              ←
            </button>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c8bda9]">
                Agenda Inteligente
              </p>
              <h1 className="mt-1 text-xl font-semibold text-[#eee9df]">
                {notaAtual
                  ? `Editar ${tipoConteudo === 'lista' ? 'lista' : 'nota'}`
                  : `Nova ${tipoConteudo === 'lista' ? 'lista' : 'nota'}`}
              </h1>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-6 py-10">
          {erro && (
            <p className="mb-6 rounded-lg border border-[#744d48] bg-[#382725] px-4 py-3 text-sm text-[#e2a99d]">
              {erro}
            </p>
          )}
          <form onSubmit={salvarConteudo}>
            <input
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder={
                tipoConteudo === 'lista' ? 'Título da lista' : 'Título da nota'
              }
              className="w-full border-0 bg-transparent text-4xl font-semibold tracking-tight text-[#eee9df] outline-none placeholder:text-[#77746d]"
              required
            />
            
            <textarea
              value={conteudo}
              onChange={(event) => setConteudo(event.target.value)}
              placeholder={
                tipoConteudo === 'lista'
                  ? 'Digite uma tarefa por linha...'
                  : 'Comece a escrever...'
              }
              rows={16}
              className="mt-6 w-full resize-none border-0 bg-transparent text-lg leading-8 text-[#d8d2c7] outline-none placeholder:text-[#77746d]"
              required
            />
            <div className="flex flex-wrap justify-end gap-3 border-t border-[#3b3a36] pt-5">
              {notaAtual && (
                <button
                  type="button"
                  onClick={excluirConteudo}
                  className="rounded-lg border border-[#744d48] px-4 py-2 text-sm font-semibold text-[#d89a8d] transition hover:bg-[#382725]"
                >
                  Excluir
                </button>
              )}
              <button
                type="button"
                onClick={voltarParaLista}
                className="rounded-lg border border-[#4a4842] px-4 py-2 text-sm font-semibold text-[#c8bda9] transition hover:bg-[#302f2b]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="rounded-lg bg-[#c8bda9] px-4 py-2 text-sm font-semibold text-[#24231f] transition hover:bg-[#d8cebd]"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
        {menuFerramentas && (
          <div className="fixed bottom-24 right-6 flex flex-col gap-1 rounded-xl border border-[#4a4842] bg-[#292825] p-2 shadow-xl">
            <button
              type="button"
              onClick={() => setMenuFerramentas(false)}
              className="rounded-lg px-4 py-2 text-left text-sm font-semibold text-[#eee9df] transition hover:bg-[#3a3833]"
            >
              Relógio
            </button>
            <button
              type="button"
              onClick={() => setMenuFerramentas(false)}
              className="rounded-lg px-4 py-2 text-left text-sm font-semibold text-[#eee9df] transition hover:bg-[#3a3833]"
            >
              Clima
            </button>
            <button
              type="button"
              onClick={() => setMenuFerramentas(false)}
              className="rounded-lg px-4 py-2 text-left text-sm font-semibold text-[#eee9df] transition hover:bg-[#3a3833]"
            >
              Despertador
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMenuFerramentas((aberto) => !aberto)}
          aria-label="Abrir ferramentas futuras"
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#4a4842] bg-[#292825] text-xl text-[#c8bda9] shadow-lg transition hover:bg-[#3a3833] hover:text-[#eee9df]"
        >
          ⋮
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#1d1d1b] text-[#eee9df]">
      <header className="border-b border-[#3b3a36] bg-[#171715]">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Agenda Inteligente
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <label htmlFor="busca" className="sr-only">
            Buscar notas
          </label>
          <div className="relative">
            <input
              id="busca"
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar notas"
              className="w-full rounded-xl border border-[#4a4842] bg-[#292825] py-3 pl-4 pr-11 text-sm outline-none transition placeholder:text-[#8d8981] focus:border-[#c8bda9] focus:ring-2 focus:ring-[#c8bda9]/20"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#c8bda9]">
              ⌕
            </span>
          </div>

          {erro && (
            <p className="mb-6 rounded-lg border border-[#744d48] bg-[#382725] px-4 py-3 text-sm text-[#e2a99d]">
              {erro}
            </p>
          )}
          <section className="mt-8">
            <h2 className="sr-only">Lista de notas</h2>
            {carregando ? (
              <p className="py-16 text-center text-[#9b978e]">
                Carregando notas...
              </p>
            ) : notasFiltradas.length === 0 ? (
              <p className="py-16 text-center text-[#9b978e]">
                {notas.length === 0
                  ? 'Nenhuma nota ainda'
                  : 'Nenhuma nota encontrada'}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {notasFiltradas.map((nota) => (
                  <button
                    type="button"
                    key={nota.id}
                    onClick={() => abrirNota(nota)}
                    className="rounded-xl border border-[#3b3a36] bg-[#292825] p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#c8bda9] hover:bg-[#302f2b]"
                  >
                    <span className="mb-3 block text-xs font-medium uppercase tracking-wider text-[#c8bda9]">
                      {nota.type === 'lista' ? 'Lista' : 'Nota'}
                    </span>
                    <strong className="block truncate text-base text-[#eee9df]">
                      {nota.title}
                    </strong>
                    <span className="mt-2 block max-h-12 overflow-hidden text-sm leading-6 text-[#aaa59c]">
                      {nota.content}
                    </span>
                    <small className="mt-4 block text-xs text-[#77746d]">
                      {formatarData(nota.updatedAt)}
                    </small>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {menuCriacao && (
        <div className="fixed bottom-24 right-6 flex flex-col gap-2 rounded-xl border border-[#4a4842] bg-[#292825] p-2 shadow-xl">
          <button
            type="button"
            onClick={() => abrirEditor('lista')}
            className="rounded-lg px-4 py-2 text-left text-sm font-semibold text-[#eee9df] transition hover:bg-[#3a3833]"
          >
            Lista
          </button>
          <button
            type="button"
            onClick={() => abrirEditor('nota')}
            className="rounded-lg px-4 py-2 text-left text-sm font-semibold text-[#eee9df] transition hover:bg-[#3a3833]"
          >
            Nota
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setMenuCriacao((aberto) => !aberto)}
        aria-label="Criar novo conteúdo"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#c8bda9] text-3xl font-light text-[#24231f] shadow-lg transition hover:bg-[#d8cebd] hover:shadow-xl"
      >
        {menuCriacao ? '×' : '+'}
      </button>
    </main>
  )
}

export default App
