'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Comparison, Product, Article } from '@/lib/supabase/types'
import { slugify } from '@/lib/utils'
import { TYPE_COLORS } from '@/constants/categories'
import { triggerRevalidation } from '@/lib/revalidate'

interface ComparisonFormProps {
  comparison?: Comparison
}

const EMPTY: Partial<Comparison> = {
  title: '',
  slug: '',
  product_ids: [],
  winner_id: null,
  criteria: {},
  summary: '',
  is_published: false,
  featured_product_ids: [],
  related_article_ids: [],
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
}

export default function ComparisonForm({ comparison }: ComparisonFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = Boolean(comparison)

  const [form, setForm] = useState<Partial<Comparison>>(comparison ?? EMPTY)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [newCriterion, setNewCriterion] = useState('')

  useEffect(() => {
    async function load() {
      const [{ data: products }, { data: articles }] = await Promise.all([
        supabase.from('products').select('id, name, image_url, category, price').eq('is_active', true).order('name'),
        supabase.from('articles').select('id, title, type, category').order('published_at', { ascending: false }).limit(200),
      ])
      setAllProducts((products ?? []) as unknown as Product[])
      setAllArticles((articles ?? []) as unknown as Article[])
    }
    load()
  }, [])

  useEffect(() => {
    if (!isEditing && form.title) {
      setForm((f) => ({ ...f, slug: slugify(form.title!) }))
    }
  }, [form.title, isEditing])

  const set = (key: keyof Comparison, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  function toggleProduct(id: string) {
    const ids = form.product_ids ?? []
    if (ids.includes(id)) {
      set('product_ids', ids.filter((x) => x !== id))
      if (form.winner_id === id) set('winner_id', null)
    } else {
      set('product_ids', [...ids, id])
    }
  }

  function toggleRelatedArticle(id: string) {
    const ids = form.related_article_ids ?? []
    if (ids.includes(id)) set('related_article_ids', ids.filter((x) => x !== id))
    else if (ids.length < 3) set('related_article_ids', [...ids, id])
  }

  function addCriterion() {
    if (!newCriterion.trim()) return
    const productCount = (form.product_ids ?? []).length
    const scores = Array(productCount).fill(5)
    setForm((f) => ({ ...f, criteria: { ...(f.criteria ?? {}), [newCriterion.trim()]: scores } }))
    setNewCriterion('')
  }

  function removeCriterion(key: string) {
    setForm((f) => {
      const c = { ...(f.criteria ?? {}) }
      delete c[key]
      return { ...f, criteria: c }
    })
  }

  function updateScore(criterion: string, productIndex: number, value: number) {
    setForm((f) => {
      const c = { ...(f.criteria ?? {}) }
      const scores = [...(c[criterion] ?? [])]
      scores[productIndex] = value
      c[criterion] = scores
      return { ...f, criteria: c }
    })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title?.trim()) e.title = 'Título obrigatório'
    if (!form.slug?.trim()) e.slug = 'Slug obrigatório'
    if ((form.product_ids ?? []).length < 2) e.products = 'Mínimo 2 produtos'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)

    const payload = {
      title: form.title!.trim(),
      slug: form.slug!.trim(),
      product_ids: form.product_ids ?? [],
      winner_id: form.winner_id || null,
      criteria: form.criteria ?? {},
      summary: form.summary || null,
      is_published: form.is_published ?? false,
      featured_product_ids: form.featured_product_ids ?? [],
      related_article_ids: form.related_article_ids ?? [],
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      meta_keywords: form.meta_keywords || null,
      published_at: isEditing ? comparison!.published_at : new Date().toISOString(),
    }

    let error
    if (isEditing) {
      ;({ error } = await supabase.from('comparisons').update(payload).eq('id', comparison!.id))
    } else {
      ;({ error } = await supabase.from('comparisons').insert(payload))
    }

    setLoading(false)
    setShowConfirm(false)

    if (error) { setErrors({ _: error.message }); return }

    // Invalida cache das páginas públicas de comparativos
    triggerRevalidation('comparison')

    setSuccess(true)
    setTimeout(() => router.push('/admin/comparacoes'), 2000)
  }

  const selectedProducts = (form.product_ids ?? [])
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p))

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  const metaTitleLen = (form.meta_title ?? '').length
  const metaDescLen = (form.meta_description ?? '').length

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Comparação {isEditing ? 'atualizada' : 'criada'} com sucesso!</h2>
        <p className="text-gray-500 text-sm">Redirecionando...</p>
      </div>
    )
  }

  return (
    <>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{isEditing ? 'Salvar alterações?' : 'Publicar comparação?'}</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                {loading ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Informações básicas */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Informações Básicas</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Título <span className="text-red-500">*</span></label>
              <input type="text" value={form.title ?? ''} onChange={(e) => set('title', e.target.value)}
                placeholder="Ex: iPhone 15 vs Samsung S24 — Qual é o Melhor?"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500">
                <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-300">/comparativo/</span>
                <input type="text" value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Resumo / Introdução</label>
              <textarea rows={4} maxLength={500} value={form.summary ?? ''} onChange={(e) => set('summary', e.target.value)}
                placeholder="Introdução sobre os produtos comparados..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>
          </section>

          {/* Seleção de produtos */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-1">Produtos a Comparar</h2>
            <p className="text-xs text-gray-400 mb-3">Mínimo 2 produtos. ({(form.product_ids ?? []).length} selecionados)</p>
            {errors.products && <p className="text-xs text-red-500 mb-2">{errors.products}</p>}

            <input type="search" placeholder="Buscar produto..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3" />

            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedProducts.map((p) => (
                  <span key={p.id} className="flex items-center gap-1.5 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1.5 rounded-full">
                    {p.image_url && <img src={p.image_url} alt="" className="w-5 h-5 object-contain" />}
                    {p.name.slice(0, 25)}
                    <button onClick={() => toggleProduct(p.id)} className="hover:text-red-500 ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}

            <div className="max-h-52 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-1">
              {filteredProducts.slice(0, 30).map((p) => {
                const selected = (form.product_ids ?? []).includes(p.id)
                return (
                  <button key={p.id} type="button" onClick={() => toggleProduct(p.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${selected ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50 text-gray-700'}`}>
                    <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${selected ? 'bg-teal-500 border-teal-500' : 'border-gray-300'}`}>
                      {selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    {p.image_url && <img src={p.image_url} alt="" className="w-6 h-6 object-contain flex-shrink-0" />}
                    <span className="line-clamp-1 flex-1">{p.name}</span>
                    <span className="text-gray-400 flex-shrink-0">{p.category}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Vencedor */}
          {selectedProducts.length >= 2 && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Definir Vencedor</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => set('winner_id', null)}
                  className={`p-3 rounded-lg border-2 text-xs font-medium transition-colors ${!form.winner_id ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
                >
                  Auto (por score)
                </button>
                {selectedProducts.map((p) => (
                  <button key={p.id} type="button" onClick={() => set('winner_id', p.id)}
                    className={`p-3 rounded-lg border-2 text-xs transition-colors ${form.winner_id === p.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-10 h-10 object-contain mx-auto mb-2" />}
                    <span className="line-clamp-1 font-medium text-gray-700">{p.name}</span>
                    {form.winner_id === p.id && (
                      <span className="inline-flex items-center gap-1 mt-1 text-amber-600">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Vencedor
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Critérios */}
          {selectedProducts.length >= 2 && (
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Critérios de Avaliação</h2>

              <div className="flex gap-2 mb-4">
                <input type="text" value={newCriterion} onChange={(e) => setNewCriterion(e.target.value)}
                  placeholder="Ex: Câmera, Bateria, Desempenho..."
                  onKeyDown={(e) => e.key === 'Enter' && addCriterion()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                <button onClick={addCriterion} type="button"
                  className="px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors">
                  + Adicionar
                </button>
              </div>

              {Object.entries(form.criteria ?? {}).map(([criterion, scores]) => (
                <div key={criterion} className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{criterion}</span>
                    <button onClick={() => removeCriterion(criterion)} className="text-xs text-red-400 hover:text-red-600">Remover</button>
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${selectedProducts.length}, 1fr)` }}>
                    {selectedProducts.map((p, i) => (
                      <div key={p.id}>
                        <label className="block text-xs text-gray-400 mb-1 truncate">{p.name.split(' ')[0]}</label>
                        <input type="number" min={0} max={10} step={0.5}
                          value={(scores as number[])[i] ?? 5}
                          onChange={(e) => updateScore(criterion, i, parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* SEO */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">SEO</h2>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Preview Google</p>
              <p className="text-xs text-emerald-700 mb-1">mercadoai.com › comparativo › {form.slug || 'slug'}</p>
              <p className="text-base text-blue-700 font-medium line-clamp-1">{form.meta_title || form.title || 'Título'}</p>
              <p className="text-sm text-gray-500 line-clamp-2">{form.meta_description || form.summary || 'Descrição...'}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                <span className={`text-xs font-medium ${metaTitleLen > 60 ? 'text-red-500' : metaTitleLen > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>{metaTitleLen}/60</span>
              </div>
              <input type="text" maxLength={70} value={form.meta_title ?? ''} onChange={(e) => set('meta_title', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                <span className={`text-xs font-medium ${metaDescLen > 160 ? 'text-red-500' : metaDescLen > 140 ? 'text-amber-500' : 'text-emerald-500'}`}>{metaDescLen}/160</span>
              </div>
              <textarea rows={3} maxLength={180} value={form.meta_description ?? ''} onChange={(e) => set('meta_description', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Palavras-chave</label>
              <input type="text" value={form.meta_keywords ?? ''} onChange={(e) => set('meta_keywords', e.target.value)}
                placeholder="comparativo, melhor smartphone, review..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            {errors._ && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">{errors._}</div>}
            <button onClick={() => { if (validate()) setShowConfirm(true) }}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg text-sm transition-colors">
              {isEditing ? 'Salvar Alterações' : 'Criar Comparação'}
            </button>
            <button onClick={() => router.push('/admin/comparacoes')}
              className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">Cancelar</button>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Configurações</h2>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Publicar Comparação</span>
              <button type="button" onClick={() => set('is_published', !form.is_published)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_published ? 'bg-teal-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
          </section>

          {/* Artigos Relacionados */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-1">Artigos Relacionados</h2>
            <p className="text-xs text-gray-400 mb-3">Até 3 ({(form.related_article_ids ?? []).length}/3)</p>

            {(form.related_article_ids ?? []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(form.related_article_ids ?? []).map((id) => {
                  const a = allArticles.find((x) => x.id === id)
                  if (!a) return null
                  return (
                    <span key={id} className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full">
                      {a.title.slice(0, 20)}
                      <button onClick={() => toggleRelatedArticle(id)} className="hover:text-red-500 ml-0.5">×</button>
                    </span>
                  )
                })}
              </div>
            )}

            <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-1">
              {allArticles.slice(0, 30).map((a) => {
                const selected = (form.related_article_ids ?? []).includes(a.id)
                return (
                  <button key={a.id} type="button" onClick={() => toggleRelatedArticle(a.id)}
                    disabled={!selected && (form.related_article_ids ?? []).length >= 3}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors ${selected ? 'bg-teal-50 text-teal-700' : 'hover:bg-gray-50 text-gray-700 disabled:opacity-40'}`}>
                    <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${selected ? 'bg-teal-500 border-teal-500' : 'border-gray-300'}`}>
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
