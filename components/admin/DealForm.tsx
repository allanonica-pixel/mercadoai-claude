'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Deal } from '@/lib/supabase/types'
import { CATEGORIES, MARKETPLACES } from '@/constants/categories'
import { triggerRevalidation } from '@/lib/revalidate'

interface DealFormProps {
  deal?: Deal
}

const EMPTY: Partial<Deal> = {
  title: '',
  product_name: '',
  category: 'Eletrônicos',
  discount_pct: 0,
  deal_price: 0,
  original_price: 0,
  marketplace: 'Mercado Livre',
  seller: '',
  affiliate_url: '',
  image_url: '',
  free_shipping: false,
  expires_at: null,
  is_active: true,
}

export default function DealForm({ deal }: DealFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = Boolean(deal)

  const [form, setForm] = useState<Partial<Deal>>(deal ?? EMPTY)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (form.deal_price && form.original_price && form.original_price > form.deal_price) {
      const pct = Math.round(((form.original_price - form.deal_price) / form.original_price) * 100)
      setForm((f) => ({ ...f, discount_pct: pct }))
    }
  }, [form.deal_price, form.original_price])

  const set = (key: keyof Deal, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }))

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title?.trim()) e.title = 'Título obrigatório'
    if (!form.product_name?.trim()) e.product_name = 'Nome do produto obrigatório'
    if (!form.deal_price || form.deal_price <= 0) e.deal_price = 'Preço obrigatório'
    if (!form.original_price || form.original_price <= 0) e.original_price = 'Preço original obrigatório'
    if (!form.marketplace) e.marketplace = 'Marketplace obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)

    const payload = {
      title: form.title!.trim(),
      product_name: form.product_name!.trim(),
      category: form.category || null,
      discount_pct: form.discount_pct ?? 0,
      deal_price: form.deal_price!,
      original_price: form.original_price!,
      marketplace: form.marketplace!,
      seller: form.seller || null,
      affiliate_url: form.affiliate_url || null,
      image_url: form.image_url || null,
      free_shipping: form.free_shipping ?? false,
      expires_at: form.expires_at || null,
      is_active: form.is_active ?? true,
    }

    let error
    if (isEditing) {
      ;({ error } = await supabase.from('deals').update(payload).eq('id', deal!.id))
    } else {
      ;({ error } = await supabase.from('deals').insert(payload))
    }

    setLoading(false)
    setShowConfirm(false)

    if (error) { setErrors({ _: error.message }); return }

    // Invalida cache das páginas públicas de ofertas
    triggerRevalidation('deal')

    setSuccess(true)
    setTimeout(() => router.push('/admin/deals'), 2000)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Deal {isEditing ? 'atualizado' : 'cadastrado'} com sucesso!</h2>
        <p className="text-gray-500 text-sm">Redirecionando...</p>
      </div>
    )
  }

  return (
    <>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{isEditing ? 'Salvar alterações?' : 'Cadastrar deal?'}</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                {loading ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Dados do Deal</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Título <span className="text-red-500">*</span></label>
              <input type="text" value={form.title ?? ''} onChange={(e) => set('title', e.target.value)}
                placeholder="Ex: iPhone 14 com 30% de desconto na Amazon"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Produto <span className="text-red-500">*</span></label>
              <input type="text" value={form.product_name ?? ''} onChange={(e) => set('product_name', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
              {errors.product_name && <p className="text-xs text-red-500 mt-1">{errors.product_name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
                <select value={form.category ?? ''} onChange={(e) => set('category', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                  {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Marketplace <span className="text-red-500">*</span></label>
                <select value={form.marketplace ?? ''} onChange={(e) => set('marketplace', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                  {MARKETPLACES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço Deal <span className="text-red-500">*</span></label>
                <input type="number" min={0} step={0.01} value={form.deal_price ?? ''} onChange={(e) => set('deal_price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                {errors.deal_price && <p className="text-xs text-red-500 mt-1">{errors.deal_price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço Original <span className="text-red-500">*</span></label>
                <input type="number" min={0} step={0.01} value={form.original_price ?? ''} onChange={(e) => set('original_price', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                {errors.original_price && <p className="text-xs text-red-500 mt-1">{errors.original_price}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Desconto %</label>
                <input type="number" value={form.discount_pct ?? 0} readOnly
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">URL de Afiliado</label>
                <input type="url" value={form.affiliate_url ?? ''} onChange={(e) => set('affiliate_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">URL da Imagem</label>
                <input type="url" value={form.image_url ?? ''} onChange={(e) => set('image_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Data de Expiração</label>
              <input type="datetime-local" value={form.expires_at ? form.expires_at.slice(0, 16) : ''}
                onChange={(e) => set('expires_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
              <p className="text-xs text-gray-400 mt-1">Deixe em branco para deal sem expiração</p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            {errors._ && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">{errors._}</div>}
            <button onClick={() => { if (validate()) setShowConfirm(true) }}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-sm transition-colors">
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Deal'}
            </button>
            <button onClick={() => router.push('/admin/deals')}
              className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">Cancelar</button>
          </section>

          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Configurações</h2>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Frete Grátis</span>
              <button type="button" onClick={() => set('free_shipping', !form.free_shipping)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.free_shipping ? 'bg-rose-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.free_shipping ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">Deal Ativo</span>
              <button type="button" onClick={() => set('is_active', !form.is_active)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-rose-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </label>
          </section>
        </div>
      </div>
    </>
  )
}
