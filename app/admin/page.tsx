'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
          M
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
        <p className="text-gray-500 mt-1 text-sm">Faça login para gerenciar o conteúdo</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mercadoai.com"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Acesso restrito a administradores autorizados
      </p>
    </div>
  )
}
