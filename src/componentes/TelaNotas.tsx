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
  aoSair: () => void
}

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data))
}

export function TelaNotas({ notas, busca, carregando, erro, menuCriacao, aoMudarBusca, aoAbrirNota, aoAbrirEditor, aoAlternarMenu, aoSair }: Props) {
  const termo = busca.trim().toLowerCase()
  const notasFiltradas = termo ? notas.filter((nota) => nota.title.toLowerCase().includes(termo) || nota.content.toLowerCase().includes(termo)) : notas

  return (
    <main className="min-h-screen bg-[#1d1d1b] text-[#eee9df]">
      <header className="border-b border-[#3b3a36] bg-[#171715]"><div className="mx-auto flex max-w-7xl items-center px-6 py-5"><h1 className="text-2xl font-semibold tracking-tight">Agenda Inteligente</h1><button type="button" onClick={aoSair} className="ml-auto rounded-lg border border-[#4a4842] px-3 py-2 text-sm text-[#c8bda9] transition hover:bg-[#302f2b] hover:text-[#eee9df]">Sair</button></div></header>
      <div className="mx-auto max-w-7xl px-6 py-8"><div className="mx-auto max-w-4xl">
        <label htmlFor="busca" className="sr-only">Buscar notas</label>
        <div className="relative"><input id="busca" type="search" value={busca} onChange={(event) => aoMudarBusca(event.target.value)} placeholder="Buscar notas" className="w-full rounded-xl border border-[#4a4842] bg-[#292825] py-3 pl-4 pr-11 text-sm outline-none transition placeholder:text-[#8d8981] focus:border-[#c8bda9] focus:ring-2 focus:ring-[#c8bda9]/20" /><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#c8bda9]">⌕</span></div>
        {erro && <p className="mb-6 mt-6 rounded-lg border border-[#744d48] bg-[#382725] px-4 py-3 text-sm text-[#e2a99d]">{erro}</p>}
        <section className="mt-8"><h2 className="sr-only">Lista de notas</h2>{carregando ? <p className="py-16 text-center text-[#9b978e]">Carregando notas...</p> : notasFiltradas.length === 0 ? <p className="py-16 text-center text-[#9b978e]">{notas.length === 0 ? 'Nenhuma nota ainda' : 'Nenhuma nota encontrada'}</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{notasFiltradas.map((nota) => <button type="button" key={nota.id} onClick={() => aoAbrirNota(nota)} className="rounded-xl border border-[#3b3a36] bg-[#292825] p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#c8bda9] hover:bg-[#302f2b]"><span className="mb-3 block text-xs font-medium uppercase tracking-wider text-[#c8bda9]">{nota.type === 'lista' ? 'Lista' : 'Nota'}</span><strong className="block truncate text-base">{nota.title}</strong><span className="mt-2 block max-h-12 overflow-hidden text-sm leading-6 text-[#aaa59c]">{nota.content}</span><small className="mt-4 block text-xs text-[#77746d]">{formatarData(nota.updatedAt)}</small></button>)}</div>}</section>
      </div></div>
      {menuCriacao && <div className="fixed bottom-24 right-6 flex flex-col gap-2 rounded-xl border border-[#4a4842] bg-[#292825] p-2 shadow-xl"><button type="button" onClick={() => aoAbrirEditor('lista')} className="rounded-lg px-4 py-2 text-left text-sm font-semibold transition hover:bg-[#3a3833]">Lista</button><button type="button" onClick={() => aoAbrirEditor('nota')} className="rounded-lg px-4 py-2 text-left text-sm font-semibold transition hover:bg-[#3a3833]">Nota</button></div>}
      <button type="button" onClick={aoAlternarMenu} aria-label="Criar novo conteúdo" className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#c8bda9] text-3xl font-light text-[#24231f] shadow-lg transition hover:bg-[#d8cebd]">{menuCriacao ? '×' : '+'}</button>
    </main>
  )
}
