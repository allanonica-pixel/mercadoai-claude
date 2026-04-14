import { Article } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, slugify } from '@/lib/utils'
import Link from 'next/link'
import { CATEGORIES } from '@/constants/categories'
import { SITE_URL } from '@/lib/constants'

export default async function ReviewsPage() {
  const supabase = createClient()

  // Buscar todos os reviews (artigos do tipo 'Review')
  const { data: reviews, error } = await supabase
    .from('articles')
    .select('*')
    .eq('type', 'Review')
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .limit(24)

  if (error) {
    console.error('Erro ao buscar reviews:', error)
  }

  // Gerar Schema.org JSON-LD para CollectionPage
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': reviews?.map((review: Article, index: number) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Review',
          '@id': `${SITE_URL}/artigo/${review.slug}`,
          'headline': review.title,
          'description': review.excerpt ?? review.title,
          'datePublished': review.published_at,
          'dateModified': review.updated_at,
          'author': {
            '@type': 'Person',
            'name': review.author_name ?? 'MercadoAI'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'MercadoAI',
            'logo': {
              '@type': 'ImageObject',
              'url': `${SITE_URL}/logo.png`
            }
          }
        }
      })) || []
    },
    'breadcrumb': {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Início',
          'item': `${SITE_URL}/`
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'Reviews',
          'item': `${SITE_URL}/reviews`
        }
      ]
    }
  }

  // Gerar Schema.org JSON-LD para Organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'MercadoAI',
    'url': SITE_URL,
    'logo': {
      '@type': 'ImageObject',
      'url': `${SITE_URL}/logo.png`,
      'width': 600,
      'height': 60,
      'caption': 'MercadoAI - Comparativos e Reviews de Produtos'
    },
    'sameAs': [
      `${SITE_URL}`,
      'https://www.facebook.com/mercadoai',
      'https://www.instagram.com/mercadoai',
      'https://www.youtube.com/@mercadoai'
    ]
  }

  return (
    <div className="pt-104">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Início
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-gray-900 font-medium">
              Reviews
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Reviews
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Análises detalhadas de produtos com testes reais, comparações objetivas e recomendações baseadas em dados.
          </p>
        </header>

        {/* Category Filter */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Filtrar por categoria</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/reviews"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Todos
            </Link>
            {CATEGORIES.slice(0, 8).map((category) => (
              <Link
                key={category}
                href={`/categoria/${encodeURIComponent(category)}`}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {category}
              </Link>
            ))}
            {CATEGORIES.length > 8 && (
              <Link
                href="/categorias"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Ver todas
              </Link>
            )}
          </div>
        </div>

        {/* Reviews Grid */}
        {reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review: Article) => (
              <article
                key={review.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                itemScope
                itemType="https://schema.org/Review"
              >
                <div className="p-6">
                  {/* Category badge */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                    {review.category}
                  </div>

                  {/* Review type badge */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                    Review
                  </div>

                  {/* Title */}
                  <h2
                    className="text-xl font-bold text-gray-900 mb-3 line-clamp-2"
                    itemProp="headline"
                  >
                    <Link
                      href={`/artigo/${review.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {review.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  {review.excerpt && (
                    <p
                      className="text-gray-600 mb-4 line-clamp-3"
                      itemProp="description"
                    >
                      {review.excerpt}
                    </p>
                  )}

                  {/* Author and date */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span itemProp="author" itemScope itemType="https://schema.org/Person">
                      <span itemProp="name">{review.author_name ?? 'MercadoAI'}</span>
                    </span>
                    <span className="mx-2">•</span>
                    <time
                      dateTime={review.published_at}
                      itemProp="datePublished"
                    >
                      {formatDateTime(review.published_at)}
                    </time>
                  </div>

                  {/* Read more link */}
                  <Link
                    href={`/artigo/${review.slug}`}
                    className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
                  >
                    Ler review completo
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nenhum review encontrado</h3>
            <p className="text-gray-600 mb-6">Não encontramos reviews ainda. Volte em breve!</p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para a página inicial
            </Link>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-16 flex justify-center">
          <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
            <button
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              disabled
            >
              Anterior
            </button>
            <button
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-600 text-sm font-medium text-white"
            >
              1
            </button>
            <button
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              2
            </button>
            <button
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              3
            </button>
            <button
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Próximo
            </button>
          </nav>
        </div>
      </div>

      {/* JSON-LD Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </div>
  )
}

// Gerar metadados dinâmicos para SEO
export async function generateMetadata() {
  return {
    title: 'Reviews | MercadoAI - Comparativos e Reviews de Produtos',
    description: 'Análises detalhadas de produtos com testes reais, comparações objetivas e recomendações baseadas em dados.',
    openGraph: {
      title: 'Reviews | MercadoAI - Comparativos e Reviews de Produtos',
      description: 'Análises detalhadas de produtos com testes reais, comparações objetivas e recomendações baseadas em dados.',
      url: `${SITE_URL}/reviews`,
      siteName: 'MercadoAI',
      images: [
        {
          url: `${SITE_URL}/og-image-reviews.png`,
          width: 1200,
          height: 630,
          alt: 'Imagem de destaque para Reviews'
        }
      ],
      locale: 'pt_BR',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Reviews | MercadoAI - Comparativos e Reviews de Produtos',
      description: 'Análises detalhadas de produtos com testes reais, comparações objetivas e recomendações baseadas em dados.',
      images: [`${SITE_URL}/og-image-reviews.png`]
    },
    alternates: {
      canonical: `${SITE_URL}/reviews`
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  }
}
