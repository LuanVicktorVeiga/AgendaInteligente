import { useState, type FormEvent } from 'react'

type Props = {
  aoVoltar: () => void
}

function dataAtual() {
  return new Date().toISOString().slice(0, 10)
}

function horaAtual() {
  const agora = new Date()
  return `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
}

function formatarData(data: string) {
  if (!data) return 'Data não informada'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(`${data}T12:00:00`))
}

export function TelaClima({ aoVoltar }: Props) {
  const [local, setLocal] = useState('')
  const [data, setData] = useState(dataAtual)
  const [horario, setHorario] = useState(horaAtual)
  const [modalAberto, setModalAberto] = useState(true)
  const [minimizado, setMinimizado] = useState(false)
  const [consulta, setConsulta] = useState<{
    local: string
    data: string
    horario: string
    temperaturaMaxima: number
    temperaturaMinima: number
  } | null>(null)

  function consultar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const localTratado = local.trim()
    if (!localTratado) return
    setConsulta({
      local: localTratado,
      data,
      horario,
      temperaturaMaxima: 28,
      temperaturaMinima: 19,
    })
    setModalAberto(false)
  }

  return (
    <>
      {modalAberto && <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-clima">
        <section className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-[#292825] shadow-2xl sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="titulo-clima" className="text-xl font-semibold">Consulta de clima</h2>
              <p className="mt-1 text-sm text-[#77746d]">Informe o local, a data e o horário.</p>
            </div>
            <button type="button" onClick={aoVoltar} aria-label="Fechar consulta de clima" className="rounded-lg px-2 text-2xl leading-none text-[#77746d] transition hover:bg-[#f0eee9] hover:text-[#292825]">×</button>
          </div>

          <form onSubmit={consultar} className="mt-6 space-y-4">
            <div>
              <label htmlFor="local-clima" className="mb-2 block text-sm font-medium">Local a ser consultado</label>
              <input id="local-clima" value={local} onChange={(event) => setLocal(event.target.value)} placeholder="Ex.: São Paulo, SP" className="w-full rounded-xl border border-[#d6d2c9] px-4 py-3 outline-none transition focus:border-[#8c8477] focus:ring-2 focus:ring-[#8c8477]/20" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="data-clima" className="mb-2 block text-sm font-medium">Data</label>
                <input id="data-clima" type="date" value={data} onChange={(event) => setData(event.target.value)} className="w-full rounded-xl border border-[#d6d2c9] px-3 py-3 outline-none focus:border-[#8c8477] focus:ring-2 focus:ring-[#8c8477]/20" />
              </div>
              <div>
                <label htmlFor="horario-clima" className="mb-2 block text-sm font-medium">Horário</label>
                <input id="horario-clima" type="time" value={horario} onChange={(event) => setHorario(event.target.value)} className="w-full rounded-xl border border-[#d6d2c9] px-3 py-3 outline-none focus:border-[#8c8477] focus:ring-2 focus:ring-[#8c8477]/20" />
              </div>
            </div>
            <button type="submit" className="w-full rounded-xl bg-[#292825] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#45423c]">Consultar clima</button>
          </form>
        </section>
      </div>}

      {consulta && minimizado && <button type="button" onClick={() => setMinimizado(false)} className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-[#e1ded7] bg-white px-4 py-3 text-sm font-semibold text-[#292825] shadow-2xl transition hover:bg-[#f5f4f0]" aria-label="Restaurar consulta de clima">
        <span className="text-xl" role="img" aria-label="Tempo parcialmente nublado">⛅</span>
        <span className="max-w-32 truncate">{consulta.local}</span>
      </button>}

      {consulta && !minimizado && <aside className="fixed bottom-6 right-6 z-40 w-[min( calc(100vw-3rem),_18rem)] rounded-2xl border border-[#e1ded7] bg-white p-5 text-[#292825] shadow-2xl" aria-label={`Consulta de clima para ${consulta.local}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8c8477]">Clima consultado</span>
            <h2 className="mt-1 truncate text-lg font-semibold">{consulta.local}</h2>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-4xl leading-none" role="img" aria-label="Tempo parcialmente nublado">⛅</span>
            <button type="button" onClick={() => setMinimizado(true)} className="rounded-lg px-1 text-lg leading-none text-[#77746d] transition hover:bg-[#f5f4f0] hover:text-[#292825]" aria-label="Minimizar consulta de clima">−</button>
          </div>
        </div>
        <p className="mt-3 text-sm text-[#77746d]">{formatarData(consulta.data)}</p>
        <p className="text-sm text-[#77746d]">às {consulta.horario}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#eeeae2] pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="Temperatura máxima">↑</span>
            <div>
              <span className="block text-xs text-[#77746d]">Máxima</span>
              <strong className="text-lg">{consulta.temperaturaMaxima}°</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="Temperatura mínima">↓</span>
            <div>
              <span className="block text-xs text-[#77746d]">Mínima</span>
              <strong className="text-lg">{consulta.temperaturaMinima}°</strong>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setModalAberto(true)} className="mt-4 w-full rounded-lg border border-[#d6d2c9] px-3 py-2 text-xs font-semibold text-[#57534b] transition hover:bg-[#f5f4f0]">Nova consulta</button>
      </aside>}
    </>
  )
}
