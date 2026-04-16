'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminShell from '@/components/admin/AdminShell'

type Tab = 'redes' | 'contato' | 'sobrenos' | 'faq'

interface FaqItem {
  id?: string
  question: string
  answer: string
  position: number
}

interface SiteConfig {
  social_instagram: string
  social_whatsapp: string
  social_facebook: string
  social_tiktok: string
  contact_email: string
  about_title: string
  about_content: string
}

const defaultConfig: SiteConfig = {
  social_instagram: '',
  social_whatsapp: '',
  social_facebook: '',
  social_tiktok: '',
  contact_email: '',
  about_title: 'Sobre o Mercadoai',
  about_content: '',
}

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('redes')
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [{ data: configData }, { data: faqData }] = await Promise.all([
        supabase.from('site_config').select('key, value'),
        supabase.from('faqs').select('*').order('position', { ascending: true }),
      ])

      if (configData) {
        const map: Record<string, string> = {}
        configData.forEach((row: { key: string; value: string }) => { map[row.key] = row.value })
        setConfig({
          social_instagram: map.social_instagram ?? '',
          social_whatsapp: map.social_whatsapp ?? '',
          social_facebook: map.social_facebook ?? '',
          social_tiktok: map.social_tiktok ?? '',
          contact_email: map.contact_email ?? '',
          about_title: map.about_title ?? 'Sobre o Mercadoai',
          about_content: map.about_content ?? '',
        })
      }

      if (faqData) {
        setFaqs(faqData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  async function saveConfig(keys: (keyof SiteConfig)[]) {
    setSaving(true)
    try {
      const rows = keys.map(key => ({ key, value: config[key] }))
      const { error } = await supabase.from('site_config').upsert(rows, { onConflict: 'key' })
      if (error) throw error
      showMessage('success', 'Configurações salvas com sucesso!')
    } catch (err: any) {
      showMessage('error', err.message ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function saveFaqs() {
    setSaving(true)
    try {
      // Delete all and re-insert with positions
      await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      const toInsert = faqs.map((f, i) => ({
        question: f.question,
        answer: f.answer,
        position: i + 1,
      }))
      if (toInsert.length > 0) {
        const { error } = await supabase.from('faqs').insert(toInsert)
        if (error) throw error
      }
      await loadData()
      showMessage('success', 'FAQs salvas com sucesso!')
    } catch (err: any) {
      showMessage('error', err.message ?? 'Erro ao salvar FAQs.')
    } finally {
      setSaving(false)
    }
  }

  function addFaq() {
    setFaqs(prev => [...prev, { question: '', answer: '', position: prev.length + 1 }])
  }

  function removeFaq(index: number) {
    if (!window.confirm('Excluir esta pergunta?')) return
    setFaqs(prev => prev.filter((_, i) => i !== index))
  }

  function moveFaq(index: number, direction: 'up' | 'down') {
    setFaqs(prev => {
      const arr = [...prev]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= arr.length) return arr
      ;[arr[index], arr[target]] = [arr[target], arr[index]]
      return arr
    })
  }

  function updateFaq(index: number, field: 'question' | 'answer', value: string) {
    setFaqs(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f))
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'redes', label: 'Redes Sociais', icon: '↗' },
    { key: 'contato', label: 'Contato', icon: '✉' },
    { key: 'sobrenos', label: 'Sobre Nós', icon: 'ℹ' },
    { key: 'faq', label: 'FAQ', icon: '💬' },
  ]

  return (
    <AdminShell title="Configurações">
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Site</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie redes sociais, contato, Sobre Nós e perguntas frequentes</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border border-gray-200 rounded-xl p-1 bg-gray-50 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : (
          <>
            {/* Redes Sociais */}
            {activeTab === 'redes' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-6">Configure os links das redes sociais que aparecem no rodapé e na página Sobre Nós.</p>
                <div className="space-y-5">
                  {[
                    { key: 'social_instagram' as const, label: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/mercadoai', color: 'text-pink-500' },
                    { key: 'social_whatsapp' as const, label: 'WhatsApp', icon: '💬', placeholder: 'https://wa.me/5511999999999', color: 'text-green-500' },
                    { key: 'social_facebook' as const, label: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/mercadoai', color: 'text-blue-500' },
                    { key: 'social_tiktok' as const, label: 'TikTok', icon: '🎵', placeholder: 'https://tiktok.com/@mercadoai', color: 'text-gray-900' },
                  ].map(({ key, label, icon, placeholder, color }) => (
                    <div key={key}>
                      <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${color}`}>
                        <span>{icon}</span> {label}
                      </label>
                      <input
                        type="url"
                        value={config[key]}
                        onChange={e => setConfig(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => saveConfig(['social_instagram', 'social_whatsapp', 'social_facebook', 'social_tiktok'])}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    💾 {saving ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              </div>
            )}

            {/* Contato */}
            {activeTab === 'contato' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-6">Configure o e-mail de contato exibido na página Sobre Nós e no rodapé.</p>
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <span className="text-orange-500">✉</span> E-mail de Contato
                  </label>
                  <input
                    type="email"
                    value={config.contact_email}
                    onChange={e => setConfig(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="contato@mercadoai.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Este e-mail aparece como link clicável na página Sobre Nós.</p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => saveConfig(['contact_email'])}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    💾 {saving ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              </div>
            )}

            {/* Sobre Nós */}
            {activeTab === 'sobrenos' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-6">Edite o título e o texto da página /sobrenos. Use linhas em branco para separar parágrafos.</p>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Título da Página</label>
                    <input
                      type="text"
                      value={config.about_title}
                      onChange={e => setConfig(prev => ({ ...prev, about_title: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Conteúdo</label>
                    <textarea
                      value={config.about_content}
                      onChange={e => setConfig(prev => ({ ...prev, about_content: e.target.value.slice(0, 5000) }))}
                      rows={12}
                      placeholder={'O Mercadoai é uma plataforma brasileira de comparação de preços...\n\nNossa história começa com...\n\nAcreditamos que...'}
                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{config.about_content.length}/5000</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-xs text-orange-700">
                    <span className="font-semibold">📌 Dica de conteúdo:</span> Inclua: origem da empresa, missão, como funcionam os reviews, política de afiliados e diferenciais. Isso fortalece o E-E-A-T (confiança) no Google.
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => saveConfig(['about_title', 'about_content'])}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    💾 {saving ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              </div>
            )}

            {/* FAQ */}
            {activeTab === 'faq' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Aparecem na página /sobrenos e geram rich snippets de FAQ no Google.</p>
                  </div>
                  <button
                    onClick={addFaq}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    + Nova Pergunta
                  </button>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveFaq(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded transition-colors"
                            title="Mover para cima"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveFaq(index, 'down')}
                            disabled={index === faqs.length - 1}
                            className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded transition-colors"
                            title="Mover para baixo"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeFaq(index)}
                            className="p-1.5 text-red-400 hover:text-red-600 rounded transition-colors ml-1"
                            title="Excluir"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                      {/* Body */}
                      <div className="p-5 space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pergunta</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={e => updateFaq(index, 'question', e.target.value)}
                            placeholder="Digite a pergunta..."
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Resposta</label>
                          <textarea
                            value={faq.answer}
                            onChange={e => updateFaq(index, 'answer', e.target.value.slice(0, 500))}
                            rows={3}
                            placeholder="Digite a resposta..."
                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200 resize-none"
                          />
                          <p className="text-xs text-gray-400 text-right mt-0.5">{faq.answer.length}/500</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {faqs.length === 0 && (
                    <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                      <p className="text-sm">Nenhuma pergunta cadastrada ainda.</p>
                      <button onClick={addFaq} className="mt-2 text-sm text-orange-500 font-medium hover:underline">
                        + Adicionar primeira pergunta
                      </button>
                    </div>
                  )}
                </div>

                {/* Rich snippets info */}
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-xs text-emerald-700">
                    <span className="font-semibold">✦ Rich Snippets de FAQ no Google —</span> As perguntas cadastradas aqui geram Schema.org FAQPage automaticamente, habilitando a exibição de perguntas e respostas diretamente nos resultados de busca do Google.
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={saveFaqs}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    💾 {saving ? 'Salvando...' : 'Salvar Configurações'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminShell>
  )
}
