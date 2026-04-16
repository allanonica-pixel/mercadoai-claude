import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: productsCount },
    { count: articlesCount },
    { count: dealsCount },
    { count: comparisonsCount },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_deal', true),
    supabase.from('comparisons').select('*', { count: 'exact', head: true }),
  ])

  const metrics = [
    { label: 'Produtos', value: productsCount ?? 0, emoji: '🛍️', color: 'border-blue-200 bg-blue-50' },
    { label: 'Artigos', value: articlesCount ?? 0, emoji: '📄', color: 'border-teal-200 bg-teal-50' },
    { label: 'Deals Ativos', value: dealsCount ?? 0, emoji: '💎', color: 'border-amber-200 bg-amber-50' },
    { label: 'Comparações', value: comparisonsCount ?? 0, emoji: '⚖️', color: 'border-purple-200 bg-purple-50' },
  ]

  const quickActions = [
    { label: 'Novo Produto', href: '/admin/produtos/novo', color: 'bg-orange-500 hover:bg-orange-600' },
    { label: 'Novo Artigo', href: '/admin/artigos/novo', color: 'bg-teal-600 hover:bg-teal-700' },
    { label: 'Novo Deal', href: '/admin/ofertas', color: 'bg-red-500 hover:bg-red-600' },
    { label: 'Nova Comparação', href: '/admin/comparacoes/nova', color: 'bg-blue-600 hover:bg-blue-700' },
  ]

  return (
    <AdminShell title="Dashboard">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Visão geral do conteúdo do Mercadoai</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className={`bg-white rounded-xl border ${m.color} p-5`}>
              <div className="text-3xl mb-2">{m.emoji}</div>
              <div className="text-3xl font-bold text-gray-900">{m.value}</div>
              <div className="text-sm text-gray-500 mt-1">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`${action.color} text-white font-medium text-sm py-3 px-4 rounded-xl text-center transition-colors`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Info card */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <p className="text-orange-800 text-sm">
            <span className="font-semibold">Novo usuário admin?</span> Para criar um novo usuário admin, acesse o{' '}
            <span className="font-medium">Supabase Dashboard → Authentication → Users</span>, crie o usuário e adicione{' '}
            <code className="bg-orange-100 px-1 rounded text-xs">role: admin</code> nos metadados.
          </p>
        </div>
      </div>
    </AdminShell>
  )
}
