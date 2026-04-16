'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'
import { Product } from '@/lib/supabase/types'
import { CATEGORIES, MARKETPLACES } from '@/constants/categories'
import { formatBRL } from '@/lib/utils'

const supabase = createClient()

export default function ProdutosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'todos' | 'com-link' | 'sem-link'>('todos')
  const [category, setCategory] = useState('')
  const [marketplace, setMarketplace] = useState('')
  const [status, setStatus] = useState('')

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Excluir o produto "${name}"? Esta ação não pode ser desfeita.`)) return
    await supabase.from('products').delete().eq('id', id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const filtered = products.filter((p) => {
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    const matchTab =
      tab === 'todos' || (tab === 'com-link' && !!p.affiliate_url) || (tab === 'sem-link' && !p.affiliate_url)
    const matchCategory = !category || p.category === category
    const matchMarketplace = !marketplace || p.marketplace === marketplace
    const matchStatus =
      !status || (status === 'ativo' && p.is_active) || (status === 'inativo' && !p.is_active)
    return matchSearch && matchTab && matchCategory && matchMarketplace && matchStatus
  })

  const totalComLink = products.filter((p) => !!p.affiliate_url).length
  const totalSemLink = products.filter((p) => !p.affiliate_url).length

  return (
    <AdminShell title="Produtos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Produtos</h2>
            <p className="text-gray-500 text-sm mt-0.5">{products.length} produtos cadastrados</p>
          </div>
          <Link
            href="/admin/produtos/novo"
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            + Novo Produto
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          {[
            { key: 'todos', label: `Todos (${products.length})` },
            { key: 'com-link', label: `Com Link (${totalComLink}) ✅` },
            { key: 'sem-link', label: `Sem Link (${totalSemLink}) ❌` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Categoria ▼</option>
            {Object.keys(CATEGORIES).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Marketplace ▼</option>
            {MARKETPLACES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Status ▼</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Nenhum produto encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Produto</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Categoria</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Preço</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Marketplace</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Link</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-10 h-10 object-contain rounded border border-gray-100" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">Sem img</div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 max-w-xs truncate">{p.name}</div>
                            {p.brand && <div className="text-xs text-gray-400">{p.brand}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.category}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{formatBRL(p.price)}</div>
                        {p.discount_pct && p.discount_pct > 0 && (
                          <div className="text-xs text-red-500">-{p.discount_pct}%</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.marketplace ?? '—'}</td>
                      <td className="px-4 py-3">
                        {p.affiliate_url ? (
                          <span className="text-green-600 font-medium">✅</span>
                        ) : (
                          <span className="text-red-500 font-medium">❗</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${p.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          {p.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/admin/produtos/${p.id}/editar`)}
                            className="text-gray-400 hover:text-orange-500 transition-colors p-1"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
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
