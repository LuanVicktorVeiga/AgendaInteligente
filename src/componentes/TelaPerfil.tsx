type Convite = {
  id: string
  note_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  nota?: { titulo: string } | null
}

type Props = {
  aoVoltar: () => void
  aoSair: () => void
  convites: Convite[]
  carregandoConvites: boolean
  aoResponderConvite: (id: string, aceitar: boolean) => Promise<void>
}

export function TelaPerfil({ aoVoltar, aoSair, convites, carregandoConvites, aoResponderConvite }: Props) {
  return (
    <main className="min-h-screen bg-[#1d1d1b] text-[#eee9df]">
      <header className="fixed left-0 top-0 z-20 w-full bg-[#1d1d1b]">
        <div className="px-4 py-4 sm:px-6">
          <button type="button" onClick={aoVoltar} aria-label="Voltar para as notas" className="rounded-lg p-2 text-[#c8bda9] transition hover:bg-[#302f2b] hover:text-[#eee9df]">
            ←
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-6 pb-10 pt-24">
        <section className="rounded-2xl border border-[#3b3a36] bg-[#292825] p-6">
          <h2 className="text-lg font-semibold">Conta</h2>
          <p className="mt-2 text-sm text-[#aaa59c]">
            Gerencie o acesso à sua conta da Agenda Inteligente.
          </p>
          <div className="mt-8 border-t border-[#3b3a36] pt-6">
            <h3 className="font-semibold">Solicitações de compartilhamento</h3>
            {carregandoConvites ? <p className="mt-3 text-sm text-[#aaa59c]">Carregando solicitações...</p> : convites.length === 0 ? <p className="mt-3 text-sm text-[#aaa59c]">Nenhuma solicitação pendente.</p> : <div className="mt-4 space-y-3">{convites.map((convite) => <div key={convite.id} className="rounded-xl border border-[#4a4842] p-4"><p className="text-sm text-[#d8d2c7]">Você foi convidado para acessar a nota <strong>{convite.nota?.titulo ?? 'sem título'}</strong>.</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => void aoResponderConvite(convite.id, true)} className="rounded-lg bg-[#c8bda9] px-3 py-2 text-xs font-semibold text-[#292825]">Aceitar</button><button type="button" onClick={() => void aoResponderConvite(convite.id, false)} className="rounded-lg border border-[#744d48] px-3 py-2 text-xs font-semibold text-[#d89a8d]">Recusar</button></div></div>)}</div>}
          </div>
          <button type="button" onClick={aoSair} className="mt-6 rounded-lg border border-[#744d48] px-4 py-2 text-sm font-semibold text-[#d89a8d] transition hover:bg-[#382725]">
            Sair da conta
          </button>
        </section>
      </div>
    </main>
  )
}
