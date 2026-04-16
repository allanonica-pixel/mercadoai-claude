import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import DeleteButton from '@/components/admin/DeleteButton'

export default async function AdminComparacoesPage() {
  const supabase = await createClient()

  const { data: comparisons } = await supabase
    .from('comparisons')
    .select('id, title, slug, is_published, product_ids, published_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comparações</h1>
          <p className="text-sm text-gray-500 mt-1">{comparisons?.length ?? 0} comparação(ões) cadastrada(s)</p>
        </div>
        <Link
          href="/admin/comparacoes/novo"
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Nova Comparação
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {comparisons && comparisons.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Produtos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Publicado em</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comparisons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1 max-w-xs">{c.title}</p>
                    <span className="text-xs text-gray-400">/comparativo/{c.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.product_ids?.length ?? 0} produto(s)</td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.published_at ? formatDate(c.published_at) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {c.is_published ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      {c.is_published && (
                        <a
                          href={`/comparativo/${c.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          Ver
                        </a>
                      )}
                      <Link
                        href={`/admin/comparacoes/${c.id}`}
                        className="text-xs text-teal-600 hover:text-teal-800 font-medium transition-colors"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={c.id} table="comparisons" label={c.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Nenhuma comparação cadastrada ainda.</p>
            <Link
              href="/admin/comparacoes/novo"
              className="inline-flex items-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              + Criar primeira comparação
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
