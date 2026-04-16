'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'
import { CATEGORIES, ARTICLE_TYPES, TYPE_COLORS } from '@/constants/categories'
import { Product } from '@/lib/supabase/types'
import { formatBRL } from '@/lib/utils'

const supabase = createClient()

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function NovaComparacaoPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    slug: '',
    is_published: false,
    excerpt: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    product_ids: [] as string[],
    featured_product_ids: [] as string[],
    related_article_ids: [] as string[],
  })

  const [products, setProducts] = useState<Product[]>([])
  const [articles, setArticles] = useState<{id: string, title: string, type: string, category: string, read_time: number, cover_image: string | null}[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [featuredProductSearch, setFeaturedProductSearch] = useState('')
  const [articleSearch, setArticleSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.from('products').select('*').order('name').then(({ data }) => setProducts(data ?? []))
    supabase.from('articles').select('id, title, type, category, read_time, cover_image').order('title').then(({ data }) => setArticles(data ?? []))
  }, [])

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugify(title) }))
  }

  const toggleMainProduct = (id: string) => {
    setForm((f) => ({
      ...f,
      product_ids: f.product_ids.includes(id)
        ? f.product_ids.filter((x) => x !== id)
        : [...f.product_ids, id],
    }))
  }

  const toggleFeaturedProduct = (id: string) => {
    setForm((f) => ({
      ...f,
      featured_product_ids: f.featured_product_ids.includes(id)
        ? f.featured_product_ids.filter((x) => x !== id)
        : f.featured_product_ids.length < 3
        ? [...f.featured_product_ids, id]
        : f.featured_product_ids,
    }))
  }

  const toggleRelatedArticle = (id: string) => {
    setForm((f) => ({
      ...f,
      related_article_ids: f.related_article_ids.includes(id)
        ? f.related_article_ids.filter((x) => x !== id)
        : f.related_article_ids.length < 3
        ? [...f.related_article_ids, id]
        : f.related_article_ids,
    }))
  }

  const filteredMainProducts = products.filter((p) =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  const filteredFeaturedProducts = products.filter((p) =>
    !featuredProductSearch || p.name.toLowerCase().includes(featuredProductSearch.toLowerCase())
  )

  const filteredArticles = articles.filter((a) =>
    !articleSearch || a.title.toLowerCase().includes(articleSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.product_ids.length < 2) {
      setError('Selecione pelo menos 2 produtos para comparar.')
      return
    }
    setLoading(true)
    setError(null)

    const payload = {
      title: form.title,
      slug: form.slug,
      is_published: form.is_published,
      excerpt: form.excerpt || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      meta_keywords: form.meta_keywords || null,
      product_ids: form.product_ids,
      featured_product_ids: form.featured_product_ids,
      related_article_ids: form.related_article_ids,
      winner_id: null,
      criteria: {},
      summary: null,
      published_at: form.is_published ? new Date().toISOString() : null,
    }

    const { error } = await supabase.from('comparisons').insert(payload)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/admin/comparacoes'), 1200)
    }
    setLoading(false)
  }

  return (
    <AdminShell title="Nova Comparação">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nova Comparação</h2>
          <p className="text-gray-500 text-sm">Preencha os dados da comparação</p>
        </div>

        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">Comparação criada com sucesso! Redirecionando...</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Informações Básicas</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título do Comparativo *</label>
              <input type="text" required value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug * <span className="text-gray-400 font-normal text-xs">URL: /comparar/{form.slug || 'slug'}</span>
              </label>
              <input type="text" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
            </div>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium text-gray-700">Publicar comparação</span>
                <p className="text-xs text-gray-400 mt-0.5">Visível no site imediatamente</p>
              </div>
              <div onClick={() => setForm((f) => ({ ...f, is_published: !f.is_published }))} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.is_published ? 'bg-teal-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_published ? 'translate-x-5' : ''}`} />
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resumo/Introdução <span className="text-gray-400 font-normal">{form.excerpt.length}/500</span>
              </label>
              <textarea maxLength={500} rows={4} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none" />
            </div>
          </div>

          {/* Produtos para Comparar */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Produtos para Comparar</h3>
              <span className={`text-sm ${form.product_ids.length < 2 ? 'text-red-500' : 'text-gray-500'}`}>
                {form.product_ids.length} selecionados (min. 2)
              </span>
            </div>

            <input type="text" placeholder="Buscar produto..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />

            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {filteredMainProducts.slice(0, 20).map((p) => (
                <label key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={form.product_ids.includes(p.id)} onChange={() => toggleMainProduct(p.id)} className="rounded accent-teal-600" />
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-10 h-10 object-contain rounded" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.category} · {formatBRL(p.price)}</div>
                  </div>
                </label>
              ))}
              {filteredMainProducts.length === 0 && <div className="p-4 text-center text-gray-400 text-sm">Nenhum produto encontrado.</div>}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">SEO Avançado</h3>
              <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">SEO</span>
            </div>
            {(form.slug || form.title) && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-xs text-gray-400 mb-2">Pré-visualização no Google</p>
                <p className="text-green-700 text-sm">mercadoai.com › comparar › {form.slug || 'slug'}</p>
                <p className="text-blue-700 text-base font-medium mt-0.5">{form.meta_title || form.title || 'Título'}</p>
                <p className="text-gray-600 text-sm mt-0.5">{form.meta_description || form.excerpt || 'Descrição...'}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title <span className="text-gray-400 font-normal">{form.meta_title.length}/60</span></label>
              <input type="text" maxLength={60} value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description <span className="text-gray-400 font-normal">{form.meta_description.length}/160</span></label>
              <textarea maxLength={160} rows={2} value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Palavras-chave</label>
              <input type="text" value={form.meta_keywords} onChange={(e) => setForm((f) => ({ ...f, meta_keywords: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
            </div>
          </div>

          {/* Produtos em Destaque */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Produtos em Destaque</h3>
                <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">Sidebar</span>
              </div>
              <span className="text-sm text-gray-500">{form.featured_product_ids.length}/3</span>
            </div>
            <input type="text" placeholder="Buscar produto complementar..." value={featuredProductSearch} onChange={(e) => setFeaturedProductSearch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {filteredFeaturedProducts.slice(0, 20).map((p) => (
                <label key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={form.featured_product_ids.includes(p.id)} onChange={() => toggleFeaturedProduct(p.id)} disabled={!form.featured_product_ids.includes(p.id) && form.featured_product_ids.length >= 3} className="rounded accent-teal-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-400">{p.category} · {formatBRL(p.price)}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Artigos Relacionados */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Artigos Relacionados</h3>
                <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">Sidebar</span>
              </div>
              <span className="text-sm text-gray-500">{form.related_article_ids.length}/3</span>
            </div>
            <input type="text" placeholder="Buscar artigo..." value={articleSearch} onChange={(e) => setArticleSearch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {filteredArticles.slice(0, 20).map((a) => (
                <label key={a.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={form.related_article_ids.includes(a.id)} onChange={() => toggleRelatedArticle(a.id)} disabled={!form.related_article_ids.includes(a.id) && form.related_article_ids.length >= 3} className="rounded accent-teal-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{a.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${TYPE_COLORS[a.type] ?? 'bg-gray-100 text-gray-600'}`}>{a.type}</span>
                      <span className="text-xs text-gray-400">{a.category}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => router.push('/admin/comparacoes')} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium rounded-lg text-sm transition-colors">
              {loading ? 'Salvando...' : '✦ Publicar Comparação'}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  )
}
