import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatBRL, formatDate } from '@/lib/utils'
import DeleteButton from '@/components/admin/DeleteButton'

export default async function AdminDealsPage() {
  const supabase = await createClient()

  const { data: deals } = await supabase
    .from('deals')
    .select('id, title, product_name, category, deal_price, discount_pct, marketplace, is_active, expires_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-sm text-gray-500 mt-1">{deals?.length ?? 0} deal(s) cadastrado(s)</p>
        </div>
        <Link
          href="/admin/deals/novo"
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Novo Deal
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {deals && deals.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Desconto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marketplace</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expira</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1 max-w-xs">{deal.title}</p>
                    <p className="text-xs text-gray-400">{deal.product_name}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatBRL(deal.deal_price)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      -{deal.discount_pct}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{deal.marketplace}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {deal.expires_at ? formatDate(deal.expires_at) : 'Sem expiração'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${deal.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {deal.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <Link
                        href={`/admin/deals/${deal.id}`}
                        className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={deal.id} table="deals" label={deal.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Nenhum deal cadastrado ainda.</p>
            <Link
              href="/admin/deals/novo"
              className="inline-flex items-center px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              + Criar primeiro deal
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
