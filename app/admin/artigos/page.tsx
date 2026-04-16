'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'
import { Article } from '@/lib/supabase/types'
import { CATEGORIES, ARTICLE_TYPES, TYPE_COLORS } from '@/constants/categories'
import { formatDate } from '@/lib/utils'

const supabase = createClient()

export default function ArtigosPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<string>('todos')
  const [category, setCategory] = useState('')

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false })
    setArticles(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Excluir o artigo "${title}"? Esta ação não pode ser desfeita.`)) return
    await supabase.from('articles').delete().eq('id', id)
    setArticles((prev) => prev.filter((a) => a.id !== id))
  }

  const filtered = articles.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase())
    const matchTab = tab === 'todos' || a.type === tab
    const matchCategory = !category || a.category === category
    return matchSearch && matchTab && matchCategory
  })

  const countByType = (type: string) => articles.filter((a) => a.type === type).length

  return (
    <AdminShell title="Artigos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Artigos</h2>
            <p className="text-gray-500 text-sm mt-0.5">{articles.length} artigos cadastrados</p>
          </div>
          <Link
            href="/admin/artigos/novo"
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            + Novo Artigo
          </Link>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por título ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="">Categoria ▼</option>
            {Object.keys(CATEGORIES).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setTab('todos')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              tab === 'todos' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Todos ({articles.length})
          </button>
          {ARTICLE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                tab === t ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t} ({countByType(t)})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Nenhum artigo encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Artigo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Categoria</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Autor</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Publicado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {a.cover_image ? (
                            <img src={a.cover_image} alt={a.title} className="w-12 h-9 object-cover rounded border border-gray-100" />
                          ) : (
                            <div className="w-12 h-9 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">Img</div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 max-w-xs truncate">{a.title}</div>
                            <div className="text-xs text-gray-400">{a.read_time} min de leitura</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[a.type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {a.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{a.category}</td>
                      <td className="px-4 py-3 text-gray-600">{a.author_name ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(a.published_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/artigos/${a.id}/editar`)}
                            className="text-gray-400 hover:text-teal-600 transition-colors p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(a.id, a.title)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
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
