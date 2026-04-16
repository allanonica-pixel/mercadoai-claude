'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'
import { CATEGORIES, MARKETPLACES, PRODUCT_BADGES } from '@/constants/categories'
import { Product } from '@/lib/supabase/types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function EditarProdutoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [form, setForm] = useState({
    name: '',
    slug: '',
    brand: '',
    category: '',
    subcategory: '',
    badge: '',
    price: '',
    original_price: '',
    marketplace: '',
    seller: '',
    rating: '',
    review_count: '',
    image_url: '',
    affiliate_url: '',
    free_shipping: false,
    is_deal: false,
    is_featured: false,
    is_active: true,
  })

  const [fetchLoading, setFetchLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      if (data) {
        const p = data as Product
        setForm({
          name: p.name ?? '',
          slug: p.slug ?? '',
          brand: p.brand ?? '',
          category: p.category ?? '',
          subcategory: p.subcategory ?? '',
          badge: p.badge ?? '',
          price: p.price?.toString() ?? '',
          original_price: p.original_price?.toString() ?? '',
          marketplace: p.marketplace ?? '',
          seller: p.seller ?? '',
          rating: p.rating?.toString() ?? '',
          review_count: p.review_count?.toString() ?? '',
          image_url: p.image_url ?? '',
          affiliate_url: p.affiliate_url ?? '',
          free_shipping: p.free_shipping ?? false,
          is_deal: p.is_deal ?? false,
          is_featured: p.is_featured ?? false,
          is_active: p.is_active ?? true,
        })
      }
      setFetchLoading(false)
    }
    fetchProduct()
  }, [id, supabase])

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: slugify(name) }))
  }

  const discount_pct =
    form.original_price && form.price && parseFloat(form.original_price) > parseFloat(form.price)
      ? Math.round((1 - parseFloat(form.price) / parseFloat(form.original_price)) * 100)
      : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      name: form.name,
      slug: form.slug,
      brand: form.brand || null,
      category: form.category,
      subcategory: form.subcategory || null,
      badge: form.badge || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      discount_pct,
      marketplace: form.marketplace || null,
      seller: form.seller || null,
      rating: form.rating ? parseFloat(form.rating) : 0,
      review_count: form.review_count ? parseInt(form.review_count) : 0,
      image_url: form.image_url || null,
      affiliate_url: form.affiliate_url || null,
      free_shipping: form.free_shipping,
      is_deal: form.is_deal,
      is_featured: form.is_featured,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('products').update(payload).eq('id', id)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/admin/produtos'), 1200)
    }
    setLoading(false)
  }

  const subcategories = form.category ? (CATEGORIES[form.category] ?? []) : []

  if (fetchLoading) {
    return (
      <AdminShell title="Editar Produto">
        <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>
      </AdminShell>
    )
  }

  return (
    <AdminShell title="Editar Produto">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Produto</h2>
          <p className="text-gray-500 text-sm mt-0.5">Atualize os dados do produto</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Produto atualizado com sucesso! Redirecionando...
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Informações Básicas</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
              <input type="text" required value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
              <input type="text" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input type="text" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                <select required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subcategory: '' }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="">Selecionar...</option>
                  {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoria</label>
                <select value={form.subcategory} onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))} disabled={subcategories.length === 0} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-400">
                  <option value="">Selecionar...</option>
                  {subcategories.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
              <select value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Nenhum</option>
                {PRODUCT_BADGES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Preço e Marketplace */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Preço e Marketplace</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço Atual (R$) *</label>
                <input type="number" required min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Original (R$)
                  {discount_pct !== null && <span className="ml-2 text-red-500 font-semibold">-{discount_pct}%</span>}
                </label>
                <input type="number" min="0" step="0.01" value={form.original_price} onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marketplace</label>
              <select value={form.marketplace} onChange={(e) => setForm((f) => ({ ...f, marketplace: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Selecionar...</option>
                {MARKETPLACES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor/Loja Oficial</label>
              <input type="text" value={form.seller} onChange={(e) => setForm((f) => ({ ...f, seller: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avaliação (0–5)</label>
                <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº de Reviews</label>
                <input type="number" min="0" value={form.review_count} onChange={(e) => setForm((f) => ({ ...f, review_count: e.target.value }))} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
          </div>

          {/* Mídia e Links */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Mídia e Links</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
              <input type="url" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://..." className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
              {form.image_url && <img src={form.image_url} alt="Preview" className="mt-2 h-24 object-contain rounded border border-gray-200" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link de Afiliado</label>
              <input type="url" value={form.affiliate_url} onChange={(e) => setForm((f) => ({ ...f, affiliate_url: e.target.value }))} placeholder="https://..." className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>

          {/* Configurações */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Configurações</h3>
            {[
              { key: 'free_shipping', label: 'Frete Grátis', desc: '' },
              { key: 'is_deal', label: 'Oferta do Dia', desc: 'Aparece na seção Ofertas do Dia da Home' },
              { key: 'is_featured', label: 'Produto em Destaque', desc: 'Aparece automaticamente na seção Produtos em Destaque na Home' },
              { key: 'is_active', label: 'Produto Ativo', desc: '' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
                </div>
                <div onClick={() => setForm((f) => ({ ...f, [key]: !f[key as keyof typeof f] }))} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form[key as keyof typeof form] ? 'bg-orange-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form[key as keyof typeof form] ? 'translate-x-5' : ''}`} />
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => router.push('/admin/produtos')} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-medium rounded-lg text-sm transition-colors">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  )
}
