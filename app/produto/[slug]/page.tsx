import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { Product } from '@/lib/supabase/types'
import { formatBRL } from '@/lib/utils'
import { CATEGORY_SLUGS } from '@/constants/categories'
import { SITE_URL } from '@/lib/constants'

export const revalidate = 3600

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data } = await supabase.from('products').select('slug').eq('is_active', true).limit(200)
  return (data ?? []).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, brand, category, price, image_url, slug')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!product) return { title: 'Produto não encontrado', robots: { index: false, follow: false } }

  const title = `${product.name} — Melhor Preço | MercadoAI`
  const description = `Compare o preço do ${product.name} ${product.brand ? `da ${product.brand}` : ''} nos principais marketplaces. Análise completa e oferta no MercadoAI.`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/produto/${params.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/produto/${params.slug}`,
      siteName: 'MercadoAI',
      images: product.image_url ? [{ url: product.image_url, width: 800, height: 800, alt: product.name }] : [],
      locale: 'pt_BR',
      type: 'website',
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!product) notFound()

  // Produtos relacionados (mesma categoria)
  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .eq('is_active', true)
    .neq('slug', params.slug)
    .order('is_featured', { ascending: false })
    .limit(4)

  const categorySlug = CATEGORY_SLUGS[product.category] ?? product.category.toLowerCase()
  const productUrl = `${SITE_URL}/produto/${params.slug}`

  const savings = product.original_price && product.original_price > product.price
    ? product.original_price - product.price
    : 0

  // JSON-LD Product schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: `${product.name} ${product.brand ? `da ${product.brand}` : ''} — Compare preços e confira a análise completa no MercadoAI.`,
    image: product.image_url ? [product.image_url] : [],
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: product.affiliate_url ?? productUrl,
      priceCurrency: 'BRL',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: product.marketplace ?? 'MercadoAI' },
    },
    aggregateRating: product.rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.review_count,
    } : undefined,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Produtos', item: `${SITE_URL}/products` },
      { '@type': 'ListItem', position: 3, name: product.category, item: `${SITE_URL}/categoria/${categorySlug}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: productUrl },
    ],
  }

  return (
    <div className="pt-[104px] bg-gray-50 min-h-screen">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href="/products" className="hover:text-gray-600 transition-colors">Produtos</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <Link href={`/categoria/${categorySlug}`} className="hover:text-gray-600 transition-colors">{product.category}</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-gray-600 truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Produto principal */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-10">
          <div className="flex flex-col md:flex-row gap-0">

            {/* Imagem */}
            <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8 min-h-80">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full max-h-96 object-contain"
                  fetchPriority="high"
                />
              ) : (
                <span className="text-8xl opacity-20">📦</span>
              )}
            </div>

            {/* Info */}
            <div className="md:w-1/2 p-8 flex flex-col">

              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Link
                  href={`/categoria/${categorySlug}`}
                  className="px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold"
                >
                  {product.category}
                </Link>
                {product.badge && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                    {product.badge}
                  </span>
                )}
                {product.is_featured && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                    ⭐ Destaque
                  </span>
                )}
              </div>

              {/* Nome */}
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-2" itemProp="name">
                {product.name}
              </h1>

              {/* Marca + marketplace */}
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-5">
                {product.brand && <span>Marca: <strong className="text-gray-700">{product.brand}</strong></span>}
                {product.marketplace && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span>Via: <strong className="text-gray-700">{product.marketplace}</strong></span>
                  </>
                )}
              </div>

              {/* Avaliação */}
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-5">
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
                  <span className="text-sm text-gray-400">({product.review_count} avaliações)</span>
                </div>
              )}

              {/* Preços */}
              <div className="mb-6">
                {product.original_price && product.original_price > product.price && (
                  <p className="text-sm text-gray-400 line-through mb-0.5">
                    {formatBRL(product.original_price)}
                  </p>
                )}
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-black text-gray-900">{formatBRL(product.price)}</p>
                  {product.discount_pct && product.discount_pct > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-sm font-black">
                      -{product.discount_pct}%
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-sm font-semibold text-emerald-600 mt-1">
                    Você economiza {formatBRL(savings)}
                  </p>
                )}
                {product.free_shipping && (
                  <p className="text-sm text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Frete grátis
                  </p>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3 mt-auto">
                {product.affiliate_url ? (
                  <a
                    href={product.affiliate_url}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base transition-colors shadow-sm hover:shadow-orange-200"
                  >
                    Ver oferta no {product.marketplace ?? 'marketplace'}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <button disabled className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gray-200 text-gray-500 font-bold text-base cursor-not-allowed">
                    Oferta indisponível
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Especificações técnicas */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-200 p-8 mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Especificações técnicas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {Object.entries(product.specs).map(([key, value], i) => (
                <div key={key} className={`flex items-start gap-3 py-3 px-4 ${i % 2 === 0 ? 'sm:pr-8' : 'sm:pl-8'}`}>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[120px] mt-0.5">{key}</span>
                  <span className="text-sm text-gray-800 font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Produtos relacionados */}
        {related && related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Produtos relacionados</h2>
              <Link href={`/categoria/${categorySlug}`} className="text-sm font-semibold text-orange-500 hover:text-orange-600">
                Ver categoria →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p: Product) => (
                <Link
                  key={p.id}
                  href={`/produto/${p.slug}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                >
                  <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative">
                    {p.discount_pct && p.discount_pct > 0 && (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black">
                        -{p.discount_pct}%
                      </span>
                    )}
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-4xl opacity-20">📦</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-gray-400 mb-1">{p.brand}</p>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 mb-2 group-hover:text-orange-600 transition-colors">{p.name}</h3>
                    <p className="text-base font-black text-gray-900">{formatBRL(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </div>
  )
}
