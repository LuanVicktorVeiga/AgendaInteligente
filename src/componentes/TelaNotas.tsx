import { useMemo, useState } from 'react'
import type { Nota, TipoConteudo } from '../tipos'

type Props = {
  notas: Nota[]
  busca: string
  carregando: boolean
  erro: string | null
  menuCriacao: boolean
  aoMudarBusca: (valor: string) => void
  aoAbrirNota: (nota: Nota) => void
  aoAbrirEditor: (tipo: TipoConteudo) => void
  aoAlternarMenu: () => void
  aoAbrirPerfil: () => void
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data))
}

export function TelaNotas({ notas, busca, carregando, erro, menuCriacao, aoMudarBusca, aoAbrirNota, aoAbrirEditor, aoAlternarMenu, aoAbrirPerfil }: Props) {
  const [exibicao, setExibicao] = useState<'grade' | 'lista'>('grade')
  const [ordemMaisRecente, setOrdemMaisRecente] = useState(true)
  const [menuAberto, setMenuAberto] = useState(false)
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

  return (
    <main className="min-h-screen bg-[#1d1d1b] text-[#eee9df]">
      <header className="bg-[#1d1d1b]">
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
            {ordemMaisRecente ? '↓' : '↑'}
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
      <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-4xl">
          {erro && <p className="mb-6 rounded-lg border border-[#744d48] bg-[#382725] px-4 py-3 text-sm text-[#e2a99d]">{erro}</p>}
          <section>
            <h2 className="sr-only">Lista de notas</h2>
            {carregando ? <p className="py-16 text-center text-[#9b978e]">Carregando notas...</p> : notasFiltradas.length === 0 ? <p className="py-16 text-center text-[#9b978e]">{notas.length === 0 ? 'Nenhuma nota ainda' : 'Nenhuma nota encontrada'}</p> : <div className={exibicao === 'grade' ? 'grid w-full grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3' : 'flex w-full flex-col gap-3'}>{notasFiltradas.map((nota) => <button type="button" key={nota.id} onClick={() => aoAbrirNota(nota)} className="box-border flex h-full min-w-0 w-full max-w-full flex-col overflow-hidden rounded-xl border border-[#3b3a36] bg-[#292825] p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#c8bda9] hover:bg-[#302f2b] sm:p-5"><span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#c8bda9] sm:mb-3 sm:text-xs">{nota.type === 'lista' ? 'Lista' : 'Nota'}</span><strong className="block max-w-full truncate text-sm sm:text-base">{nota.title}</strong><span className="mt-1 block max-w-full break-words text-xs leading-5 text-[#aaa59c] sm:mt-2 sm:text-sm sm:leading-6">{nota.content}</span><small className="mt-3 block text-[10px] text-[#77746d] sm:mt-4 sm:text-xs">{formatarData(nota.updatedAt)}</small></button>)}</div>}
          </section>
        </div>
      </div>
      {menuCriacao && <div className="fixed bottom-24 right-6 flex flex-col gap-2"><button type="button" onClick={() => aoAbrirEditor('lista')} className="min-w-32 rounded-2xl border border-[#4a4842] bg-[#292825] px-5 py-3 text-center text-sm font-semibold text-[#eee9df] shadow-lg transition hover:border-[#c8bda9] hover:bg-[#3a3833]">Lista</button><button type="button" onClick={() => aoAbrirEditor('nota')} className="min-w-32 rounded-2xl border border-[#4a4842] bg-[#292825] px-5 py-3 text-center text-sm font-semibold text-[#eee9df] shadow-lg transition hover:border-[#c8bda9] hover:bg-[#3a3833]">Nota</button></div>}
      <button type="button" onClick={aoAlternarMenu} aria-label="Criar novo conteúdo" className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#c8bda9] text-3xl font-light text-[#24231f] shadow-lg transition hover:bg-[#d8cebd]">{menuCriacao ? '×' : '+'}</button>
    </main>
  )
}
