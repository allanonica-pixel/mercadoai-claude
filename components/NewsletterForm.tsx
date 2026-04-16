'use client'

import { useState } from 'react'

interface NewsletterFormProps {
  dark?: boolean
}

export default function NewsletterForm({ dark = false }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    // Simulação — substituir por chamada real à API quando integração estiver pronta
    await new Promise((r) => setTimeout(r, 800))
    setStatus('success')
    setEmail('')
  }

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-2 text-sm font-medium ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Cadastrado com sucesso! Fique de olho na sua caixa de entrada.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
        disabled={status === 'loading'}
        className={`w-full px-3 py-2.5 text-sm rounded-lg border outline-none transition-colors disabled:opacity-60 ${
          dark
            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-100'
        }`}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full px-4 py-2.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white rounded-lg transition-colors"
      >
        {status === 'loading' ? 'Cadastrando...' : 'Quero Receber Ofertas'}
      </button>
    </form>
  )
}
