'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Article, Product } from '@/lib/supabase/types'
import { CATEGORIES, ARTICLE_TYPES, TYPE_COLORS, DEFAULT_AUTHOR_NAME } from '@/constants/categories'
import { slugify } from '@/lib/utils'
import { triggerRevalidation } from '@/lib/revalidate'

interface ArticleFormProps {
  article?: Article
}

const EMPTY: Partial<Article> = {
  title: '',
  slug: '',
  type: 'Review',
  category: 'Eletrônicos',
  subcategory: '',
  excerpt: '',
  content: '',
  cover_image: '',
  author_name: DEFAULT_AUTHOR_NAME,
  author_avatar: '',
  read_time: 5,
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  is_featured: false,
  featured_product_ids: [],
  related_article_ids: [],
}

export default function ArticleForm({ article }: ArticleFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = Boolean(article)

  const [form, setForm] = useState<Partial<Article>>(article ?? EMPTY)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Busca de produtos e artigos relacionados
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [articleSearch, setArticleSearch] = useState('')

  useEffect(() => {
    async function loadRelated() {
      const [{ data: products }, { data: articles }] = await Promise.all([
        supabase.from('products').select('id, name, image_url, category, subcategory').eq('is_active', true).order('name'),
        supabase.from('articles').select('id, title, type, category').order('published_at', { ascending: false }).limit(200),
      ])
      setAllProducts((products ?? []) as unknown as Product[])
      setAllArticles((articles ?? []) as unknown as Article[])
    }
    loadRelated()
  }, [])

  // Auto-slug do título
  useEffect(() => {
    if (!isEditing && form.title) {
      setForm((f) => ({ ...f, slug: slugify(form.title!) }))
    }
  }, [form.title, isEditing])

  // Auto meta_title
  useEffect(() => {
    if (!form.meta_title && form.title) {
      setForm((f) => ({ ...f, meta_title: form.title!.slice(0, 60) }))
    }
  }, [form.title])

  const set = (key: keyof Article, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggleProduct = (id: string) => {
    const ids = form.featured_product_ids ?? []
    if (ids.includes(id)) {
      set('featured_product_ids', ids.filter((x) => x !== id))
    } else if (ids.length < 3) {
      set('featured_product_ids', [...ids, id])
    }
  }

  const toggleArticle = (id: string) => {
    const ids = form.related_article_ids ?? []
    if (ids.includes(id)) {
      set('related_article_ids', ids.filter((x) => x !== id))
    } else if (ids.length < 3) {
      set('related_article_ids', [...ids, id])
    }
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title?.trim()) e.title = 'Título obrigatório'
    if (!form.slug?.trim()) e.slug = 'Slug obrigatório'
    if (!form.type) e.type = 'Tipo obrigatório'
    if (!form.category) e.category = 'Categoria obrigatória'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)

    const payload = {
      title: form.title!.trim(),
      slug: form.slug!.trim(),
      type: form.type!,
      category: form.category!,
      subcategory: form.subcategory || null,
      excerpt: form.excerpt || null,
      content: form.content || null,
      cover_image: form.cover_image || null,
      author_name: form.author_name || DEFAULT_AUTHOR_NAME,
      author_avatar: form.author_avatar || null,
      read_time: form.read_time ?? 5,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      meta_keywords: form.meta_keywords || null,
      is_featured: form.is_featured ?? false,
      featured_product_ids: form.featured_product_ids ?? [],
      related_article_ids: form.related_article_ids ?? [],
      published_at: isEditing ? article!.published_at : new Date().toISOString(),
    }

    let error
    if (isEditing) {
      ;({ error } = await supabase.from('articles').update(payload).eq('id', article!.id))
    } else {
      ;({ error } = await supabase.from('articles').insert(payload))
    }

    setLoading(false)
    setShowConfirm(false)

    if (error) {
      setErrors({ _: error.message })
      return
    }

    // Invalida cache das páginas públicas de artigos
    triggerRevalidation('article')

    setSuccess(true)
    setTimeout(() => router.push('/admin/artigos'), 2000)
  }

  const subcats = CATEGORIES[form.category ?? 'Eletrônicos'] ?? []
  const metaTitleLen = (form.meta_title ?? '').length
  const metaDescLen = (form.meta_description ?? '').length

  const filteredProducts = allProducts.filter((p) =>
    `${p.name} ${p.category}`.toLowerCase().includes(productSearch.toLowerCase())
  )
  const filteredArticles = allArticles.filter(
    (a) =>
      a.id !== article?.id &&
      `${a.title} ${a.category}`.toLowerCase().includes(articleSearch.toLowerCase())
  )

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Artigo {isEditing ? 'atualizado' : 'publicado'} com sucesso!
        </h2>
        <p className="text-gray-500 text-sm">Redirecionando para a lista...</p>
      </div>
    )
  }

  return (
    <>
      {/* Modal de confirmação */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {isEditing ? 'Salvar alterações?' : 'Publicar artigo?'}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {isEditing
                ? 'As alterações serão salvas e o artigo atualizado no site.'
                : 'O artigo será publicado imediatamente e ficará visível no site.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : isEditing ? 'Sim, salvar' : 'Sim, publicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Informações básicas */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Informações Básicas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title ?? ''}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Título do artigo..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent">
                  <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-300">/artigo/</span>
                  <input
                    type="text"
                    value={form.slug ?? ''}
                    onChange={(e) => set('slug', e.target.value)}
                    className="flex-1 px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.type ?? 'Review'}
                    onChange={(e) => set('type', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {ARTICLE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Categoria <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category ?? 'Eletrônicos'}
                    onChange={(e) => { set('category', e.target.value); set('subcategory', '') }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.keys(CATEGORIES).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subcategoria</label>
                  {subcats.length > 0 ? (
                    <select
                      value={form.subcategory ?? ''}
                      onChange={(e) => set('subcategory', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Nenhuma</option>
                      {subcats.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.subcategory ?? ''}
                      onChange={(e) => set('subcategory', e.target.value)}
                      placeholder="Subcategoria livre..."
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tempo de leitura (min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={form.read_time ?? 5}
                    onChange={(e) => set('read_time', Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Excerpt / Resumo
                  <span className="text-gray-400 font-normal ml-1">({(form.excerpt ?? '').length}/300)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={form.excerpt ?? ''}
                  onChange={(e) => set('excerpt', e.target.value)}
                  placeholder="Resumo curto do artigo (aparece nos cards)..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          </section>

          {/* SEO Avançado */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">SEO Avançado</h2>

            {/* Preview Google */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Preview Google</p>
              <p className="text-xs text-emerald-700 mb-1">mercadoai.com › artigo › {form.slug || 'slug-do-artigo'}</p>
              <p className="text-base text-blue-700 font-medium line-clamp-1">
                {form.meta_title || form.title || 'Título do artigo'}
              </p>
              <p className="text-sm text-gray-500 line-clamp-2">
                {form.meta_description || form.excerpt || 'Descrição do artigo aparece aqui...'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                  <span className={`text-xs font-medium ${metaTitleLen > 60 ? 'text-red-500' : metaTitleLen > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {metaTitleLen}/60
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={70}
                  value={form.meta_title ?? ''}
                  onChange={(e) => set('meta_title', e.target.value)}
                  placeholder="Título otimizado para Google (máx 60 chars)..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                  <span className={`text-xs font-medium ${metaDescLen > 160 ? 'text-red-500' : metaDescLen > 140 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {metaDescLen}/160
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={180}
                  value={form.meta_description ?? ''}
                  onChange={(e) => set('meta_description', e.target.value)}
                  placeholder="Descrição para motores de busca (máx 160 chars)..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Palavras-chave
                  <span className="text-gray-400 font-normal ml-1">(separadas por vírgula)</span>
                </label>
                <input
                  type="text"
                  value={form.meta_keywords ?? ''}
                  onChange={(e) => set('meta_keywords', e.target.value)}
                  placeholder="melhor smartphone, review, custo-benefício..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {form.meta_keywords && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.meta_keywords.split(',').filter(Boolean).map((kw, i) => (
                      <span key={i} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Conteúdo */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Conteúdo do Artigo</h2>
            <textarea
              rows={18}
              value={form.content ?? ''}
              onChange={(e) => set('content', e.target.value)}
              placeholder="Escreva o conteúdo do artigo aqui. Suporta HTML básico para formatação."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
            />
          </section>
        </div>

        {/* Coluna sidebar */}
        <div className="space-y-6">

          {/* Publicar */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            {errors._ && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                {errors._}
              </div>
            )}
            <button
              onClick={() => { if (validate()) setShowConfirm(true) }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-sm transition-colors"
            >
              {isEditing ? 'Salvar Alterações' : 'Publicar Artigo'}
            </button>
            <button
              onClick={() => router.push('/admin/artigos')}
              className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </section>

          {/* Autor e mídia */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Autor e Mídia</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Autor</label>
              <input
                type="text"
                value={form.author_name ?? DEFAULT_AUTHOR_NAME}
                onChange={(e) => set('author_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Avatar URL</label>
              <input
                type="url"
                value={form.author_avatar ?? ''}
                onChange={(e) => set('author_avatar', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagem de Capa URL</label>
              <input
                type="url"
                value={form.cover_image ?? ''}
                onChange={(e) => set('cover_image', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {form.cover_image && (
                <div className="mt-2 h-32 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={form.cover_image}
                    alt="Preview da capa"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
            </div>
          </section>

          {/* Configurações */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Configurações</h2>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Artigo em Destaque</span>
              <button
                type="button"
                onClick={() => set('is_featured', !form.is_featured)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_featured ? 'bg-emerald-500' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_featured ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
          </section>

          {/* Produtos em Destaque */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-1">Produtos em Destaque</h2>
            <p className="text-xs text-gray-400 mb-3">Até 3 produtos na sidebar ({(form.featured_product_ids ?? []).length}/3)</p>

            <input
              type="search"
              placeholder="Buscar produto..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
            />

            {/* Selecionados */}
            {(form.featured_product_ids ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(form.featured_product_ids ?? []).map((id) => {
                  const p = allProducts.find((x) => x.id === id)
                  if (!p) return null
                  return (
                    <span key={id} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">
                      {p.name.slice(0, 20)}
                      <button onClick={() => toggleProduct(id)} className="hover:text-red-500 ml-0.5">×</button>
                    </span>
                  )
                })}
              </div>
            )}

            <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-1">
              {filteredProducts.slice(0, 30).map((p) => {
                const selected = (form.featured_product_ids ?? []).includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleProduct(p.id)}
                    disabled={!selected && (form.featured_product_ids ?? []).length >= 3}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${
                      selected ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50 text-gray-700 disabled:opacity-40'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${selected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                      {selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    <span className="line-clamp-1">{p.name}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Artigos Relacionados */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-1">Artigos Relacionados</h2>
            <p className="text-xs text-gray-400 mb-3">Até 3 artigos na sidebar ({(form.related_article_ids ?? []).length}/3)</p>

            <input
              type="search"
              placeholder="Buscar artigo..."
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
            />

            {(form.related_article_ids ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(form.related_article_ids ?? []).map((id) => {
                  const a = allArticles.find((x) => x.id === id)
                  if (!a) return null
                  return (
                    <span key={id} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full">
                      {a.title.slice(0, 20)}
                      <button onClick={() => toggleArticle(id)} className="hover:text-red-500 ml-0.5">×</button>
                    </span>
                  )
                })}
              </div>
            )}

            <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-1">
              {filteredArticles.slice(0, 30).map((a) => {
                const selected = (form.related_article_ids ?? []).includes(a.id)
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleArticle(a.id)}
                    disabled={!selected && (form.related_article_ids ?? []).length >= 3}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${
                      selected ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50 text-gray-700 disabled:opacity-40'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${selected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                      {selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    <div className="min-w-0">
                      <span className="line-clamp-1 block">{a.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${TYPE_COLORS[a.type] ?? 'bg-gray-100 text-gray-500'}`}>{a.type}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
