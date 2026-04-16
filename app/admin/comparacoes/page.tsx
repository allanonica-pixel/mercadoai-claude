'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'
import { Comparison } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'

const supabase = createClient()

export default function ComparacoesPage() {
  const router = useRouter()
  const [comparisons, setComparisons] = useState<Comparison[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchComparisons = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('comparisons').select('*').order('created_at', { ascending: false })
    setComparisons(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchComparisons()
  }, [fetchComparisons])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Excluir a comparação "${title}"? Esta ação não pode ser desfeita.`)) return
    await supabase.from('comparisons').delete().eq('id', id)
    setComparisons((prev) => prev.filter((c) => c.id !== id))
  }

  const filtered = comparisons.filter((c) =>
    !search ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.excerpt && c.excerpt.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <AdminShell title="Comparações">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Comparações</h2>
            <p className="text-gray-500 text-sm mt-0.5">{comparisons.length} comparações cadastradas</p>
          </div>
          <Link
            href="/admin/comparacoes/nova"
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            + Nova Comparação
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por título ou resumo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Nenhuma comparação encontrada.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Produtos</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Critérios</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Publicado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{c.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">/comparar/{c.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {c.product_ids?.length ?? 0} produtos
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {Object.keys(c.criteria ?? {}).length} critérios
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {c.published_at ? formatDate(c.published_at) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${c.is_published ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.is_published ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          {c.is_published ? 'Publicado' : 'Rascunho'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/comparar/${c.slug}`}
                            target="_blank"
                            className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                            title="Ver no site"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <button
                            onClick={() => router.push(`/admin/comparacoes/${c.id}/editar`)}
                            className="text-gray-400 hover:text-teal-600 transition-colors p-1"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.title)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Excluir"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
