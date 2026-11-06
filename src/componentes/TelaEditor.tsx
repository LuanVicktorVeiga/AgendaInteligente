import { useState, type FormEvent } from 'react'
import type { TipoConteudo } from '../tipos'

type ItemLista = {
  texto: string
  concluido: boolean
}

function interpretarItens(conteudo: string): ItemLista[] {
  return conteudo
    .split('\n')
    .filter((linha) => linha.trim())
    .map((linha) => {
      const marcador = linha.match(/^\s*\[([ xX])\]\s*(.*)$/)
      return {
        texto: marcador ? marcador[2] : linha.trim(),
        concluido: marcador ? marcador[1].toLowerCase() === 'x' : false,
      }
    })
}

function serializarItens(itens: ItemLista[]) {
  return itens.map((item) => `${item.concluido ? '[x]' : '[ ]'} ${item.texto}`).join('\n')
}

type Props = {
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
  aoAbrirClima: () => void
}

export function TelaEditor({
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
  aoAbrirClima,
}: Props) {
  const [novoItem, setNovoItem] = useState('')
  const [indiceArrastado, setIndiceArrastado] = useState<number | null>(null)
  const itens = tipoConteudo === 'lista' ? interpretarItens(conteudo) : []

  function atualizarItens(novosItens: ItemLista[]) {
    aoMudarConteudo(serializarItens(novosItens))
  }

  function alternarItem(indice: number) {
    atualizarItens(itens.map((item, itemIndice) => itemIndice === indice ? { ...item, concluido: !item.concluido } : item))
  }

  function moverItem(indice: number, novoIndice: number) {
    if (indice === novoIndice || novoIndice < 0 || novoIndice >= itens.length) return
    const novosItens = [...itens]
    const [item] = novosItens.splice(indice, 1)
    novosItens.splice(novoIndice, 0, item)
    atualizarItens(novosItens)
  }

  function alterarTextoItem(indice: number, texto: string) {
    atualizarItens(itens.map((item, itemIndice) => itemIndice === indice ? { ...item, texto } : item))
  }

  function removerItem(indice: number) {
    atualizarItens(itens.filter((_item, itemIndice) => itemIndice !== indice))
  }

  function soltarItem(indiceDestino: number) {
    if (indiceArrastado === null) return
    const destino = indiceArrastado < indiceDestino ? indiceDestino - 1 : indiceDestino
    moverItem(indiceArrastado, destino)
    setIndiceArrastado(null)
  }

  function adicionarItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const texto = novoItem.trim()
    if (!texto) return
    atualizarItens([...itens, { texto, concluido: false }])
    setNovoItem('')
  }

  return (
    <main className="min-h-screen bg-[#1d1d1b] text-[#eee9df]">
      <header className="fixed left-0 top-0 z-20 w-full bg-[#1d1d1b]">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <button type="button" onClick={aoVoltar} aria-label="Voltar para as notas" className="rounded-lg p-2 text-[#c8bda9] transition hover:bg-[#302f2b] hover:text-[#eee9df]">←</button>
          <div className="relative">
            {menuFerramentas && <div className="absolute right-12 top-1/2 flex -translate-y-1/2 flex-row gap-1 rounded-xl border border-[#4a4842] bg-[#292825] p-2 shadow-xl">{['Relógio', 'Clima', 'Despertador'].map((ferramenta) => <button type="button" key={ferramenta} onClick={ferramenta === 'Clima' ? aoAbrirClima : aoFecharFerramentas} className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#eee9df] transition hover:bg-[#3a3833]">{ferramenta}</button>)}</div>}
            <button type="button" onClick={aoAlternarFerramentas} aria-label="Abrir ferramentas" aria-expanded={menuFerramentas} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#4a4842] text-[#c8bda9] shadow-lg transition hover:bg-[#302f2b] hover:text-[#eee9df]">
              <span className="flex flex-col gap-1" aria-hidden="true">
                <span className="h-0.5 w-4 bg-current" />
                <span className="h-0.5 w-4 bg-current" />
                <span className="h-0.5 w-4 bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 pb-10 pt-24">
        {erro && <p className="mb-6 rounded-lg border border-[#744d48] bg-[#382725] px-4 py-3 text-sm text-[#e2a99d]">{erro}</p>}
        <div>
          {statusSalvamento && <span className="mt-3 block text-xs text-[#9b978e]">{statusSalvamento}</span>}
          <input value={titulo} onChange={(event) => aoMudarTitulo(event.target.value)} placeholder={tipoConteudo === 'lista' ? 'Título da lista' : 'Título da nota'} className="w-full border-0 bg-transparent text-4xl font-semibold tracking-tight text-[#eee9df] outline-none placeholder:text-[#77746d]" required />
       
          {tipoConteudo === 'lista' ? (
            <div className="mt-6">
              <form onSubmit={adicionarItem} className="mb-4 flex max-w-xl gap-2 border-b border-[#3b3a36] pb-2">
                <input value={novoItem} onChange={(event) => setNovoItem(event.target.value)} placeholder="Adicionar item" className="min-w-0 flex-1 bg-transparent px-1 py-2 text-base text-[#eee9df] outline-none placeholder:text-[#77746d]" />
                <button type="submit" aria-label="Adicionar item" className="flex h-9 w-9 items-center justify-center rounded-full text-2xl font-light text-[#c8bda9] transition hover:bg-[#302f2b]">+</button>
              </form>
              <div className="space-y-2">
                {itens.map((item, indice) => (
                  <div key={indice} onDragOver={(event) => event.preventDefault()} onDrop={() => soltarItem(indice)} className={`flex items-center gap-2 py-1 ${indiceArrastado === indice ? 'opacity-40' : ''}`}>
                    <input type="checkbox" checked={item.concluido} onChange={() => alternarItem(indice)} aria-label={`Marcar item: ${item.texto}`} className="h-5 w-5 accent-[#c8bda9]" />
                    <input value={item.texto} onChange={(event) => alterarTextoItem(indice, event.target.value)} aria-label={`Editar item: ${item.texto}`} className={`min-w-0 flex-1 bg-transparent text-base outline-none ${item.concluido ? 'text-[#77746d] line-through' : 'text-[#d8d2c7]'}`} />
                    <button type="button" draggable onDragStart={() => setIndiceArrastado(indice)} onDragEnd={() => setIndiceArrastado(null)} aria-label={`Arrastar item ${item.texto}`} className="cursor-grab px-1 text-lg leading-none text-[#77746d] active:cursor-grabbing">⋮⋮</button>
                    <button type="button" onClick={() => removerItem(indice)} aria-label={`Remover item: ${item.texto}`} className="px-1 text-lg leading-none text-[#c8bda9] transition hover:text-[#d89a8d]">×</button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <textarea value={conteudo} onChange={(event) => aoMudarConteudo(event.target.value)} placeholder="Comece a escrever..." rows={16} className="mt-6 w-full resize-none border-0 bg-transparent text-lg leading-8 text-[#d8d2c7] outline-none placeholder:text-[#77746d]" required />
          )}
        </div>
      </div>
    </main>
  )
}
