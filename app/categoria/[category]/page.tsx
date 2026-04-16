import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Article, Product } from '@/lib/supabase/types'
import { CATEGORIES, CATEGORY_SLUGS, TYPE_COLORS } from '@/constants/categories'
import { formatDate, formatBRL } from '@/lib/utils'
import { SITE_URL } from '@/lib/constants'
import ArticleCard from '@/components/ArticleCard'

export const revalidate = 3600

// Converte slug → nome da categoria
function slugToCategory(slug: string): string | undefined {
  return Object.entries(CATEGORY_SLUGS).find(([, s]) => s === slug)?.[0]
}

export async function generateStaticParams() {
  return Object.values(CATEGORY_SLUGS).map((slug) => ({ category: slug }))
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const categoryName = slugToCategory(params.category)
  if (!categoryName) return { title: 'Categoria não encontrada', robots: { index: false, follow: false } }

  const title = `${categoryName} | MercadoAI`
  const description = `Os melhores produtos, reviews e comparativos sobre ${categoryName.toLowerCase()} no MercadoAI.`
  const canonicalUrl = `${SITE_URL}/categoria/${params.category}`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl, siteName: 'MercadoAI', locale: 'pt_BR', type: 'website' },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  }
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  // Resolver slug para nome da categoria
  const categoryName = slugToCategory(params.category)
  if (!categoryName) notFound()

  const supabase = await createClient()

  // Buscar produtos E artigos da categoria em paralelo
  const [{ data: products }, { data: articles }] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('category', categoryName)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(8),
    supabase
      .from('articles')
      .select('*')
      .eq('category', categoryName)
      .order('published_at', { ascending: false })
      .limit(6),
  ])

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: categoryName, item: `${SITE_URL}/categoria/${params.category}` },
    ],
  }

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} — MercadoAI`,
    url: `${SITE_URL}/categoria/${params.category}`,
    description: `Os melhores produtos e artigos sobre ${categoryName}.`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: (articles ?? []).map((a: Article, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'Article', '@id': `${SITE_URL}/artigo/${a.slug}`, headline: a.title },
      })),
    },
  }

  return (
    <div className="pt-[104px] bg-gray-50 min-h-screen">

      {/* Hero dark */}
      <section className="bg-gray-950 text-white py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <Link href="/" className="hover:text-gray-300 transition-colors">Início</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-300">{categoryName}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-black mb-2">{categoryName}</h1>
          <p className="text-gray-400 text-base max-w-2xl">
            Os melhores produtos, reviews e comparativos sobre {categoryName.toLowerCase()} no MercadoAI.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* Produtos da categoria */}
        {products && products.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Produtos em {categoryName}</h2>
              <Link
                href={`/products?categoria=${params.category}`}
                className="text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((product: Product) => (
                <Link
                  key={product.id}
                  href={`/produto/${product.slug}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                >
                  <div className="aspect-square bg-gray-50 relative overflow-hidden">
                    {product.discount_pct && product.discount_pct > 0 && (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-black">
                        -{product.discount_pct}%
                      </span>
                    )}
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl opacity-20">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-gray-400 mb-1">{product.brand}</p>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 mb-2 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-lg font-black text-gray-900">{formatBRL(product.price)}</p>
                    {product.free_shipping && (
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">✓ Frete grátis</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Artigos da categoria */}
        {articles && articles.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Conteúdo sobre {categoryName}</h2>
              <Link href="/articles" className="text-sm font-semibold text-orange-500 hover:text-orange-600">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article: Article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {(!products?.length && !articles?.length) && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">📂</span>
            <p className="text-lg font-semibold text-gray-700">Nenhum conteúdo ainda em {categoryName}</p>
            <Link href="/" className="mt-4 text-orange-500 font-medium hover:underline text-sm">
              Voltar para o início
            </Link>
          </div>
        )}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
    </div>
  )
}
