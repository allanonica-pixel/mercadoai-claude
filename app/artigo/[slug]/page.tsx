import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { Article, Product } from '@/lib/supabase/types'
import { formatBRL, formatDate } from '@/lib/utils'
import { TYPE_COLORS } from '@/constants/categories'
import { CATEGORY_SLUGS } from '@/constants/categories'
import { SITE_URL } from '@/lib/constants'
import ShareButtons from '@/components/ShareButtons'
import NewsletterForm from '@/components/NewsletterForm'

export const revalidate = 3600

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('articles')
    .select('slug')
    .order('published_at', { ascending: false })
    .limit(100)
  return (data ?? []).map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const supabase = await createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, cover_image, category, type, author_name, published_at, updated_at, meta_title, meta_description, meta_keywords, slug')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!article) {
    return { title: 'Artigo não encontrado', robots: { index: false, follow: false } }
  }

  const metaTitle = article.meta_title ? `${article.meta_title} | MercadoAI` : `${article.title} | MercadoAI`
  const metaDescription = (article.meta_description ?? article.excerpt ?? article.title).slice(0, 160)
  const canonicalUrl = `${SITE_URL}/artigo/${params.slug}`

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: article.meta_keywords ?? `${article.title}, ${article.category}, ${article.type}, MercadoAI`,
    authors: [{ name: article.author_name ?? 'MercadoAI' }],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: 'MercadoAI',
      locale: 'pt_BR',
      images: article.cover_image ? [{ url: article.cover_image, width: 1200, height: 630, alt: article.title }] : [],
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      authors: [article.author_name ?? 'MercadoAI'],
      section: article.category,
    },
    twitter: {
      card: article.cover_image ? 'summary_large_image' : 'summary',
      title: metaTitle,
      description: metaDescription,
      images: article.cover_image ? [article.cover_image] : [],
      site: '@mercadoai',
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!article) notFound()

  // Produtos em destaque do artigo
  let featuredProducts: Product[] = []
  if (article.featured_product_ids?.length) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('id', article.featured_product_ids)
      .eq('is_active', true)
      .limit(3)
    featuredProducts = data ?? []
  }

  // Fallback: produtos da mesma categoria se não houver produtos vinculados
  if (!featuredProducts.length) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category', article.category)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .limit(3)
    featuredProducts = data ?? []
  }

  const categorySlug = CATEGORY_SLUGS[article.category] ?? article.category.toLowerCase()
  const articleUrl = `${SITE_URL}/artigo/${params.slug}`

  // Tags para exibição
  const tags = [
    `#${article.category.replace(/\s+/g, '')}`,
    `#${article.type.replace(/\s+/g, '')}`,
    '#Mercadoai',
    '#CompararPreços',
  ]

  // JSON-LD Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': article.type === 'Review' ? 'Review' : 'Article',
    headline: article.title,
    description: article.excerpt ?? article.title,
    image: article.cover_image ? { '@type': 'ImageObject', url: article.cover_image, width: 1200, height: 630 } : undefined,
    author: { '@type': 'Person', name: article.author_name ?? 'MercadoAI' },
    publisher: { '@type': 'Organization', name: 'MercadoAI', logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
    datePublished: article.published_at,
    dateModified: article.updated_at,
    mainEntityOfPage: { '@id': articleUrl },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Artigos', item: `${SITE_URL}/articles` },
      { '@type': 'ListItem', position: 3, name: article.category, item: `${SITE_URL}/categoria/${categorySlug}` },
      { '@type': 'ListItem', position: 4, name: article.title, item: articleUrl },
    ],
  }

  return (
    <div className="pt-[104px] bg-white">

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/articles" className="hover:text-gray-600 transition-colors">Artigos</Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href={`/categoria/${categorySlug}`} className="hover:text-gray-600 transition-colors">
              {article.category}
            </Link>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-600 truncate max-w-xs">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Cover image — full width */}
      {article.cover_image && (
        <div className="w-full bg-gray-100 overflow-hidden" style={{ maxHeight: '480px' }}>
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover object-center"
            style={{ maxHeight: '480px' }}
            fetchPriority="high"
          />
        </div>
      )}

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Conteúdo principal ── */}
          <article className="flex-1 min-w-0" itemScope itemType="https://schema.org/Article">

            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${TYPE_COLORS[article.type] ?? 'bg-gray-100 text-gray-700'}`}>
                {article.type}
              </span>
              <Link
                href={`/categoria/${categorySlug}`}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {article.category}
              </Link>
            </div>

            {/* Título */}
            <h1
              className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4"
              itemProp="headline"
            >
              {article.title}
            </h1>

            {/* Author row */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100 flex-wrap">
              <div className="flex items-center gap-2">
                {article.author_avatar ? (
                  <img src={article.author_avatar} alt={article.author_name ?? ''} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 text-xs font-bold">{(article.author_name ?? 'M')[0]}</span>
                  </div>
                )}
                <span className="font-medium text-gray-700" itemProp="author">
                  {article.author_name ?? 'Equipe Mercadoai'}
                </span>
              </div>
              <time dateTime={article.published_at} itemProp="datePublished" className="text-gray-400">
                {formatDate(article.published_at)}
              </time>
              <span className="flex items-center gap-1 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {article.read_time} min de leitura
              </span>
              <span className="flex items-center gap-1 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {article.views} visualizações
              </span>
            </div>

            {/* Lead / Excerpt */}
            {article.excerpt && (
              <div className="border-l-4 border-orange-500 pl-4 mb-8">
                <p className="text-base md:text-lg font-semibold text-gray-800 leading-relaxed italic">
                  {article.excerpt}
                </p>
              </div>
            )}

            {/* Article content */}
            {article.content && (
              <div
                className="prose prose-gray prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline
                  prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-gray-700
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: article.content }}
                itemProp="articleBody"
              />
            )}

            {/* Tags */}
            <div className="mt-10 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Compartilhar */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">Compartilhar este artigo:</p>
              <ShareButtons url={articleUrl} title={article.title} />
            </div>

            {/* Author bio */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="flex items-start gap-4">
                {article.author_avatar ? (
                  <img
                    src={article.author_avatar}
                    alt={article.author_name ?? ''}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 text-xl font-bold">
                      {(article.author_name ?? 'M')[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900">{article.author_name ?? 'Equipe Mercadoai'}</p>
                  <p className="text-sm text-orange-500 font-medium mb-2">Editor Sênior · Mercadoai</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Especialista em tecnologia e comparação de produtos com mais de 8 anos de experiência analisando eletrônicos, gadgets e as melhores ofertas do mercado brasileiro.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* ── Sidebar ── */}
          <aside className="lg:w-72 flex-shrink-0 space-y-6">

            {/* Produtos em Destaque */}
            {featuredProducts.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-bold text-gray-900 text-sm">Produtos em Destaque</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produto/${product.slug}`}
                      className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl opacity-20">📦</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight mb-1">
                          {product.name}
                        </p>
                        {product.original_price && product.original_price > product.price && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatBRL(product.original_price)}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-gray-900">{formatBRL(product.price)}</span>
                          {product.discount_pct && product.discount_pct > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                              -{product.discount_pct}%
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter sidebar */}
            <div className="bg-gray-900 rounded-xl p-5">
              <h3 className="font-bold text-white text-sm mb-1">Receba as melhores ofertas</h3>
              <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                Cadastre seu e-mail e nunca perca uma oferta incrível.
              </p>
              <NewsletterForm dark />
            </div>

          </aside>
        </div>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </div>
  )
}
