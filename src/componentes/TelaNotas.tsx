import { useEffect, useMemo, useRef, useState } from 'react'
import type { Nota } from '../tipos'

type Props = {
  notas: Nota[]
  busca: string
  carregando: boolean
  erro: string | null
  aoMudarBusca: (valor: string) => void
  aoAbrirNota: (nota: Nota) => void
  aoAbrirEditor: () => void
  aoAbrirPerfil: () => void
  aoExcluirNota: (id: string) => void
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data))
}

type PropsCartaoNota = {
  nota: Nota
  exibicao: 'grade' | 'lista'
  fixada: boolean
  menuAberto: boolean
  aoAbrirNota: (nota: Nota) => void
  aoAlternarMenu: () => void
  aoExcluirNota: (id: string) => void
  aoAlternarFixacao: (id: string) => void
}

function CartaoNota({
  nota,
  exibicao,
  fixada,
  menuAberto,
  aoAbrirNota,
  aoAlternarMenu,
  aoExcluirNota,
  aoAlternarFixacao,
}: PropsCartaoNota) {
  return (
    <article className={`relative box-border min-w-0 w-full max-w-full overflow-visible rounded-xl border border-[#3b3a36] bg-[#292825] shadow-sm transition hover:-translate-y-0.5 hover:border-[#c8bda9] hover:bg-[#302f2b] ${exibicao === 'lista' ? 'flex' : ''}`}>
      <button type="button" onClick={() => aoAbrirNota(nota)} className="flex h-full w-full min-w-0 flex-col p-3 pr-12 text-left sm:p-5 sm:pr-14">
        <span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#c8bda9] sm:mb-3 sm:text-xs">
          {nota.type === 'lista' ? 'Lista' : 'Nota'}
        </span>
        <strong className="block max-w-full truncate text-sm sm:text-base">{nota.title}</strong>
        <span className="mt-1 block max-w-full break-words text-xs leading-5 text-[#aaa59c] sm:mt-2 sm:text-sm sm:leading-6">{nota.content}</span>
        <small className="mt-3 block text-[10px] text-[#77746d] sm:mt-4 sm:text-xs">{formatarData(nota.updatedAt)}</small>
      </button>
      <button type="button" aria-label={`Opções da nota ${nota.title}`} aria-expanded={menuAberto} onClick={aoAlternarMenu} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-lg leading-none text-[#c8bda9] transition hover:bg-[#3a3833] hover:text-[#eee9df]">⋮</button>
      {menuAberto && <div className="absolute right-2 top-11 z-10 rounded-lg border border-[#4a4842] bg-[#1d1d1b] p-1 shadow-xl">
        <button type="button" onClick={() => aoAlternarFixacao(nota.id)} className="block w-full whitespace-nowrap rounded-md px-3 py-2 text-left text-sm text-[#c8bda9] transition hover:bg-[#3a3833]">{fixada ? 'Desafixar nota' : 'Fixar nota'}</button>
        <button type="button" onClick={() => aoExcluirNota(nota.id)} className="block w-full whitespace-nowrap rounded-md px-3 py-2 text-left text-sm text-[#d89a8d] transition hover:bg-[#382725]">Excluir nota</button>
      </div>}
    </article>
  )
}

export function TelaNotas({ notas, busca, carregando, erro, aoMudarBusca, aoAbrirNota, aoAbrirEditor, aoAbrirPerfil, aoExcluirNota }: Props) {
  const [exibicao, setExibicao] = useState<'grade' | 'lista'>('grade')
  const [ordemMaisRecente, setOrdemMaisRecente] = useState(true)
  const [menuAberto, setMenuAberto] = useState(false)
  const [notaComMenuAberto, setNotaComMenuAberto] = useState<string | null>(null)
  const [notasFixadas, setNotasFixadas] = useState<string[]>([])
  const notasContainer = useRef<HTMLDivElement>(null)
  const termo = busca.trim().toLowerCase()
  const notasFiltradas = useMemo(() => {
    const notasEncontradas = termo
      ? notas.filter(
          (nota) =>
            nota.title.toLowerCase().includes(termo) ||
            nota.content.toLowerCase().includes(termo),
        )
      : notas

    return [...notasEncontradas].sort((a, b) => {
      const diferenca =
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      return ordemMaisRecente ? -diferenca : diferenca
    })
  }, [notas, ordemMaisRecente, termo])
  const notasFixadasFiltradas = notasFixadas
    .map((id) => notasFiltradas.find((nota) => nota.id === id))
    .filter((nota): nota is Nota => Boolean(nota))
  const notasNaoFixadas = notasFiltradas.filter(
    (nota) => !notasFixadas.includes(nota.id),
  )

  useEffect(() => {
    function fecharMenuAoClicarFora(event: MouseEvent) {
      if (
        notaComMenuAberto &&
        notasContainer.current &&
        !notasContainer.current.contains(event.target as Node)
      ) {
        setNotaComMenuAberto(null)
      }
    }

    document.addEventListener('mousedown', fecharMenuAoClicarFora)
    return () => document.removeEventListener('mousedown', fecharMenuAoClicarFora)
  }, [notaComMenuAberto])

  function alternarFixacao(id: string) {
    setNotasFixadas((atuais) =>
      atuais.includes(id)
        ? atuais.filter((notaId) => notaId !== id)
        : [...atuais, id],
    )
    setNotaComMenuAberto(null)
  }

  return (
    <main className="min-h-screen bg-[#1d1d1b] text-[#eee9df]">
      <header className="fixed left-0 top-0 z-20 w-full bg-[#1d1d1b]">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#4a4842] text-[#c8bda9] transition hover:bg-[#302f2b] hover:text-[#eee9df] sm:h-10 sm:w-10"
          >
            <span className="flex flex-col gap-1">
              <span className="h-0.5 w-4 bg-current" />
              <span className="h-0.5 w-4 bg-current" />
              <span className="h-0.5 w-4 bg-current" />
            </span>
          </button>
          <label htmlFor="busca" className="sr-only">
            Buscar notas
          </label>
          <div className="relative min-w-0 flex-1">
            <input
              id="busca"
              type="search"
              value={busca}
              onChange={(event) => aoMudarBusca(event.target.value)}
              placeholder="Buscar notas"
              className="w-full rounded-xl border border-[#4a4842] bg-[#292825] py-2.5 pl-3 pr-10 text-sm outline-none transition placeholder:text-[#8d8981] focus:border-[#c8bda9] focus:ring-2 focus:ring-[#c8bda9]/20 sm:pl-4"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#c8bda9]">
              ⌕
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              setExibicao((atual) => (atual === 'grade' ? 'lista' : 'grade'))
            }
            aria-label={`Mudar para exibição em ${exibicao === 'grade' ? 'lista' : 'grade'}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#4a4842] text-[#c8bda9] transition hover:bg-[#302f2b] hover:text-[#eee9df] sm:h-10 sm:w-10"
          >
            {exibicao === 'grade' ? '☷' : '▦'}
          </button>
          <button
            type="button"
            onClick={() => setOrdemMaisRecente((atual) => !atual)}
            aria-label={
              ordemMaisRecente
                ? 'Exibir notas mais antigas primeiro'
                : 'Exibir notas mais recentes primeiro'
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#4a4842] text-[#c8bda9] transition hover:bg-[#302f2b] hover:text-[#eee9df] sm:h-10 sm:w-10"
          >
            {ordemMaisRecente ? '↓↑' : '↑↓'}
          </button>
          <button
            type="button"
            onClick={aoAbrirPerfil}
            aria-label="Abrir perfil"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c8bda9] text-[#c8bda9] transition hover:bg-[#c8bda9] hover:text-[#24231f] sm:h-10 sm:w-10"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="8" r="3.25" />
              <path strokeLinecap="round" d="M5.5 19a6.5 6.5 0 0 1 13 0" />
            </svg>
          </button>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-3 pb-6 pt-20 sm:px-6 sm:pb-8 sm:pt-24">
        <div className="mx-auto max-w-4xl">
          {erro && <p className="mb-6 rounded-lg border border-[#744d48] bg-[#382725] px-4 py-3 text-sm text-[#e2a99d]">{erro}</p>}
          <section ref={notasContainer}>
            <h2 className="sr-only">Lista de notas</h2>
            {carregando ? <p className="py-16 text-center text-[#9b978e]">Carregando notas...</p> : notasFiltradas.length === 0 ? <p className="py-16 text-center text-[#9b978e]">{notas.length === 0 ? 'Nenhuma nota ainda' : 'Nenhuma nota encontrada'}</p> : <div className="space-y-5">{notasFixadasFiltradas.length > 0 && <div className={exibicao === 'grade' ? 'grid w-full grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3' : 'flex w-full flex-col gap-3'}>{notasFixadasFiltradas.map((nota) => <CartaoNota key={nota.id} nota={nota} exibicao={exibicao} fixada menuAberto={notaComMenuAberto === nota.id} aoAbrirNota={aoAbrirNota} aoAlternarMenu={() => setNotaComMenuAberto((id) => id === nota.id ? null : nota.id)} aoExcluirNota={aoExcluirNota} aoAlternarFixacao={alternarFixacao} />)}</div>}{notasFixadasFiltradas.length > 0 && notasNaoFixadas.length > 0 && <hr className="border-[#4a4842]" />}{notasNaoFixadas.length > 0 && <div className={exibicao === 'grade' ? 'grid w-full grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3' : 'flex w-full flex-col gap-3'}>{notasNaoFixadas.map((nota) => <CartaoNota key={nota.id} nota={nota} exibicao={exibicao} fixada={false} menuAberto={notaComMenuAberto === nota.id} aoAbrirNota={aoAbrirNota} aoAlternarMenu={() => setNotaComMenuAberto((id) => id === nota.id ? null : nota.id)} aoExcluirNota={aoExcluirNota} aoAlternarFixacao={alternarFixacao} />)}</div>}</div>}
          </section>
        </div>
      </div>
      <button type="button" onClick={aoAbrirEditor} aria-label="Criar nova nota" className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#c8bda9] text-3xl font-light text-[#24231f] shadow-lg transition hover:bg-[#d8cebd]">+</button>
    </main>
  )
}
