import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { formatBRL } from '@/lib/utils'
import { SITE_URL } from '@/lib/constants'

export const revalidate = 3600

const SITE_NAME = 'Mercadoai'

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data: products } = await supabase
    .from('products')
    .select('slug')
    .eq('is_active', true)
    .limit(200)

  return (products ?? []).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, brand, category, price, image_url, marketplace')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!product) {
    return {
      title: 'Produto não encontrado | ' + SITE_NAME,
      robots: { index: false, follow: false },
    }
  }

  const title = `${product.name}${product.brand ? ` — ${product.brand}` : ''} | ${SITE_NAME}`
  const description = `${product.name} por ${formatBRL(product.price)} no ${product.marketplace ?? 'marketplace'}. Veja especificações, avaliações e onde comprar com o melhor preço.`
  const canonicalUrl = `${SITE_URL}/produto/${params.slug}`

  return {
    title,
    description,
    keywords: `${product.name}, ${product.brand ?? ''}, ${product.category}, comprar, preço, ${SITE_NAME}`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      ...(product.image_url
        ? { images: [{ url: product.image_url, width: 800, height: 800, alt: product.name }] }
        : {}),
    },
    twitter: {
      card: product.image_url ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(product.image_url ? { images: [product.image_url] } : {}),
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  }
}

export default async function ProdutoPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .maybeSingle()

  if (!product) notFound()

  // Produtos relacionados da mesma categoria
  const { data: related } = await supabase
    .from('products')
    .select('id, name, slug, image_url, price, discount_pct, rating')
    .eq('category', product.category)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: `${product.name} — ${product.category}${product.subcategory ? `, ${product.subcategory}` : ''}`,
    ...(product.image_url ? { image: product.image_url } : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/produto/${params.slug}`,
      priceCurrency: 'BRL',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: product.seller ?? product.marketplace ?? SITE_NAME },
    },
    ...(product.rating > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            bestRating: 5,
            ratingCount: product.review_count ?? 1,
          },
        }
      : {}),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: product.category, item: `${SITE_URL}/categoria/${encodeURIComponent(product.category)}` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE_URL}/produto/${params.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="pt-[104px]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-gray-900 transition-colors">Início</Link>
            <span>/</span>
            <Link href={`/categoria/${encodeURIComponent(product.category)}`} className="hover:text-gray-900 transition-colors">{product.category}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium line-clamp-1 max-w-xs">{product.name}</span>
          </nav>

          {/* Layout principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
            {/* Imagem */}
            <div className="bg-gray-50 rounded-2xl flex items-center justify-center p-8 min-h-[320px]">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="max-h-72 w-auto object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-300">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">Sem imagem</span>
                </div>
              )}
            </div>

            {/* Informações */}
            <div className="flex flex-col">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {product.category && (
                  <Link href={`/categoria/${encodeURIComponent(product.category)}`}
                    className="text-xs bg-orange-50 text-orange-600 font-semibold px-2.5 py-1 rounded-full hover:bg-orange-100 transition-colors">
                    {product.category}
                  </Link>
                )}
                {product.badge && (
                  <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
                {product.free_shipping && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">
                    Frete grátis
                  </span>
                )}
              </div>

              {product.brand && (
                <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
              )}

              <h1 className="text-xl font-bold text-gray-900 mb-4 leading-snug">{product.name}</h1>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                  {product.review_count > 0 && (
                    <span className="text-xs text-gray-400">({product.review_count} avaliações)</span>
                  )}
                </div>
              )}

              {/* Preço */}
              <div className="mb-6">
                {product.original_price && product.original_price > product.price && (
                  <p className="text-sm text-gray-400 line-through mb-0.5">{formatBRL(product.original_price)}</p>
                )}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-gray-900">{formatBRL(product.price)}</span>
                  {product.discount_pct && product.discount_pct > 0 && (
                    <span className="text-sm font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
                      -{product.discount_pct}%
                    </span>
                  )}
                </div>
                {product.marketplace && (
                  <p className="text-sm text-gray-500 mt-1">
                    Disponível em <span className="font-medium text-gray-700">{product.marketplace}</span>
                    {product.seller ? ` — Vendido por ${product.seller}` : ''}
                  </p>
                )}
              </div>

              {/* CTA */}
              {product.affiliate_url ? (
                <a
                  href={product.affiliate_url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-center text-sm transition-colors mb-3"
                >
                  Ver melhor preço em {product.marketplace ?? 'marketplace'} →
                </a>
              ) : null}

              <p className="text-xs text-gray-400 text-center">
                Ao clicar você será redirecionado para o site do parceiro. Este site pode receber comissão de afiliado.
              </p>
            </div>
          </div>

          {/* Especificações */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <section className="mb-12">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Especificações Técnicas</h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <tr key={key} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-gray-600 w-2/5">{key}</td>
                        <td className="px-5 py-3 text-gray-900">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Produtos relacionados */}
          {related && related.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Produtos similares em {product.category}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/produto/${r.slug}`}
                    className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-orange-200 hover:shadow-sm transition-all"
                  >
                    {r.image_url && (
                      <div className="bg-gray-50 rounded-lg flex items-center justify-center h-28 mb-3">
                        <img src={r.image_url} alt={r.name} className="max-h-24 w-auto object-contain" />
                      </div>
                    )}
                    <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                      {r.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-gray-900">{formatBRL(r.price)}</span>
                      {r.discount_pct && r.discount_pct > 0 && (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          -{r.discount_pct}%
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
