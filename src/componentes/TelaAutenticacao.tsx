import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function TelaAutenticacao() {
  const [modoCadastro, setModoCadastro] = useState(false)
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro(null)
    setMensagem(null)

    if (!supabase) {
      setErro('Supabase não configurado. Verifique o arquivo .env.')
      return
    }

    if (modoCadastro && senha !== confirmacaoSenha) {
      setErro('As senhas precisam ser iguais.')
      return
    }

    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    setCarregando(true)

    if (modoCadastro) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
      })

      if (error) {
        setErro(`Não foi possível criar a conta: ${error.message}`)
      } else if (!data.session) {
        setMensagem(
          'Conta criada. Verifique seu e-mail para confirmar o cadastro.',
        )
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      })

      if (error) {
        setErro(`Não foi possível entrar: ${error.message}`)
      }
    }

    setCarregando(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1d1d1b] px-6 text-[#eee9df]">
      <section className="w-full max-w-md rounded-2xl border border-[#3b3a36] bg-[#292825] p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c8bda9]">
          Agenda Inteligente
        </p>
        <h1 className="mt-4 text-3xl font-semibold">
          {modoCadastro ? 'Criar sua conta' : 'Bem-vindo de volta'}
        </h1>
        <p className="mt-2 text-sm text-[#aaa59c]">
          {modoCadastro
            ? 'Comece a organizar sua rotina.'
            : 'Entre para acessar suas notas.'}
        </p>
        <form onSubmit={enviarFormulario} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#d8d2c7]">
              E-mail
            </label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-[#4a4842] bg-[#1d1d1b] px-3 py-2.5 text-[#eee9df] outline-none transition placeholder:text-[#77746d] focus:border-[#c8bda9] focus:ring-2 focus:ring-[#c8bda9]/20" placeholder="voce@exemplo.com" required />
          </div>
          <div>
            <label htmlFor="senha" className="mb-2 block text-sm font-medium text-[#d8d2c7]">
              Senha
            </label>
            <input id="senha" type="password" value={senha} onChange={(event) => setSenha(event.target.value)} className="w-full rounded-lg border border-[#4a4842] bg-[#1d1d1b] px-3 py-2.5 text-[#eee9df] outline-none transition placeholder:text-[#77746d] focus:border-[#c8bda9] focus:ring-2 focus:ring-[#c8bda9]/20" placeholder="Mínimo de 6 caracteres" minLength={6} required />
          </div>
          {modoCadastro && (
            <div>
              <label htmlFor="confirmacao-senha" className="mb-2 block text-sm font-medium text-[#d8d2c7]">
                Confirmar senha
              </label>
              <input id="confirmacao-senha" type="password" value={confirmacaoSenha} onChange={(event) => setConfirmacaoSenha(event.target.value)} className="w-full rounded-lg border border-[#4a4842] bg-[#1d1d1b] px-3 py-2.5 text-[#eee9df] outline-none transition placeholder:text-[#77746d] focus:border-[#c8bda9] focus:ring-2 focus:ring-[#c8bda9]/20" placeholder="Repita sua senha" minLength={6} required />
            </div>
          )}
          {erro && <p className="rounded-lg border border-[#744d48] bg-[#382725] px-4 py-3 text-sm text-[#e2a99d]">{erro}</p>}
          {mensagem && <p className="rounded-lg border border-[#53634d] bg-[#293529] px-4 py-3 text-sm text-[#b8d2aa]">{mensagem}</p>}
          <button type="submit" disabled={carregando} className="w-full rounded-lg bg-[#c8bda9] px-4 py-2.5 text-sm font-semibold text-[#24231f] transition hover:bg-[#d8cebd] disabled:cursor-not-allowed disabled:opacity-60">
            {carregando ? 'Aguarde...' : modoCadastro ? 'Criar conta' : 'Entrar'}
          </button>
        </form>
        <button type="button" onClick={() => { setModoCadastro((atual) => !atual); setErro(null); setMensagem(null) }} className="mt-6 w-full text-sm text-[#c8bda9] transition hover:text-[#eee9df]">
          {modoCadastro ? 'Já tenho uma conta' : 'Ainda não tenho uma conta'}
        </button>
      </section>
    </main>
  )
}
