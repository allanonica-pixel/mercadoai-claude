'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Product } from '@/lib/supabase/types'
import { formatBRL } from '@/lib/utils'

type SortOption = 'destaque' | 'menor_preco' | 'maior_desconto' | 'mais_recente'

const SORT_LABELS: Record<SortOption, string> = {
  destaque: 'Destaque',
  menor_preco: 'Menor Preço',
  maior_desconto: 'Maior Desconto',
  mais_recente: 'Mais Recente',
}

function CategoryIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  )
}

export default function ProductsClient({
  products,
  initialSearch = '',
  initialCategory = '',
}: {
  products: Product[]
  initialSearch?: string
  initialCategory?: string
}) {
  const [search, setSearch] = useState(initialSearch)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [sort, setSort] = useState<SortOption>('destaque')

  // Categorias únicas dos produtos (ordem alfabética)
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]
    return cats.sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [products])

  const filtered = useMemo(() => {
    let result = [...products]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand ?? '').toLowerCase().includes(q)
      )
    }

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory)
    }

    switch (sort) {
      case 'destaque':
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
        break
      case 'menor_preco':
        result.sort((a, b) => a.price - b.price)
        break
      case 'maior_desconto':
        result.sort((a, b) => (b.discount_pct ?? 0) - (a.discount_pct ?? 0))
        break
      case 'mais_recente':
        result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        break
    }

    return result
  }, [products, search, activeCategory, sort])

  return (
    <>
      {/* Hero escuro */}
      <section className="bg-gray-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Todos os Produtos</h1>
          <p className="text-gray-400 mb-6 text-sm md:text-base">
            Compare preços e encontre as melhores ofertas nos principais marketplaces do Brasil.
          </p>
          {/* Barra de busca hero */}
          <div className="relative max-w-lg">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produtos ou marcas..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Barra de filtros */}
      <div className="bg-white border-b border-gray-200 sticky top-[104px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 justify-between">
            {/* Pills de categoria */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1 pr-4">
              <button
                onClick={() => setActiveCategory('')}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  !activeCategory
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? '' : cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-orange-500 text-white font-semibold'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex-shrink-0">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-orange-300 bg-white cursor-pointer"
              >
                {Object.entries(SORT_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-500 mb-6">
          Mostrando <span className="font-semibold text-gray-900">{filtered.length}</span> produto{filtered.length !== 1 ? 's' : ''}
          {activeCategory && <span className="text-gray-500"> em <strong className="text-gray-700">{activeCategory}</strong></span>}
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">🔍</span>
            <p className="text-lg font-semibold text-gray-700">Nenhum produto encontrado</p>
            <p className="text-sm text-gray-500 mt-1">Tente outros termos ou categorias</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('') }}
              className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function ProductCard({ product }: { product: Product }) {
  const savings = product.original_price && product.original_price > product.price
    ? product.original_price - product.price
    : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col group">

      {/* Imagem */}
      <div className="relative bg-gray-50 overflow-hidden" style={{ aspectRatio: '1/1' }}>
        {product.discount_pct && product.discount_pct > 0 && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-black shadow">
            -{product.discount_pct}%
          </span>
        )}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-20">📦</span>
          </div>
        )}
      </div>

      {/* Corpo */}
      <div className="p-4 flex flex-col flex-1">

        {/* Categoria */}
        <div className="flex items-center gap-1 text-orange-500 text-xs font-semibold mb-2">
          <CategoryIcon />
          <span>{product.category}</span>
        </div>

        {/* Nome */}
        <Link href={`/produto/${product.slug}`}>
          <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors leading-snug cursor-pointer">
            {product.name}
          </h2>
        </Link>

        {/* Preços */}
        <div className="mb-3">
          {product.original_price && product.original_price > product.price && (
            <p className="text-xs text-gray-400 line-through">
              {formatBRL(product.original_price)}
            </p>
          )}
          <p className="text-xl font-black text-gray-900">{formatBRL(product.price)}</p>
        </div>

        {/* Seller + Marketplace + Frete */}
        <div className="space-y-1.5 mb-4 mt-auto">
          {product.seller && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-700">{product.seller}</span>
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {product.marketplace && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-semibold">
                {product.marketplace}
              </span>
            )}
            {product.free_shipping && (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-semibold">
                Frete Grátis
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <a
            href={product.affiliate_url ?? '#'}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
          >
            Ver Oferta
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            aria-label="Salvar produto"
            className="flex-shrink-0 w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
