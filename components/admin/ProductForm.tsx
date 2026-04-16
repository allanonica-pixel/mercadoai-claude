'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/supabase/types'
import { CATEGORIES, MARKETPLACES, PRODUCT_BADGES } from '@/constants/categories'
import { slugify, formatBRL } from '@/lib/utils'
import { triggerRevalidation } from '@/lib/revalidate'

interface ProductFormProps {
  product?: Product
}

const EMPTY: Partial<Product> = {
  name: '',
  slug: '',
  category: 'Eletrônicos',
  subcategory: '',
  brand: '',
  marketplace: 'Mercado Livre',
  seller: '',
  price: 0,
  original_price: null,
  discount_pct: null,
  rating: 0,
  review_count: 0,
  image_url: '',
  affiliate_url: '',
  free_shipping: false,
  specs: {},
  badge: null,
  is_featured: false,
  is_active: true,
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = Boolean(product)

  const [form, setForm] = useState<Partial<Product>>(product ?? EMPTY)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [specKey, setSpecKey] = useState('')
  const [specValue, setSpecValue] = useState('')

  useEffect(() => {
    if (!isEditing && form.name) {
      setForm((f) => ({ ...f, slug: slugify(form.name!) }))
    }
  }, [form.name, isEditing])

  useEffect(() => {
    if (form.price && form.original_price && form.original_price > form.price) {
      const pct = Math.round(((form.original_price - form.price) / form.original_price) * 100)
      setForm((f) => ({ ...f, discount_pct: pct }))
    }
  }, [form.price, form.original_price])

  const set = (key: keyof Product, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  function addSpec() {
    if (!specKey.trim()) return
    setForm((f) => ({ ...f, specs: { ...(f.specs ?? {}), [specKey.trim()]: specValue.trim() } }))
    setSpecKey('')
    setSpecValue('')
  }

  function removeSpec(key: string) {
    setForm((f) => {
      const s = { ...(f.specs ?? {}) }
      delete s[key]
      return { ...f, specs: s }
    })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name?.trim()) e.name = 'Nome obrigatório'
    if (!form.slug?.trim()) e.slug = 'Slug obrigatório'
    if (!form.category) e.category = 'Categoria obrigatória'
    if (!form.price || form.price <= 0) e.price = 'Preço obrigatório'
    if (!form.affiliate_url?.trim()) e.affiliate_url = 'URL de afiliado obrigatória'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)

    const payload = {
      name: form.name!.trim(),
      slug: form.slug!.trim(),
      category: form.category!,
      subcategory: form.subcategory || null,
      brand: form.brand || null,
      marketplace: form.marketplace || null,
      seller: form.seller || null,
      price: form.price!,
      original_price: form.original_price || null,
      discount_pct: form.discount_pct || null,
      rating: form.rating ?? 0,
      review_count: form.review_count ?? 0,
      image_url: form.image_url || null,
      affiliate_url: form.affiliate_url!.trim(),
      free_shipping: form.free_shipping ?? false,
      specs: form.specs ?? {},
      badge: form.badge || null,
      is_featured: form.is_featured ?? false,
      is_active: form.is_active ?? true,
    }

    let error
    if (isEditing) {
      ;({ error } = await supabase.from('products').update(payload).eq('id', product!.id))
    } else {
      ;({ error } = await supabase.from('products').insert(payload))
    }

    setLoading(false)
    setShowConfirm(false)

    if (error) { setErrors({ _: error.message }); return }

    // Invalida cache das páginas públicas de produtos
    triggerRevalidation('product')

    setSuccess(true)
    setTimeout(() => router.push('/admin/produtos'), 2000)
  }

  const subcats = CATEGORIES[form.category ?? 'Eletrônicos'] ?? []

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Produto {isEditing ? 'atualizado' : 'cadastrado'} com sucesso!</h2>
        <p className="text-gray-500 text-sm">Redirecionando...</p>
      </div>
    )
  }

  return (
    <>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{isEditing ? 'Salvar alterações?' : 'Cadastrar produto?'}</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome <span className="text-red-500">*</span></label>
              <input type="text" value={form.name ?? ''} onChange={(e) => set('name', e.target.value)}
                placeholder="Nome do produto..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-500">
                <span className="px-3 py-2.5 bg-gray-50 text-gray-400 text-sm border-r border-gray-300">/produto/</span>
                <input type="text" value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria <span className="text-red-500">*</span></label>
                <select value={form.category ?? ''} onChange={(e) => { set('category', e.target.value); set('subcategory', '') }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subcategoria</label>
                {subcats.length > 0 ? (
                  <select value={form.subcategory ?? ''} onChange={(e) => set('subcategory', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="">Nenhuma</option>
                    {subcats.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input type="text" value={form.subcategory ?? ''} onChange={(e) => set('subcategory', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Marca</label>
                <input type="text" value={form.brand ?? ''} onChange={(e) => set('brand', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Marketplace</label>
                <select value={form.marketplace ?? ''} onChange={(e) => set('marketplace', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {MARKETPLACES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendedor</label>
              <input type="text" value={form.seller ?? ''} onChange={(e) => set('seller', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </section>

          {/* Preços */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Preços</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço <span className="text-red-500">*</span></label>
                <input type="number" min={0} step={0.01} value={form.price ?? ''} onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço Original</label>
                <input type="number" min={0} step={0.01} value={form.original_price ?? ''} onChange={(e) => set('original_price', parseFloat(e.target.value) || null)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Desconto %</label>
                <input type="number" min={0} max={100} value={form.discount_pct ?? ''} onChange={(e) => set('discount_pct', parseInt(e.target.value) || null)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" readOnly />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Avaliação (0-5)</label>
                <input type="number" min={0} max={5} step={0.1} value={form.rating ?? ''} onChange={(e) => set('rating', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nº de Reviews</label>
                <input type="number" min={0} value={form.review_count ?? ''} onChange={(e) => set('review_count', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          </section>

          {/* Mídia e links */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Mídia e Links</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">URL da Imagem</label>
              <input type="url" value={form.image_url ?? ''} onChange={(e) => set('image_url', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              {form.image_url && (
                <div className="mt-2 w-24 h-24 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">URL de Afiliado <span className="text-red-500">*</span></label>
              <input type="url" value={form.affiliate_url ?? ''} onChange={(e) => set('affiliate_url', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              {errors.affiliate_url && <p className="text-xs text-red-500 mt-1">{errors.affiliate_url}</p>}
            </div>
          </section>

          {/* Especificações */}
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Especificações Técnicas</h2>
            <div className="flex gap-2 mb-3">
              <input type="text" value={specKey} onChange={(e) => setSpecKey(e.target.value)}
                placeholder="Especificação (ex: RAM)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <input type="text" value={specValue} onChange={(e) => setSpecValue(e.target.value)}
                placeholder="Valor (ex: 8GB)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              <button onClick={addSpec} type="button"
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                + Adicionar
              </button>
            </div>
            {Object.entries(form.specs ?? {}).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">{k}:</span>
                  <span className="text-gray-500 ml-2">{v}</span>
                </div>
                <button onClick={() => removeSpec(k)} className="text-red-400 hover:text-red-600 text-xs transition-colors">Remover</button>
              </div>
            ))}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            {errors._ && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">{errors._}</div>}
            <button onClick={() => { if (validate()) setShowConfirm(true) }}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-sm transition-colors">
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </button>
            <button onClick={() => router.push('/admin/produtos')}
              className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Cancelar
            </button>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Configurações</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Badge</label>
              <select value={form.badge ?? ''} onChange={(e) => set('badge', e.target.value || null)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Sem badge</option>
                {PRODUCT_BADGES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Frete Grátis</span>
              <button type="button" onClick={() => set('free_shipping', !form.free_shipping)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.free_shipping ? 'bg-orange-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.free_shipping ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Produto em Destaque</span>
              <button type="button" onClick={() => set('is_featured', !form.is_featured)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_featured ? 'bg-orange-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_featured ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Produto Ativo</span>
              <button type="button" onClick={() => set('is_active', !form.is_active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-orange-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
          </section>
        </div>
      </div>
    </>
  )
}
