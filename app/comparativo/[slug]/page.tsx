import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { Comparison, Product, Article } from '@/lib/supabase/types'
import { formatBRL } from '@/lib/utils'
import { TYPE_COLORS } from '@/constants/categories'
import { SITE_URL } from '@/lib/constants'

export const revalidate = 3600

const SITE_NAME = 'Mercadoai'

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data: comparisons } = await supabase
    .from('comparisons')
    .select('slug')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(100)

  return (comparisons ?? []).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const supabase = await createClient()
  const { data: comparison } = await supabase
    .from('comparisons')
    .select('title, summary, meta_title, meta_description, meta_keywords, published_at, slug')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!comparison) {
    return {
      title: 'Comparativo não encontrado | ' + SITE_NAME,
      robots: { index: false, follow: false },
    }
  }

  const metaTitle = comparison.meta_title
    ? `${comparison.meta_title} | ${SITE_NAME}`
    : `${comparison.title} | ${SITE_NAME}`

  const metaDescription = comparison.meta_description
    ?? comparison.summary
    ?? `Comparativo detalhado: ${comparison.title}. Veja critérios, scores e quem vence na análise do ${SITE_NAME}.`

  const canonicalUrl = `${SITE_URL}/comparativo/${params.slug}`

  return {
    title: metaTitle,
    description: metaDescription.slice(0, 160),
    keywords: comparison.meta_keywords ?? `comparativo, ${comparison.title}, ${SITE_NAME}`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      title: metaTitle,
      description: metaDescription.slice(0, 160),
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      ...(comparison.published_at ? { publishedTime: new Date(comparison.published_at).toISOString() } : {}),
    },
    twitter: {
      card: 'summary',
      title: metaTitle,
      description: metaDescription.slice(0, 160),
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  }
}

export default async function ComparativoSlugPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  const { data: comparison } = await supabase
    .from('comparisons')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle()

  if (!comparison) notFound()

  // Buscar produtos da comparação
  let products: Product[] = []
  if (comparison.product_ids?.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('id', comparison.product_ids)
      .eq('is_active', true)
    products = (data ?? []) as Product[]
    // Preservar a ordem original dos product_ids
    products.sort(
      (a, b) => comparison.product_ids.indexOf(a.id) - comparison.product_ids.indexOf(b.id)
    )
  }

  // Buscar artigos relacionados
  let relatedArticles: Article[] = []
  if (comparison.related_article_ids?.length > 0) {
    const { data } = await supabase
      .from('articles')
      .select('id, title, slug, type, category, cover_image, read_time, excerpt')
      .in('id', comparison.related_article_ids)
    relatedArticles = (data ?? []) as unknown as Article[]
  }

  const winner = comparison.winner_id
    ? products.find((p) => p.id === comparison.winner_id) ?? null
    : null

  // Calcular vencedor automático por score se winner_id for null
  const autoWinner = !winner && products.length >= 2
    ? (() => {
        const totals = products.map((p, i) => ({
          product: p,
          total: Object.values(comparison.criteria ?? {}).reduce<number>(
            (sum, scores) => sum + ((scores as number[])[i] ?? 0),
            0
          ),
        }))
        totals.sort((a, b) => (b.total as number) - (a.total as number))
        return (totals[0].total as number) > (totals[1].total as number) ? totals[0].product : null
      })()
    : null

  const effectiveWinner = winner ?? autoWinner

  const criteriaEntries = Object.entries(comparison.criteria ?? {})

  // Schema.org
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: comparison.title,
    description: comparison.summary ?? comparison.title,
    url: `${SITE_URL}/comparativo/${params.slug}`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(comparison.published_at
      ? { datePublished: new Date(comparison.published_at).toISOString() }
      : {}),
  }

  const publishedLabel = comparison.published_at
    ? new Date(comparison.published_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="pt-[104px]">
        {/* Hero */}
        <div className="bg-gray-950 text-white py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">Início</Link>
              <span>/</span>
              <Link href="/comparativo" className="hover:text-white transition-colors">Comparativos</Link>
              <span>/</span>
              <span className="text-white line-clamp-1">{comparison.title}</span>
            </nav>

            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              Comparativo
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">{comparison.title}</h1>

            {comparison.summary && (
              <p className="text-gray-400 max-w-2xl text-sm leading-relaxed">{comparison.summary}</p>
            )}

            {publishedLabel && (
              <p className="text-xs text-gray-500 mt-3">{publishedLabel}</p>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

          {/* Cards dos produtos */}
          <section>
            <div className={`grid gap-4 ${products.length === 2 ? 'grid-cols-2' : products.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
              {products.map((product) => {
                const isWinner = effectiveWinner?.id === product.id
                return (
                  <div
                    key={product.id}
                    className={`relative bg-white rounded-xl border-2 p-5 flex flex-col items-center text-center transition-shadow ${
                      isWinner ? 'border-teal-400 shadow-md' : 'border-gray-200'
                    }`}
                  >
                    {isWinner && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Melhor escolha
                      </div>
                    )}

                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-20 h-20 object-contain mb-3"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{product.name}</h2>

                    {product.brand && (
                      <p className="text-xs text-gray-400 mb-2">{product.brand}</p>
                    )}

                    <p className="text-base font-bold text-gray-900 mb-1">{formatBRL(product.price)}</p>

                    {product.original_price && product.original_price > product.price && (
                      <p className="text-xs text-gray-400 line-through mb-1">{formatBRL(product.original_price)}</p>
                    )}

                    {product.discount_pct && product.discount_pct > 0 && (
                      <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full mb-2">
                        -{product.discount_pct}%
                      </span>
                    )}

                    {product.free_shipping && (
                      <span className="text-xs text-emerald-600 font-medium mb-2">Frete grátis</span>
                    )}

                    {product.affiliate_url && (
                      <a
                        href={product.affiliate_url}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className={`mt-auto w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                          isWinner
                            ? 'bg-teal-500 hover:bg-teal-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        Ver no {product.marketplace ?? 'marketplace'}
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Tabela de critérios */}
          {criteriaEntries.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Critérios de Avaliação</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">
                        Critério
                      </th>
                      {products.map((p) => (
                        <th
                          key={p.id}
                          className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center ${
                            effectiveWinner?.id === p.id ? 'text-teal-600' : 'text-gray-500'
                          }`}
                        >
                          <span className="line-clamp-1 block">{p.name.split(' ').slice(0, 2).join(' ')}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {criteriaEntries.map(([criterion, scores]) => {
                      const maxScore = Math.max(...(scores as number[]))
                      return (
                        <tr key={criterion} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 font-medium text-gray-700">{criterion}</td>
                          {products.map((p, i) => {
                            const score = (scores as number[])[i] ?? 0
                            const isBest = score === maxScore && maxScore > 0
                            return (
                              <td key={p.id} className="px-4 py-3 text-center">
                                <div className="flex flex-col items-center gap-1.5">
                                  <span className={`text-sm font-bold ${isBest ? 'text-teal-600' : 'text-gray-600'}`}>
                                    {score.toFixed(1)}
                                  </span>
                                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${isBest ? 'bg-teal-500' : 'bg-gray-400'}`}
                                      style={{ width: `${(score / 10) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}

                    {/* Linha de total */}
                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                      <td className="px-5 py-3 font-bold text-gray-900">Pontuação Total</td>
                      {products.map((p, i) => {
                        const total = criteriaEntries.reduce(
                          (sum, [, scores]) => sum + ((scores as number[])[i] ?? 0),
                          0
                        )
                        const isTopTotal = effectiveWinner?.id === p.id
                        return (
                          <td key={p.id} className="px-4 py-3 text-center">
                            <span className={`text-base font-black ${isTopTotal ? 'text-teal-600' : 'text-gray-700'}`}>
                              {total.toFixed(1)}
                            </span>
                          </td>
                        )
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-right">Escala de 0 a 10</p>
            </section>
          )}

          {/* Especificações lado a lado */}
          {products.some((p) => Object.keys(p.specs ?? {}).length > 0) && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Especificações Técnicas</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">
                        Especificação
                      </th>
                      {products.map((p) => (
                        <th
                          key={p.id}
                          className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center"
                        >
                          <span className="line-clamp-1 block">{p.name.split(' ').slice(0, 2).join(' ')}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[...new Set(products.flatMap((p) => Object.keys(p.specs ?? {})))].map((key) => (
                      <tr key={key} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-600">{key}</td>
                        {products.map((p) => (
                          <td key={p.id} className="px-4 py-3 text-center text-gray-700">
                            {p.specs?.[key] ?? <span className="text-gray-300">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Veredicto */}
          {effectiveWinner && (
            <section className="bg-teal-50 border border-teal-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-teal-800 mb-1">Veredicto</h2>
                  <p className="text-teal-700 text-sm">
                    <span className="font-semibold">{effectiveWinner.name}</span> se destaca neste comparativo
                    {!winner && ' pela pontuação total nos critérios avaliados'}.
                    {effectiveWinner.affiliate_url && (
                      <>
                        {' '}
                        <a
                          href={effectiveWinner.affiliate_url}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          className="font-semibold underline hover:text-teal-900 transition-colors"
                        >
                          Ver melhor preço →
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Artigos relacionados */}
          {relatedArticles.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Leia também</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedArticles.map((a) => (
                  <Link
                    key={a.id}
                    href={`/artigo/${a.slug}`}
                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                  >
                    {a.cover_image && (
                      <img
                        src={a.cover_image}
                        alt={a.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[a.type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {a.type}
                      </span>
                      <h3 className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {a.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Voltar */}
          <div className="pt-4 border-t border-gray-100">
            <Link
              href="/comparativo"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Ver todos os comparativos
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
