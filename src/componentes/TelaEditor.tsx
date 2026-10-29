import type { Nota, TipoConteudo } from '../tipos'

type Props = {
  notaAtual?: Nota
  titulo: string
  conteudo: string
  tipoConteudo: TipoConteudo
  statusSalvamento: string
  erro: string | null
  menuFerramentas: boolean
  aoMudarTitulo: (valor: string) => void
  aoMudarConteudo: (valor: string) => void
  aoVoltar: () => void
  aoAlternarFerramentas: () => void
  aoFecharFerramentas: () => void
  aoSair: () => void
}

export function TelaEditor({
  notaAtual,
  titulo,
  conteudo,
  tipoConteudo,
  statusSalvamento,
  erro,
  menuFerramentas,
  aoMudarTitulo,
  aoMudarConteudo,
  aoVoltar,
  aoAlternarFerramentas,
  aoFecharFerramentas,
  aoSair,
}: Props) {
  return (
    <main className="min-h-screen bg-[#1d1d1b] text-[#eee9df]">
      <header className="border-b border-[#3b3a36] bg-[#171715]">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-5">
          <button type="button" onClick={aoVoltar} aria-label="Voltar para as notas" className="rounded-lg p-2 text-[#c8bda9] transition hover:bg-[#302f2b] hover:text-[#eee9df]">←</button>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c8bda9]">Agenda Inteligente</p>
            <h1 className="mt-1 text-xl font-semibold">{notaAtual ? `Editar ${tipoConteudo === 'lista' ? 'lista' : 'nota'}` : `Nova ${tipoConteudo === 'lista' ? 'lista' : 'nota'}`}</h1>
          </div>
          <button type="button" onClick={aoSair} className="ml-auto rounded-lg border border-[#4a4842] px-3 py-2 text-sm text-[#c8bda9] transition hover:bg-[#302f2b] hover:text-[#eee9df]">Sair</button>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-10">
        {erro && <p className="mb-6 rounded-lg border border-[#744d48] bg-[#382725] px-4 py-3 text-sm text-[#e2a99d]">{erro}</p>}
        <div>
          {statusSalvamento && <span className="mt-3 block text-xs text-[#9b978e]">{statusSalvamento}</span>}
          <input value={titulo} onChange={(event) => aoMudarTitulo(event.target.value)} placeholder={tipoConteudo === 'lista' ? 'Título da lista' : 'Título da nota'} className="w-full border-0 bg-transparent text-4xl font-semibold tracking-tight text-[#eee9df] outline-none placeholder:text-[#77746d]" required />
       
          <textarea value={conteudo} onChange={(event) => aoMudarConteudo(event.target.value)} placeholder={tipoConteudo === 'lista' ? 'Digite uma tarefa por linha...' : 'Comece a escrever...'} rows={16} className="mt-6 w-full resize-none border-0 bg-transparent text-lg leading-8 text-[#d8d2c7] outline-none placeholder:text-[#77746d]" required />
        </div>
      </div>
      {menuFerramentas && <div className="fixed bottom-24 right-6 flex flex-col gap-1 rounded-xl border border-[#4a4842] bg-[#292825] p-2 shadow-xl">{['Relógio', 'Clima', 'Despertador'].map((ferramenta) => <button type="button" key={ferramenta} onClick={aoFecharFerramentas} className="rounded-lg px-4 py-2 text-left text-sm font-semibold text-[#eee9df] transition hover:bg-[#3a3833]">{ferramenta}</button>)}</div>}
      <button type="button" onClick={aoAlternarFerramentas} aria-label="Abrir ferramentas futuras" className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#4a4842] bg-[#292825] text-xl text-[#c8bda9] shadow-lg transition hover:bg-[#3a3833] hover:text-[#eee9df]">⋮</button>
    </main>
  )
}
