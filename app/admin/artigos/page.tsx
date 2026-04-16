import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/supabase/types'
import { TYPE_COLORS } from '@/constants/categories'
import { formatDate } from '@/lib/utils'
import DeleteButton from '@/components/admin/DeleteButton'

export default async function AdminArtigosPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, type, category, is_featured, published_at, views')
    .order('published_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artigos</h1>
          <p className="text-sm text-gray-500 mt-1">{articles?.length ?? 0} artigo(s) no total</p>
        </div>
        <Link
          href="/admin/artigos/novo"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          + Novo Artigo
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {articles && articles.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Publicado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 line-clamp-1 max-w-xs">{article.title}</span>
                      {article.is_featured && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">Destaque</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">/artigo/{article.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TYPE_COLORS[article.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {article.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{article.category}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(article.published_at)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{article.views ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <a
                        href={`/artigo/${article.slug}`}
                        target="_blank"
                        className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                        rel="noopener noreferrer"
                      >
                        Ver
                      </a>
                      <Link
                        href={`/admin/artigos/${article.id}`}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={article.id} table="articles" label={article.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Nenhum artigo publicado ainda.</p>
            <Link
              href="/admin/artigos/novo"
              className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              + Criar primeiro artigo
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
