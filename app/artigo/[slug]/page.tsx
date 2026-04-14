import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Article, Product } from '@/lib/supabase/types'
import { formatBRL } from '@/lib/utils'
import { TYPE_COLORS } from '@/constants/categories'

const SITE_URL = 'https://mercadoai.com'
const SITE_NAME = 'Mercadoai'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const supabase = createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!article) {
    return {
      title: 'Artigo não encontrado | Mercadoai',
      description: 'O artigo solicitado não foi encontrado.',
      robots: { index: false, follow: false },
    }
  }

  const metaTitle = article.meta_title
    ? `${article.meta_title} | ${SITE_NAME}`
    : `${article.title} | ${SITE_NAME}`

  const metaDescription = article.meta_description
    ? article.meta_description.slice(0, 160)
    : article.excerpt
    ? article.excerpt.slice(0, 160)
    : `${article.title} — Leia o ${article.type} completo no ${SITE_NAME}.`

  const metaKeywords = article.meta_keywords
    ? article.meta_keywords
    : `${article.title}, ${article.category}${article.subcategory ? `, ${article.subcategory}` : ''}, ${article.type}, ${SITE_NAME}, melhores produtos, comparar preços`

  const canonicalUrl = `${SITE_URL}/artigo/${params.slug}`
  const publishedDate = new Date(article.published_at).toISOString()
  const modifiedDate = new Date(article.updated_at).toISOString()

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name: article.author_name ?? SITE_NAME }],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      images: article.cover_image
        ? [
            {
              url: article.cover_image,
              width: 1200,
              height: 630,
              alt: article.title,
              type: 'image/jpeg',
            },
          ]
        : [],
      publishedTime: publishedDate,
      modifiedTime: modifiedDate,
      authors: [article.author_name ?? SITE_NAME],
      section: article.category,
      tags: [article.type, article.category],
    },
    twitter: {
      card: article.cover_image ? 'summary_large_image' : 'summary',
      title: metaTitle,
      description: metaDescription,
      images: article.cover_image ? [article.cover_image] : [],
      site: '@mercadoai',
      creator: '@mercadoai',
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    other: {
      'Last-modified': modifiedDate,
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <main className="pt-[104px] flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <i className="ri-article-line text-5xl text-stone-300 mb-4 block"></i>
            <p className="text-stone-500 font-semibold">Artigo não encontrado.</p>
            <a
              href="/articles"
              className="mt-4 inline-block text-orange-500 font-semibold hover:underline"
            >
              Ver todos os artigos
            </a>
          </div>
        </main>
      </div>
    )
  }

  // Fetch featured products
  let featuredProducts: Product[] = []
  const productIds = article.featured_product_ids ?? []
  if (productIds.length > 0) {
    const { data: prods } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('is_active', true)
    if (prods) featuredProducts = prods as Product[]
  } else {
    const { data: prods } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .limit(3)
    if (prods) featuredProducts = prods as Product[]
  }

  // Fetch related articles
  let relatedArticles: Article[] = []
  const relatedIds = article.related_article_ids ?? []
  if (relatedIds.length > 0) {
    const { data: rel } = await supabase
      .from('articles')
      .select('*')
      .in('id', relatedIds)
    if (rel) relatedArticles = rel as Article[]
  } else {
    const { data: rel } = await supabase
      .from('articles')
      .select('*')
      .neq('id', article.id)
      .eq('category', article.category)
      .order('published_at', { ascending: false })
      .limit(3)
    if (rel) relatedArticles = rel as Article[]
  }

  // Parse content into paragraphs
  const paragraphs = article.content
    ? article.content.split('\n\n').filter(Boolean)
    : [
        'Escolher o produto certo nunca foi tão desafiador. Com tantas opções no mercado, é fácil se perder entre especificações técnicas, preços variados e promessas de marketing. Por isso, preparamos este guia completo para te ajudar a tomar a melhor decisão.',
        'Antes de qualquer coisa, é importante entender suas necessidades reais. Pergunte-se: para que vou usar este produto? Com que frequência? Qual é o meu orçamento máximo? Essas respostas vão nortear toda a sua escolha.',
        'Analisamos dezenas de modelos disponíveis no mercado brasileiro, comparando preço, qualidade, durabilidade e custo-benefício. Nossa metodologia inclui testes práticos, análise de especificações técnicas e avaliação de reviews de usuários reais.',
        'Um dos fatores mais importantes que muitas pessoas ignoram é o suporte pós-venda. De nada adianta comprar um produto excelente se, quando precisar de assistência, você encontrar dificuldades. Verifique sempre a garantia e a rede de assistência técnica.',
        'Em termos de custo-benefício, nem sempre o produto mais caro é o melhor para você. Muitas vezes, modelos intermediários oferecem 90% das funcionalidades dos top de linha por metade do preço. Avalie o que realmente vai usar no dia a dia.',
        'Nossa recomendação final: pesquise bastante, compare preços em diferentes marketplaces (Mercado Livre, Amazon, Shopee), leia reviews de usuários reais e não se deixe levar apenas pelo marketing. Com as informações certas, você vai fazer uma compra que vai te satisfazer por muito tempo.',
      ]

  // Generate FAQPage only for Reviews
  const faqSchema = article.type === 'Review' ? (() => {
    const productName = article.title
      .replace(/^(Review|Análise|Teste):?\s*/i, '')
      .replace(/\s*[-–|].*$/, '')
      .trim()

    const faqs = [
      {
        q: `Vale a pena comprar o ${productName}?`,
        a: article.excerpt
          ? article.excerpt
          : `Após análise completa, o ${productName} se destaca pelo custo-benefício na categoria ${article.category}. Confira o review completo no Mercadoai para tomar a melhor decisão.`,
      },
      {
        q: `Quais são os pontos fortes do ${productName}?`,
        a: `O ${productName} se destaca em ${article.category}${article.subcategory ? ` — especialmente em ${article.subcategory}` : ''}. Nossa análise detalhada cobre desempenho, qualidade de construção e custo-benefício.`,
      },
      {
        q: `Onde comprar o ${productName} com melhor preço?`,
        a: `No Mercadoai você encontra o ${productName} com comparação de preços nos principais marketplaces do Brasil: Mercado Livre, Amazon, Shopee e Magazine Luiza. Acesse nossa página de produto para ver a oferta mais recente.`,
      },
      {
        q: `O ${productName} tem frete grátis?`,
        a: `A disponibilidade de frete grátis para o ${productName} varia conforme o marketplace e a região. Verifique as condições atuais na página do produto no Mercadoai.`,
      },
    ]

    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faqs.map(({ q, a }) => ({
        '@type': 'Question',
        'name': q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': a,
        },
      })),
    }
  })() : null

  // Breadcrumb schema
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Artigos', item: `${SITE_URL}/articles` },
    {
      '@type': 'ListItem',
      position: 3,
      name: article.category,
      item: `${SITE_URL}/articles?categoria=${article.category}`,
    },
    ...(article.subcategory
      ? [
          {
            '@type': 'ListItem',
            position: 4,
            name: article.subcategory,
            item: `${SITE_URL}/articles?categoria=${article.category}&subcategoria=${article.subcategory}`,
          },
        ]
      : []),
    {
      '@type': 'ListItem',
      position: article.subcategory ? 5 : 4,
      name: article.title,
      item: `${SITE_URL}/artigo/${params.slug}`,
    },
  ]
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems,
  }

  // Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': article.type === 'Review' ? 'Review' : 'Article',
    headline: article.title,
    description: article.excerpt ?? article.title,
    ...(article.cover_image
      ? {
          image: {
            '@type': 'ImageObject',
            url: article.cover_image,
            width: 1200,
            height: 630,
            caption: article.title,
          },
          thumbnailUrl: article.cover_image,
        }
      : {}),
    author: {
      '@type': 'Person',
      name: article.author_name ?? SITE_NAME,
      url: `${SITE_URL}/autor/${(article.author_name ?? '').toLowerCase().replace(/\s+/g, '-')}`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    datePublished: publishedDate,
    dateModified: modifiedDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/artigo/${params.slug}`,
    },
    articleSection: article.subcategory
      ? `${article.category} › ${article.subcategory}`
      : article.category,
    keywords: article.meta_keywords
      ? article.meta_keywords
      : `${article.category}${article.subcategory ? `, ${article.subcategory}` : ''}, ${article.type}, ${article.title}`,
    inLanguage: 'pt-BR',
    url: `${SITE_URL}/artigo/${params.slug}`,
    wordCount: article.content ? article.content.split(' ').length : 800,
    timeRequired: `PT${article.read_time}M`,
  }

  // WebPage schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}/artigo/${params.slug}`,
    url: `${SITE_URL}/artigo/${params.slug}`,
    name: `${article.title} | ${SITE_NAME}`,
    description: article.excerpt ?? article.title,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': SITE_URL },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: article.cover_image ?? '',
    },
    datePublished: publishedDate,
    dateModified: modifiedDate,
    breadcrumb: { '@id': `${SITE_URL}/artigo/${params.slug}#breadcrumb` },
  }

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Page Content */}
      <div className="min-h-screen bg-white">
        {/* Navbar será adicionada via app/layout.tsx — não aqui */}
        <main className="pt-[104px]">
          {/* Breadcrumb */}
          <div className="bg-stone-50 border-b border-stone-100">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-stone-400 flex-wrap">
                <a href="/" className="hover:text-orange-500 transition-colors cursor-pointer whitespace-nowrap">
                  Home
                </a>
                <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
                <a
                  href="/articles"
                  className="hover:text-orange-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Artigos
                </a>
                <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
                <a
                  href={`/articles?categoria=${article.category}`}
                  className="hover:text-orange-500 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {article.category}
                </a>
                {article.subcategory && (
                  <>
                    <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
                    <a
                      href={`/articles?categoria=${article.category}&subcategoria=${article.subcategory}`}
                      className="hover:text-orange-500 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {article.subcategory}
                    </a>
                  </>
                )}
                <i className="ri-arrow-right-s-line" aria-hidden="true"></i>
                <span className="text-stone-600 font-medium line-clamp-1" aria-current="page">
                  {article.title}
                </span>
              </nav>
            </div>
          </div>

          {/* Hero com imagem fullscreen — SEM overlay */}
          <section aria-label="Capa do artigo">
            <div className="w-full h-[320px] md:h-[460px] overflow-hidden bg-stone-100">
              <img
                src={article.cover_image ?? ''}
                alt={article.title}
                title={`${article.title} | ${SITE_NAME}`}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            </div>
            <div className="bg-white border-b border-stone-100 py-6 px-4 md:px-10">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${TYPE_COLORS[article.type] ?? 'bg-stone-100 text-stone-700'}`}
                  >
                    {article.type}
                  </span>
                  <span className="bg-stone-100 text-stone-600 text-xs font-semibold px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-stone-900 leading-tight mb-4">
                  {article.title}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full overflow-hidden bg-stone-200 flex-shrink-0">
                      <img
                        src={article.author_avatar ?? ''}
                        alt={`Foto de ${article.author_name}`}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <span className="text-stone-700 text-sm font-semibold">{article.author_name}</span>
                  </div>
                  <span className="text-stone-300 text-xs" aria-hidden="true">
                    ·
                  </span>
                  <time
                    dateTime={publishedDate}
                    className="text-stone-500 text-xs"
                  >
                    {new Date(article.published_at).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                  <span className="text-stone-300 text-xs" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-stone-500 text-xs flex items-center gap-1">
                    <i className="ri-time-line" aria-hidden="true"></i>
                    <span>{article.read_time} min de leitura</span>
                  </span>
                  <span className="text-stone-300 text-xs" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-stone-500 text-xs flex items-center gap-1">
                    <i className="ri-eye-line" aria-hidden="true"></i>
                    <span>{article.views.toLocaleString('pt-BR')} visualizações</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Conteúdo principal */}
          <section className="py-12" aria-label="Conteúdo do artigo">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Artigo */}
                <article className="lg:col-span-2" itemScope itemType="https://schema.org/Article">
                  <meta itemProp="headline" content={article.title} />
                  <meta itemProp="datePublished" content={publishedDate} />
                  <meta itemProp="dateModified" content={modifiedDate} />
                  <meta itemProp="author" content={article.author_name ?? SITE_NAME} />
                  <meta itemProp="image" content={article.cover_image ?? ''} />

                  {/* Excerpt destacado */}
                  {article.excerpt && (
                    <p className="text-lg text-stone-600 leading-relaxed font-medium border-l-4 border-orange-500 pl-5 mb-8 italic">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Corpo do artigo */}
                  <div className="prose prose-stone max-w-none" itemProp="articleBody">
                    {paragraphs.map((paragraph, i) => {
                      // Citação destacada no meio do artigo
                      if (i === Math.floor(paragraphs.length / 2)) {
                        return (
                          <>
                            <blockquote
                              key={`quote-${i}`}
                              className="my-8 border-l-4 border-orange-400 bg-orange-50 rounded-r-xl px-6 py-4"
                            >
                              <p className="text-orange-800 font-semibold text-base italic leading-relaxed">
                                &ldquo;{paragraph.slice(0, 120)}...&rdquo;
                              </p>
                            </blockquote>
                            <p key={i} className="text-stone-700 leading-relaxed mb-5 text-base">
                              {paragraph}
                            </p>
                          </>
                        )
                      }
                      return (
                        <p key={i} className="text-stone-700 leading-relaxed mb-5 text-base">
                          {paragraph}
                        </p>
                      )
                    })}
                  </div>

                  {/* Tags */}
                  <div className="mt-8 flex flex-wrap gap-2">
                    {([article.category, article.type, 'Mercadoai', 'Comparar Preços'] as const).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-semibold rounded-full"
                      >
                        #{tag.replace(/\s+/g, '')}
                      </span>
                    ))}
                  </div>

                  {/* Compartilhar */}
                  <div className="mt-8 pt-8 border-t border-stone-100">
                    <p className="text-sm font-semibold text-stone-500 mb-3">Compartilhar este artigo:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(article.title)}%20${encodeURIComponent(`${SITE_URL}/artigo/${params.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-green-500 hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-whatsapp-line text-sm" aria-hidden="true"></i>WhatsApp
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`${SITE_URL}/artigo/${params.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-twitter-x-line text-sm" aria-hidden="true"></i>Twitter/X
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${SITE_URL}/artigo/${params.slug}`)}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-facebook-circle-line text-sm" aria-hidden="true"></i>Facebook
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${SITE_URL}/artigo/${params.slug}`)
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-link-m text-sm" aria-hidden="true"></i>
                        Copiar link
                      </button>
                    </div>
                  </div>

                  {/* Autor */}
                  <div
                    className="mt-8 bg-stone-50 rounded-2xl p-6 flex items-start gap-4"
                    itemScope
                    itemType="https://schema.org/Person"
                  >
                    <div className="w-14 h-14 flex items-center justify-center rounded-full overflow-hidden bg-stone-200 flex-shrink-0">
                      <img
                        src={article.author_avatar ?? ''}
                        alt={`Foto do autor ${article.author_name}`}
                        className="w-full h-full object-cover object-top"
                        itemProp="image"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 mb-1" itemProp="name">
                        {article.author_name}
                      </p>
                      <p className="text-xs text-orange-500 font-semibold mb-2" itemProp="jobTitle">
                        Editor Sênior · {SITE_NAME}
                      </p>
                      <p className="text-sm text-stone-500 leading-relaxed" itemProp="description">
                        Especialista em tecnologia e comparação de produtos com mais de 8 anos de experiência
                        analisando eletrônicos, gadgets e as melhores ofertas do mercado brasileiro.
                      </p>
                    </div>
                  </div>
                </article>

                {/* Sidebar */}
                <aside className="lg:col-span-1 space-y-6" aria-label="Conteúdo relacionado">
                  {/* Produtos em destaque */}
                  {featuredProducts.length > 0 && (
                    <div className="bg-stone-50 rounded-2xl p-5">
                      <h3 className="text-sm font-black text-stone-900 mb-4 flex items-center gap-2">
                        <i className="ri-flashlight-fill text-orange-500" aria-hidden="true"></i>
                        Produtos em Destaque
                      </h3>
                      <div className="space-y-3">
                        {featuredProducts.map((p) => (
                          <a
                            key={p.id}
                            href={`/produto/${p.slug}`}
                            className="flex items-center gap-3 bg-white rounded-xl p-3 border border-stone-100 hover:border-orange-200 transition-all cursor-pointer group"
                          >
                            <div className="w-14 h-14 flex items-center justify-center bg-stone-50 rounded-lg flex-shrink-0 overflow-hidden">
                              <img
                                src={p.image_url ?? ''}
                                alt={p.name}
                                className="w-12 h-12 object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-stone-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                {p.name}
                              </p>
                              {p.original_price && (
                                <p className="text-xs text-stone-400 line-through">
                                  {formatBRL(p.original_price)}
                                </p>
                              )}
                              <p className="text-sm font-black text-stone-900">{formatBRL(p.price)}</p>
                            </div>
                            {p.discount_pct && p.discount_pct > 0 && (
                              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded flex-shrink-0">
                                -{p.discount_pct}%
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Artigos relacionados */}
                  {relatedArticles.length > 0 && (
                    <div className="bg-stone-50 rounded-2xl p-5">
                      <h3 className="text-sm font-black text-stone-900 mb-4 flex items-center gap-2">
                        <i className="ri-article-line text-orange-500" aria-hidden="true"></i>
                        Artigos Relacionados
                      </h3>
                      <div className="space-y-3">
                        {relatedArticles.map((a) => (
                          <a
                            key={a.id}
                            href={`/artigo/${a.slug}`}
                            className="flex gap-3 group cursor-pointer"
                          >
                            <div className="w-16 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-stone-200">
                              <img
                                src={a.cover_image ?? ''}
                                alt={a.title}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-stone-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                {a.title}
                              </p>
                              <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                                <i className="ri-time-line" aria-hidden="true"></i>
                                {a.read_time} min
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Newsletter CTA */}
                  <div className="bg-stone-900 rounded-2xl p-5">
                    <h3 className="text-white font-black text-sm mb-2">Receba as melhores ofertas</h3>
                    <p className="text-stone-400 text-xs mb-4">
                      Cadastre seu e-mail e nunca perca uma oferta imperdível.
                    </p>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full px-3 py-2 rounded-lg bg-stone-800 border border-stone-700 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors mb-2"
                    />
                    <button className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap">
                      Quero Receber Ofertas
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          {/* Mais artigos */}
          {relatedArticles.length > 0 && (
            <section className="py-10 bg-stone-50" aria-label="Mais artigos">
              <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-stone-900">Mais Artigos</h2>
                  <a
                    href="/articles"
                    className="text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1"
                  >
                    Ver todos <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {relatedArticles.map((a) => (
                    <a
                      key={a.id}
                      href={`/artigo/${a.slug}`}
                      className="group bg-white rounded-xl border border-stone-100 overflow-hidden hover:border-orange-200 transition-all cursor-pointer"
                    >
                      <div className="h-44 overflow-hidden bg-stone-100">
                        <img
                          src={a.cover_image ?? ''}
                          alt={a.title}
                          title={a.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[a.type] ?? 'bg-stone-100 text-stone-600'}`}
                        >
                          {a.type}
                        </span>
                        <p className="text-sm font-semibold text-stone-800 mt-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {a.title}
                        </p>
                        <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
                          <i className="ri-time-line" aria-hidden="true"></i>
                          {a.read_time} min de leitura
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
        {/* Footer será adicionado via app/layout.tsx — não aqui */}
      </div>
    )
}
