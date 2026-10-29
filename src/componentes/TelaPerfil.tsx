type Props = {
  aoVoltar: () => void
  aoSair: () => void
}

export function TelaPerfil({ aoVoltar, aoSair }: Props) {
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
          <button type="button" onClick={aoSair} className="mt-6 rounded-lg border border-[#744d48] px-4 py-2 text-sm font-semibold text-[#d89a8d] transition hover:bg-[#382725]">
            Sair da conta
          </button>
        </section>
      </div>
    </main>
  )
}
