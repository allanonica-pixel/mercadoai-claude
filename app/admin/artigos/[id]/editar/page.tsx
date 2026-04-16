'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'
import { CATEGORIES, ARTICLE_TYPES, TYPE_COLORS } from '@/constants/categories'
import { Article, Product } from '@/lib/supabase/types'
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

export default function EditarArtigoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [form, setForm] = useState({
    title: '',
    slug: '',
    type: '',
    category: '',
    subcategory: '',
    read_time: 5,
    excerpt: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    content: '',
    cover_image: '',
    is_featured: false,
    featured_product_ids: [] as string[],
    related_article_ids: [] as string[],
  })

  const [products, setProducts] = useState<Product[]>([])
  const [articles, setArticles] = useState<{id: string, title: string, type: string, category: string, read_time: number, cover_image: string | null}[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [productCategory, setProductCategory] = useState('')
  const [articleSearch, setArticleSearch] = useState('')
  const [articleType, setArticleType] = useState('')
  const [articleCategory, setArticleCategory] = useState('')
  const [fetchLoading, setFetchLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const [articleRes, productsRes, articlesRes] = await Promise.all([
        supabase.from('articles').select('*').eq('id', id).single(),
        supabase.from('products').select('*').order('name'),
        supabase.from('articles').select('id, title, type, category, read_time, cover_image').order('title'),
      ])
      if (articleRes.data) {
        const a = articleRes.data as Article
        setForm({
          title: a.title ?? '',
          slug: a.slug ?? '',
          type: a.type ?? '',
          category: a.category ?? '',
          subcategory: a.subcategory ?? '',
          read_time: a.read_time ?? 5,
          excerpt: a.excerpt ?? '',
          meta_title: a.meta_title ?? '',
          meta_description: a.meta_description ?? '',
          meta_keywords: a.meta_keywords ?? '',
          content: a.content ?? '',
          cover_image: a.cover_image ?? '',
          is_featured: a.is_featured ?? false,
          featured_product_ids: a.featured_product_ids ?? [],
          related_article_ids: a.related_article_ids ?? [],
        })
      }
      setProducts(productsRes.data ?? [])
      setArticles((articlesRes.data ?? []).filter((a) => a.id !== id))
      setFetchLoading(false)
    }
    loadData()
  }, [id])

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugify(title) }))
  }

  const toggleProduct = (pid: string) => {
    setForm((f) => ({
      ...f,
      featured_product_ids: f.featured_product_ids.includes(pid)
        ? f.featured_product_ids.filter((x) => x !== pid)
        : f.featured_product_ids.length < 3
        ? [...f.featured_product_ids, pid]
        : f.featured_product_ids,
    }))
  }

  const toggleRelatedArticle = (aid: string) => {
    setForm((f) => ({
      ...f,
      related_article_ids: f.related_article_ids.includes(aid)
        ? f.related_article_ids.filter((x) => x !== aid)
        : f.related_article_ids.length < 3
        ? [...f.related_article_ids, aid]
        : f.related_article_ids,
    }))
  }

  const filteredProducts = products.filter((p) => {
    const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
    const matchCat = !productCategory || p.category === productCategory
    return matchSearch && matchCat
  })

  const filteredArticles = articles.filter((a) => {
    const matchSearch = !articleSearch || a.title.toLowerCase().includes(articleSearch.toLowerCase())
    const matchType = !articleType || a.type === articleType
    const matchCat = !articleCategory || a.category === articleCategory
    return matchSearch && matchType && matchCat
  })

  const subcategories = form.category ? (CATEGORIES[form.category] ?? []) : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      title: form.title,
      slug: form.slug,
      type: form.type,
      category: form.category,
      subcategory: form.subcategory || null,
      read_time: form.read_time,
      excerpt: form.excerpt || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      meta_keywords: form.meta_keywords || null,
      content: form.content || null,
      cover_image: form.cover_image || null,
      is_featured: form.is_featured,
      featured_product_ids: form.featured_product_ids,
      related_article_ids: form.related_article_ids,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('articles').update(payload).eq('id', id)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/admin/artigos'), 1200)
    }
    setLoading(false)
  }

  if (fetchLoading) {
    return (
      <AdminShell title="Editar Artigo">
        <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Editar Artigo">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Editar Artigo</h2>
            <p className="text-gray-500 text-sm">Atualize os dados do artigo</p>
          </div>
          {form.slug && (
            <button type="button" onClick={() => window.open('/artigo/' + form.slug, '_blank')} className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
          )}
        </div>

        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">Artigo atualizado com sucesso! Redirecionando...</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Informações Básicas</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input type="text" required value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input type="text" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select required value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600">
                  <option value="">Selecionar...</option>
                  {ARTICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subcategory: '' }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600">
                  <option value="">Selecionar...</option>
                  {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoria</label>
                <select value={form.subcategory} onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))} disabled={subcategories.length === 0} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:bg-gray-50 disabled:text-gray-400">
                  <option value="">Selecionar...</option>
                  {subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Leitura (min)</label>
                <input type="number" min="1" value={form.read_time} onChange={(e) => setForm((f) => ({ ...f, read_time: parseInt(e.target.value) || 5 }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumo/Excerpt <span className="text-gray-400 font-normal">{form.excerpt.length}/150</span></label>
              <textarea maxLength={150} rows={3} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none" />
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
                <p className="text-green-700 text-sm">mercadoai.com › artigo › {form.slug}</p>
                <p className="text-blue-700 text-base font-medium mt-0.5">{form.meta_title || form.title}</p>
                <p className="text-gray-600 text-sm mt-0.5">{form.meta_description || form.excerpt}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title <span className="text-gray-400 font-normal">{form.meta_title.length}/60</span></label>
              <input type="text" maxLength={60} value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description <span className="text-gray-400 font-normal">{form.meta_description.length}/140</span></label>
              <textarea maxLength={140} rows={2} value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Palavras-chave</label>
              <input type="text" value={form.meta_keywords} onChange={(e) => setForm((f) => ({ ...f, meta_keywords: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Conteúdo do Artigo</h3>
            <textarea rows={12} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Digite o conteúdo completo do artigo aqui..." className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none" />
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
            <div className="flex gap-3">
              <input type="text" placeholder="Buscar produto..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Categoria ▼</option>
                {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {filteredProducts.slice(0, 20).map((p) => (
                <label key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={form.featured_product_ids.includes(p.id)} onChange={() => toggleProduct(p.id)} disabled={!form.featured_product_ids.includes(p.id) && form.featured_product_ids.length >= 3} className="rounded accent-teal-600" />
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-10 h-10 object-contain rounded" />}
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
            <div className="flex gap-3">
              <input type="text" placeholder="Buscar artigo..." value={articleSearch} onChange={(e) => setArticleSearch(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <select value={articleType} onChange={(e) => setArticleType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Tipo ▼</option>
                {ARTICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={articleCategory} onChange={(e) => setArticleCategory(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Categoria ▼</option>
                {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {filteredArticles.slice(0, 20).map((a) => (
                <label key={a.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={form.related_article_ids.includes(a.id)} onChange={() => toggleRelatedArticle(a.id)} disabled={!form.related_article_ids.includes(a.id) && form.related_article_ids.length >= 3} className="rounded accent-teal-600" />
                  {a.cover_image && <img src={a.cover_image} alt={a.title} className="w-12 h-8 object-cover rounded" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{a.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${TYPE_COLORS[a.type] ?? 'bg-gray-100 text-gray-600'}`}>{a.type}</span>
                      <span className="text-xs text-gray-400">{a.category} · {a.read_time} min</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Mídia */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Mídia</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
              <input type="text" value="Equipe Mercadoai" disabled className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de Capa (URL)</label>
              <input type="url" value={form.cover_image} onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))} placeholder="https://..." className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              {form.cover_image && <img src={form.cover_image} alt="Capa" className="mt-2 h-32 object-cover rounded-lg border border-gray-200 w-full" />}
            </div>
          </div>

          {/* Configurações */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Configurações</h3>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium text-gray-700">Artigo em Destaque</span>
                <p className="text-xs text-gray-400 mt-0.5">Aparece na seção de artigos em destaque</p>
              </div>
              <div onClick={() => setForm((f) => ({ ...f, is_featured: !f.is_featured }))} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.is_featured ? 'bg-teal-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-5' : ''}`} />
              </div>
            </label>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => router.push('/admin/artigos')} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2">
              {loading ? 'Salvando...' : '✦ Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  )
}
