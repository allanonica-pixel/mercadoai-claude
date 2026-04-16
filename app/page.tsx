import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES, CATEGORY_SLUGS } from '@/constants/categories'
import { TYPE_COLORS } from '@/constants/categories'
import { formatBRL } from '@/lib/utils'
import NewsletterForm from '@/components/NewsletterForm'

export const revalidate = 3600

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: featuredProducts },
    { data: latestArticles },
    { data: activeDeals },
  ] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('updated_at', { ascending: false })
      .limit(8),
    supabase
      .from('articles')
      .select('id, title, slug, type, category, excerpt, cover_image, author_name, read_time, published_at')
      .order('published_at', { ascending: false })
      .limit(6),
    supabase
      .from('deals')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(4),
  ])

  const categoryIcons: Record<string, string> = {
    'Eletrônicos': '⚡',
    'Smartphones': '📱',
    'Notebooks': '💻',
    'Games': '🎮',
    'Eletrodomésticos': '🏠',
    'Fones': '🎧',
    'Smartwatches': '⌚',
    'Casa & Cozinha': '🍳',
  }

  return (
    <div className="pt-[104px]">

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 mb-4">
              Comparamos. Você economiza.
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
              Os melhores produtos<br />com os melhores preços
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Análises honestas, comparativos detalhados e as melhores ofertas dos principais marketplaces do Brasil.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/products"
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                Ver todos os produtos
              </Link>
              <Link
                href="/ofertas"
                className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border border-gray-200 transition-colors"
              >
                🔥 Ver ofertas do dia
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Deals em destaque */}
      {activeDeals && activeDeals.length > 0 && (
        <section className="bg-rose-50 border-b border-rose-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>
                <h2 className="text-xl font-bold text-gray-900">Ofertas do Dia</h2>
              </div>
              <Link href="/ofertas" className="text-sm font-semibold text-rose-600 hover:text-rose-700">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeDeals.map((deal) => (
                <a
                  key={deal.id}
                  href={deal.affiliate_url ?? '#'}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="bg-white rounded-xl border border-rose-100 p-4 hover:shadow-md transition-shadow group"
                >
                  {deal.image_url && (
                    <img
                      src={deal.image_url}
                      alt={deal.product_name}
                      className="w-full h-32 object-contain mb-3 rounded-lg"
                    />
                  )}
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors">
                    {deal.product_name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-gray-900">
                      {formatBRL(deal.deal_price)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                      -{deal.discount_pct}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-through mt-0.5">
                    {formatBRL(deal.original_price)}
                  </p>
                  {deal.free_shipping && (
                    <span className="mt-2 inline-block text-xs text-emerald-600 font-medium">
                      ✓ Frete grátis
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categorias */}
      <section className="py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Explorar por categoria</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {Object.keys(CATEGORIES)
              .filter((c) => c !== 'Geral')
              .map((cat) => (
                <Link
                  key={cat}
                  href={`/categoria/${CATEGORY_SLUGS[cat] ?? cat.toLowerCase()}`}
                  className="flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:bg-orange-50 hover:shadow-sm transition-all group"
                >
                  <span className="text-2xl">{categoryIcons[cat] ?? '📦'}</span>
                  <span className="text-xs font-medium text-gray-700 text-center group-hover:text-orange-600 transition-colors leading-tight">
                    {cat}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Produtos em destaque */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-12 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Produtos em destaque</h2>
              <Link href="/products" className="text-sm font-semibold text-orange-500 hover:text-orange-600">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/produto/${product.slug}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {product.image_url ? (
                    <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                  <div className="p-4">
                    {product.badge && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold mb-2">
                        {product.badge}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                    {product.brand && (
                      <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-black text-gray-900">
                        {formatBRL(product.price)}
                      </span>
                      {product.discount_pct && product.discount_pct > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-xs font-bold">
                          -{product.discount_pct}%
                        </span>
                      )}
                    </div>
                    {product.free_shipping && (
                      <p className="text-xs text-emerald-600 font-medium mt-1">✓ Frete grátis</p>
                    )}
                    {product.marketplace && (
                      <p className="text-xs text-gray-400 mt-1">{product.marketplace}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Últimos artigos */}
      {latestArticles && latestArticles.length > 0 && (
        <section className="py-12 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Conteúdo recente</h2>
              <Link href="/articles" className="text-sm font-semibold text-orange-500 hover:text-orange-600">
                Ver todos →
              </Link>
            </div>

            {/* Grid artigos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/artigo/${article.slug}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                >
                  {article.cover_image ? (
                    <div className="aspect-video bg-gray-100 overflow-hidden flex-shrink-0">
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-5xl opacity-30">📝</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[article.type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {article.type}
                      </span>
                      <span className="text-xs text-gray-400">{article.category}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors flex-1">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
                      <span>{article.author_name ?? 'Equipe MercadoAI'}</span>
                      <span>{article.read_time} min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Links por tipo */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/articles?categoria=Review" className="px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors">
                Reviews
              </Link>
              <Link href="/comparativo" className="px-4 py-2 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors">
                Comparativos
              </Link>
              <Link href="/guias" className="px-4 py-2 rounded-full border border-sky-200 bg-sky-50 text-sky-700 text-sm font-medium hover:bg-sky-100 transition-colors">
                Guias de Compra
              </Link>
              <Link href="/noticias" className="px-4 py-2 rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 transition-colors">
                Notícias
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Receba ofertas exclusivas</h2>
          <p className="text-gray-400 mb-8">
            Cadastre-se e seja o primeiro a saber das melhores promoções nos principais marketplaces.
          </p>
          <NewsletterForm />
        </div>
      </section>

    </div>
  )
}
