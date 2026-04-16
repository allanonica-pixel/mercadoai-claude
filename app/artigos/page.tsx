import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'
import { TYPE_COLORS, TYPE_LABELS } from '@/constants/categories'
import { SITE_URL } from '@/lib/constants'
import ArticleCard from '@/components/ArticleCard'

export const revalidate = 1800

interface ArticlesPageProps {
  searchParams: Promise<{ categoria?: string; subcategoria?: string }>
}

export async function generateMetadata({ searchParams }: ArticlesPageProps): Promise<Metadata> {
  const { categoria } = await searchParams
  const label = categoria ? (TYPE_LABELS[categoria] ?? categoria) : null
  const title = label
    ? `${label} — Artigos | Mercadoai`
    : 'Artigos — Reviews, Guias e Comparativos | Mercadoai'
  const description = label
    ? `Leia os melhores artigos sobre ${label.toLowerCase()} no Mercadoai.`
    : 'Explore reviews detalhados, guias de compra, comparativos e notícias sobre tecnologia e produtos.'

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/artigos` },
    openGraph: { title, description, url: `${SITE_URL}/artigos`, siteName: 'Mercadoai', locale: 'pt_BR', type: 'website' },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  }
}

// Tipos internos (valor no banco) → rótulo exibido
const FILTER_TYPES = [
  { value: 'Review',         label: 'Artigo' },
  { value: 'Comparativo',    label: 'Comparativo' },
  { value: 'Guia de Compra', label: 'Guia de Compra' },
  { value: 'Notícias',       label: 'Notícias' },
]

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { categoria, subcategoria } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(24)

  if (categoria) query = query.eq('type', categoria)
  if (subcategoria) query = query.eq('subcategory', subcategoria)

  const { data: articles } = await query

  const displayLabel = categoria ? (TYPE_LABELS[categoria] ?? categoria) : null

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: displayLabel ?? 'Artigos — Mercadoai',
    url: `${SITE_URL}/artigos`,
    description: 'Reviews, guias de compra, comparativos e notícias sobre tecnologia.',
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
      {/* Hero */}
      <div className="bg-gray-950 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <span>/</span>
            <span className="text-white">Artigos</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {displayLabel ?? 'Todos os Artigos'}
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Reviews detalhados, guias de compra, comparativos e as últimas notícias sobre tecnologia e produtos.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filtros por tipo */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/artigos"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!categoria ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Todos
          </Link>
          {FILTER_TYPES.map(({ value, label }) => (
            <Link
              key={value}
              href={`/artigos?categoria=${encodeURIComponent(value)}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoria === value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Grid de artigos */}
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: Article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Nenhum artigo encontrado.</p>
            <Link href="/artigos" className="mt-4 inline-block text-orange-500 font-medium hover:underline">
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
