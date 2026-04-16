'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'
import { Product } from '@/lib/supabase/types'
import { formatBRL } from '@/lib/utils'

const supabase = createClient()

export default function DestaquesPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'todos' | 'habilitados' | 'nao-habilitados'>('todos')
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleToggleFeatured = async (product: Product) => {
    setToggling(product.id)
    const newVal = !product.is_featured
    await supabase.from('products').update({ is_featured: newVal, updated_at: new Date().toISOString() }).eq('id', product.id)
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, is_featured: newVal } : p)))
    setToggling(null)
  }

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchTab =
      tab === 'todos' || (tab === 'habilitados' && p.is_featured) || (tab === 'nao-habilitados' && !p.is_featured)
    return matchSearch && matchTab
  })

  const habilitados = products.filter((p) => p.is_featured).length

  return (
    <AdminShell title="Produtos em Destaque">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Produtos em Destaque</h2>
            <p className="text-gray-500 text-sm mt-0.5">{habilitados} produtos ativos nos Destaques</p>
          </div>
          <Link
            href="/admin/produtos/novo"
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            + Novo Produto
          </Link>
        </div>

        {/* Info banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
          <span className="text-yellow-500 text-lg">⭐</span>
          <p className="text-yellow-800 text-sm">
            Ative ou desative a opção <strong>Em Destaque</strong> em cada produto. Os produtos habilitados aparecem automaticamente na seção &quot;Produtos em Destaque&quot; da Home.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          {[
            { key: 'todos', label: `Todos (${products.length})` },
            { key: 'habilitados', label: `Habilitados (${habilitados})` },
            { key: 'nao-habilitados', label: `Não Habilitados (${products.length - habilitados})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
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
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Em Destaque</th>
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
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">Img</div>
                          )}
                          <div className="font-medium text-gray-900 max-w-xs truncate">{p.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.category}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{formatBRL(p.price)}</div>
                        {p.original_price && <div className="text-xs text-gray-400 line-through">{formatBRL(p.original_price)}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.marketplace ?? '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          disabled={toggling === p.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            p.is_featured
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {p.is_featured ? '★ Habilitado' : '☆ Desabilitado'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/admin/produtos/${p.id}/editar`)}
                          className="text-gray-400 hover:text-orange-500 transition-colors p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
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
