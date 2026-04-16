import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/constants'
import ProductsClient from '@/components/ProductsClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Todos os Produtos',
  description: 'Compare preços e encontre as melhores ofertas nos principais marketplaces do Brasil. Eletrônicos, notebooks, smartphones, games e muito mais.',
  alternates: { canonical: `${SITE_URL}/products` },
  openGraph: {
    title: 'Todos os Produtos | MercadoAI',
    description: 'Compare preços e encontre as melhores ofertas nos principais marketplaces do Brasil.',
    url: `${SITE_URL}/products`,
    siteName: 'MercadoAI',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
}

interface Props {
  searchParams: Promise<{ q?: string; categoria?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const { q, categoria } = await searchParams
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(120)

  // Schema.org para listagem de produtos
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Todos os Produtos — MercadoAI',
    url: `${SITE_URL}/products`,
    numberOfItems: products?.length ?? 0,
    itemListElement: (products ?? []).slice(0, 20).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        '@id': `${SITE_URL}/produto/${p.slug}`,
        name: p.name,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'BRL',
          price: p.price,
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  }

  return (
    <div className="pt-[104px] bg-gray-50 min-h-screen">
      <ProductsClient
        products={products ?? []}
        initialSearch={q ?? ''}
        initialCategory={categoria ?? ''}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
    </div>
  )
}
