'use client'

import { useState, useMemo } from 'react'
import { CATEGORIES, CATEGORY_SLUGS } from '@/constants/categories'
import { formatBRL } from '@/lib/utils'

interface Deal {
  id: string
  title: string
  product_name: string
  category: string | null
  discount_pct: number
  deal_price: number
  original_price: number
  marketplace: string
  seller: string | null
  affiliate_url: string | null
  image_url: string | null
  free_shipping: boolean
  expires_at: string | null
  is_active: boolean
  created_at: string
}

type SortOption = 'maior_desconto' | 'menor_preco' | 'maior_economia' | 'mais_recente'

const SORT_LABELS: Record<SortOption, string> = {
  maior_desconto: 'Maior Desconto',
  menor_preco: 'Menor Preço',
  maior_economia: 'Maior Economia',
  mais_recente: 'Mais Recente',
}

const categories = Object.keys(CATEGORIES).filter((c) => c !== 'Geral')

export default function OfertasClient({ deals }: { deals: Deal[] }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [marketplace, setMarketplace] = useState('Todos')
  const [freeShippingOnly, setFreeShippingOnly] = useState(false)
  const [sort, setSort] = useState<SortOption>('maior_desconto')

  const marketplaces = useMemo(() => {
    const set = new Set(deals.map((d) => d.marketplace).filter(Boolean))
    return ['Todos', ...Array.from(set)]
  }, [deals])

  const filtered = useMemo(() => {
    let result = [...deals]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((d) => d.product_name.toLowerCase().includes(q))
    }

    if (activeCategory) {
      result = result.filter((d) => d.category === activeCategory)
    }

    if (marketplace !== 'Todos') {
      result = result.filter((d) => d.marketplace === marketplace)
    }

    if (freeShippingOnly) {
      result = result.filter((d) => d.free_shipping)
    }

    switch (sort) {
      case 'maior_desconto':
        result.sort((a, b) => b.discount_pct - a.discount_pct)
        break
      case 'menor_preco':
        result.sort((a, b) => a.deal_price - b.deal_price)
        break
      case 'maior_economia':
        result.sort((a, b) => (b.original_price - b.deal_price) - (a.original_price - a.deal_price))
        break
      case 'mais_recente':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
    }

    return result
  }, [deals, search, activeCategory, marketplace, freeShippingOnly, sort])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-6">

            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              <span className="font-semibold text-gray-900">Filtros</span>
            </div>

            {/* Busca */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Buscar</p>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome do produto..."
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-100"
                />
              </div>
            </div>

            {/* Categoria */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Categoria</p>
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    activeCategory === null
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      activeCategory === cat
                        ? 'bg-orange-50 text-orange-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Marketplace */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Marketplace</p>
              <select
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-300 bg-white"
              >
                {marketplaces.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Frete Grátis toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Frete Grátis</span>
              <button
                role="switch"
                aria-checked={freeShippingOnly}
                onClick={() => setFreeShippingOnly((v) => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  freeShippingOnly ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    freeShippingOnly ? 'translate-x-4.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </aside>

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">

          {/* Barra superior */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-sm text-gray-600 font-medium">
              <span className="font-bold text-gray-900">{filtered.length}</span> oferta{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Ordenar por:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-orange-300 bg-white"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((deal) => {
                const savings = deal.original_price - deal.deal_price
                return (
                  <div key={deal.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    {/* Image */}
                    <div className="relative bg-gray-50 h-44 flex items-center justify-center overflow-hidden">
                      {/* Discount badge */}
                      <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-black shadow">
                        -{deal.discount_pct}%
                      </span>
                      {/* Free shipping badge */}
                      {deal.free_shipping && (
                        <span className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Grátis
                        </span>
                      )}
                      {deal.image_url ? (
                        <img
                          src={deal.image_url}
                          alt={deal.product_name}
                          className="w-full h-full object-contain p-4"
                        />
                      ) : (
                        <span className="text-5xl opacity-20">🏷️</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <p className="text-xs text-gray-400 mb-1">{deal.marketplace}</p>
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3 flex-1">
                        {deal.product_name}
                      </h3>

                      <div className="space-y-0.5 mb-3">
                        <p className="text-xl font-black text-gray-900">
                          {formatBRL(deal.deal_price)}
                          {deal.original_price > deal.deal_price && (
                            <span className="ml-2 text-sm font-normal text-gray-400 line-through">
                              {formatBRL(deal.original_price)}
                            </span>
                          )}
                        </p>
                        {savings > 0 && (
                          <p className="text-sm font-semibold text-emerald-600">
                            Economia de {formatBRL(savings)}
                          </p>
                        )}
                      </div>

                      <a
                        href={deal.affiliate_url ?? '#'}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
                      >
                        Ver Oferta
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="text-6xl mb-4">🏷️</span>
              <p className="text-lg font-semibold text-gray-700">Nenhuma oferta encontrada</p>
              <p className="text-sm text-gray-500 mt-1">Tente outros filtros ou categorias</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory(null); setMarketplace('Todos'); setFreeShippingOnly(false) }}
                className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
