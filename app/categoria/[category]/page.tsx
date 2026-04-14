import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES } from '@/constants/categories'
import { Article } from '@/lib/supabase/types'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, slugify } from '@/lib/utils'
import { SITE_URL } from '@/lib/constants'

// Definir os tipos para os parâmetros
interface CategoryPageProps {
  params: {
    category: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = decodeURIComponent(params.category)

  // Verificar se a categoria é válida
  if (!CATEGORIES.includes(category)) {
    notFound()
  }

  const supabase = createClient()

  // Buscar artigos da categoria com ordenação por data de publicação (mais recentes primeiro)
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .limit(24)

  if (error) {
    console.error('Erro ao buscar artigos:', error)
    notFound()
  }

  // Gerar metadados para SEO
  const title = `${category} | MercadoAI - Comparativos e Reviews de Produtos`
  const description = `Artigos, reviews e comparativos sobre ${category.toLowerCase()} no MercadoAI. Encontre os melhores produtos com análises detalhadas.`

  // Gerar Schema.org JSON-LD para CollectionPage
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': articles?.map((article: Article, index: number) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Article',
          '@id': `${SITE_URL}/artigo/${article.slug}`,
          'headline': article.title,
          'description': article.excerpt ?? article.title,
          'datePublished': article.published_at,
          'dateModified': article.updated_at,
          'author': {
            '@type': 'Person',
            'name': article.author_name ?? 'MercadoAI'
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
          'name': category,
          'item': `${SITE_URL}/categoria/${slugify(category)}`
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
              {category}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {category}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Artigos, reviews e comparativos sobre {category.toLowerCase()} no MercadoAI. Encontre os melhores produtos com análises detalhadas.
          </p>
        </header>

        {/* Articles Grid */}
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article: Article) => (
              <article
                key={article.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                itemScope
                itemType="https://schema.org/Article"
              >
                <div className="p-6">
                  {/* Category badge */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                    {article.category}
                  </div>

                  {/* Article type badge */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4">
                    <span className={`px-2 py-1 rounded ${article.type === 'Review' ? 'bg-blue-100 text-blue-800' : article.type === 'Comparativo' ? 'bg-green-100 text-green-800' : article.type === 'Guia de Compra' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                      {article.type}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="text-xl font-bold text-gray-900 mb-3 line-clamp-2"
                    itemProp="headline"
                  >
                    <Link
                      href={`/artigo/${article.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p
                      className="text-gray-600 mb-4 line-clamp-3"
                      itemProp="description"
                    >
                      {article.excerpt}
                    </p>
                  )}

                  {/* Author and date */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span itemProp="author" itemScope itemType="https://schema.org/Person">
                      <span itemProp="name">{article.author_name ?? 'MercadoAI'}</span>
                    </span>
                    <span className="mx-2">•</span>
                    <time
                      dateTime={article.published_at}
                      itemProp="datePublished"
                    >
                      {formatDateTime(article.published_at)}
                    </time>
                  </div>

                  {/* Read more link */}
                  <Link
                    href={`/artigo/${article.slug}`}
                    className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
                  >
                    Ler artigo completo
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Nenhum artigo encontrado</h3>
            <p className="text-gray-600 mb-6">Não encontramos artigos nesta categoria ainda. Volte em breve!</p>
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
export async function generateMetadata({ params }: CategoryPageProps) {
  const category = decodeURIComponent(params.category)

  if (!CATEGORIES.includes(category)) {
    return {
      title: 'Categoria não encontrada - MercadoAI',
      description: 'A categoria solicitada não existe no nosso site.',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  const title = `${category} | MercadoAI - Comparativos e Reviews de Produtos`
  const description = `Artigos, reviews e comparativos sobre ${category.toLowerCase()} no MercadoAI. Encontre os melhores produtos com análises detalhadas.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mercadoai.com/categoria/${encodeURIComponent(category)}`,
      siteName: 'MercadoAI',
      images: [
        {
          url: `https://mercadoai.com/og-image-category-${encodeURIComponent(category)}.png`,
          width: 1200,
          height: 630,
          alt: `Imagem de destaque para ${category}`
        }
      ],
      locale: 'pt_BR',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`https://mercadoai.com/og-image-category-${encodeURIComponent(category)}.png`]
    },
    alternates: {
      canonical: `https://mercadoai.com/categoria/${encodeURIComponent(category)}`
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

// Gerar rotas estáticas para categorias mais populares (SSG)
export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category: encodeURIComponent(category)
  }))
}