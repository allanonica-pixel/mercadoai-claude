import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/supabase/types'
import { SITE_URL } from '@/lib/constants'
import ArticleCard from '@/components/ArticleCard'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Guias de Compra',
  description: 'Guias completos e imparciais para você tomar a melhor decisão de compra. Comparamos especificações, preços e custo-benefício.',
  alternates: { canonical: `${SITE_URL}/guias` },
  openGraph: {
    title: 'Guias de Compra | MercadoAI',
    description: 'Guias completos para você tomar a melhor decisão de compra.',
    url: `${SITE_URL}/guias`,
    siteName: 'MercadoAI',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
}

export default async function GuiasPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('type', 'Guia de Compra')
    .order('published_at', { ascending: false })
    .limit(24)

  const total = articles?.length ?? 0

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Guias de Compra — MercadoAI',
    url: `${SITE_URL}/guias`,
    description: 'Guias completos e imparciais para você tomar a melhor decisão de compra.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Artigos', item: `${SITE_URL}/articles` },
        { '@type': 'ListItem', position: 3, name: 'Guias de Compra', item: `${SITE_URL}/guias` },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: (articles ?? []).map((a: Article, i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'Article', '@id': `${SITE_URL}/artigo/${a.slug}`, headline: a.title },
      })),
    },
  }

  return (
    <div className="pt-[104px]">

      {/* Hero dark */}
      <section className="bg-gray-950 text-white py-10 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-black mb-2">Guias de Compra</h1>
          <p className="text-gray-400 text-base max-w-2xl">
            Análises completas e imparciais para você escolher o produto certo, com comparações de preço e custo-benefício.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8" aria-label="Breadcrumb">
          <Link href="/articles" className="hover:text-gray-700 transition-colors">Todos os artigos</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">Guia de Compra</span>
          <span className="text-gray-400">{total} artigo{total !== 1 ? 's' : ''}</span>
        </nav>

        {/* Grid */}
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: Article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-6xl mb-4">📚</span>
            <p className="text-lg font-semibold text-gray-700">Nenhum guia publicado ainda</p>
            <Link href="/articles" className="mt-4 text-orange-500 font-medium hover:underline text-sm">
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
