'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { triggerRevalidation } from '@/lib/revalidate'

interface DeleteButtonProps {
  id: string
  table: 'products' | 'articles' | 'deals' | 'comparisons'
  label: string // nome do item para exibir na mensagem
}

const TABLE_TYPE_MAP = {
  products: 'product',
  articles: 'article',
  deals: 'deal',
  comparisons: 'comparison',
} as const

export default function DeleteButton({ id, table, label }: DeleteButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setLoading(true)
    setError('')

    const { error } = await supabase.from(table).delete().eq('id', id)

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setShowConfirm(false)
    setShowSuccess(true)

    // Invalida cache das páginas públicas afetadas
    triggerRevalidation(TABLE_TYPE_MAP[table])
  }

  function handleSuccessClose() {
    setShowSuccess(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
      >
        Excluir
      </button>

      {/* Modal de confirmação */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Confirmar exclusão</h3>
                <p className="text-sm text-gray-500 mt-0.5">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 mb-5 line-clamp-2">
              <span className="font-semibold">{label}</span>
            </p>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); setError('') }}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Não, cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de sucesso */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Excluído com sucesso!</h3>
            <p className="text-sm text-gray-500 mb-5">O item foi removido permanentemente.</p>
            <button
              onClick={handleSuccessClose}
              className="w-full px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  )
}
