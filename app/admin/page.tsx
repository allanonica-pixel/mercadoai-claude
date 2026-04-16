import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: totalProdutos },
    { count: totalArtigos },
    { count: totalDeals },
    { count: totalComparacoes },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('deals').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('comparisons').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      label: 'Produtos',
      value: totalProdutos ?? 0,
      href: '/admin/produtos',
      color: 'bg-orange-500',
      light: 'bg-orange-50 text-orange-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'Artigos',
      value: totalArtigos ?? 0,
      href: '/admin/artigos',
      color: 'bg-emerald-500',
      light: 'bg-emerald-50 text-emerald-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Deals Ativos',
      value: totalDeals ?? 0,
      href: '/admin/deals',
      color: 'bg-rose-500',
      light: 'bg-rose-50 text-rose-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      label: 'Comparações',
      value: totalComparacoes ?? 0,
      href: '/admin/comparacoes',
      color: 'bg-teal-500',
      light: 'bg-teal-50 text-teal-600',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
  ]

  const quickActions = [
    { label: 'Novo Produto', href: '/admin/produtos/novo', color: 'bg-orange-500 hover:bg-orange-600' },
    { label: 'Novo Artigo', href: '/admin/artigos/novo', color: 'bg-emerald-500 hover:bg-emerald-600' },
    { label: 'Novo Deal', href: '/admin/deals/novo', color: 'bg-rose-500 hover:bg-rose-600' },
    { label: 'Nova Comparação', href: '/admin/comparacoes/novo', color: 'bg-teal-500 hover:bg-teal-600' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral do conteúdo do Mercadoai</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, href, light, icon }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`p-2 rounded-lg ${light}`}>{icon}</span>
            </div>
            <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
            <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">{label}</p>
          </Link>
        ))}
      </div>

      {/* Ações rápidas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(({ label, href, color }) => (
            <Link
              key={href}
              href={href}
              className={`${color} text-white text-sm font-semibold px-4 py-3 rounded-lg text-center transition-colors`}
            >
              + {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
