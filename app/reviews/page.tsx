import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/supabase/types'
import { SITE_URL } from '@/lib/constants'
import ArticleCard from '@/components/ArticleCard'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Reviews',
  description: 'Análises técnicas detalhadas e imparciais para você comprar com confiança. Reviews honestos dos melhores produtos.',
  alternates: { canonical: `${SITE_URL}/reviews` },
  openGraph: {
    title: 'Reviews | MercadoAI',
    description: 'Análises técnicas detalhadas e imparciais para você comprar com confiança.',
    url: `${SITE_URL}/reviews`,
    siteName: 'MercadoAI',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
}

export default async function ReviewsPage() {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('articles')
    .select('*')
    .eq('type', 'Review')
    .order('published_at', { ascending: false })
    .limit(24)

  const total = reviews?.length ?? 0

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Reviews — MercadoAI',
    url: `${SITE_URL}/reviews`,
    description: 'Análises técnicas detalhadas e imparciais para você comprar com confiança.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Artigos', item: `${SITE_URL}/artigos` },
        { '@type': 'ListItem', position: 3, name: 'Reviews', item: `${SITE_URL}/reviews` },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: (reviews ?? []).map((a: Article, i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Review',
          '@id': `${SITE_URL}/artigo/${a.slug}`,
          headline: a.title,
          description: a.excerpt ?? a.title,
          datePublished: a.published_at,
          dateModified: a.updated_at,
          author: { '@type': 'Person', name: a.author_name ?? 'MercadoAI' },
          publisher: { '@type': 'Organization', name: 'MercadoAI', logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
        },
      })),
    },
  }

  return (
    <div className="pt-[104px]">

      {/* Hero dark */}
      <section className="bg-gray-950 text-white py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2">Reviews</h1>
          <p className="text-gray-400 text-base max-w-2xl">
            Análises técnicas detalhadas e imparciais para você comprar com confiança.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8" aria-label="Breadcrumb">
          <Link href="/artigos" className="hover:text-gray-700 transition-colors">Todos os artigos</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">Review</span>
          <span className="text-gray-400">{total} artigo{total !== 1 ? 's' : ''}</span>
        </nav>

        {/* Grid */}
        {reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((article: Article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">📝</span>
            <p className="text-lg font-semibold text-gray-700">Nenhum review encontrado</p>
            <Link href="/artigos" className="mt-4 text-orange-500 font-medium hover:underline text-sm">
              Ver todos os artigos
            </Link>
          </div>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
    </div>
  )
}
