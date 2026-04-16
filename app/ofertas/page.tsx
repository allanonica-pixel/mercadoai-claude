import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Deal } from '@/lib/supabase/types'
import { formatBRL, getTimeRemaining } from '@/lib/utils'
import { SITE_URL } from '@/lib/constants'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Melhores Ofertas do Dia — Promoções e Descontos | Mercadoai',
  description: 'As melhores promoções e descontos em smartphones, notebooks, games, eletrodomésticos e muito mais. Ofertas verificadas nos maiores marketplaces do Brasil.',
  alternates: { canonical: `${SITE_URL}/ofertas` },
  openGraph: {
    title: 'Melhores Ofertas do Dia | Mercadoai',
    description: 'Promoções verificadas nos maiores marketplaces do Brasil.',
    url: `${SITE_URL}/ofertas`,
    siteName: 'Mercadoai',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Melhores Ofertas do Dia | Mercadoai',
    description: 'Promoções verificadas nos maiores marketplaces do Brasil.',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
}

const MARKETPLACE_COLORS: Record<string, string> = {
  'Amazon': 'bg-amber-100 text-amber-800',
  'Mercado Livre': 'bg-yellow-100 text-yellow-800',
  'Shopee': 'bg-orange-100 text-orange-700',
  'Americanas': 'bg-red-100 text-red-700',
  'Magazine Luiza': 'bg-blue-100 text-blue-700',
  'Casas Bahia': 'bg-indigo-100 text-indigo-700',
}

export default async function OfertasPage() {
  const supabase = await createClient()

  const now = new Date().toISOString()

  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('discount_pct', { ascending: false })
    .limit(48)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Melhores Ofertas do Dia',
    description: 'Promoções e descontos verificados nos maiores marketplaces do Brasil.',
    url: `${SITE_URL}/ofertas`,
    publisher: { '@type': 'Organization', name: 'Mercadoai', url: SITE_URL },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="pt-[104px]">
        {/* Hero */}
        <div className="bg-gradient-to-r from-rose-600 to-orange-500 text-white py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <nav className="text-sm text-rose-200 mb-4 flex items-center gap-2">
              <Link href="/" className="hover:text-white transition-colors">Início</Link>
              <span>/</span>
              <span className="text-white">Ofertas</span>
            </nav>
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Atualizadas regularmente
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Melhores Ofertas do Dia</h1>
            <p className="text-rose-100 max-w-xl">
              Promoções verificadas com os maiores descontos nos principais marketplaces do Brasil.
            </p>
            {deals && deals.length > 0 && (
              <p className="text-xs text-rose-200 mt-3">{deals.length} ofertas ativas agora</p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {deals && deals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {(deals as Deal[]).map((deal) => {
                const timeLeft = getTimeRemaining(deal.expires_at)
                const marketplaceColor = MARKETPLACE_COLORS[deal.marketplace] ?? 'bg-gray-100 text-gray-600'

                return (
                  <div
                    key={deal.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col"
                  >
                    {/* Imagem */}
                    <div className="relative bg-gray-50 flex items-center justify-center h-44 px-4">
                      {deal.discount_pct > 0 && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-lg">
                          -{deal.discount_pct}%
                        </span>
                      )}
                      {deal.free_shipping && (
                        <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                          Frete grátis
                        </span>
                      )}
                      {deal.image_url ? (
                        <img
                          src={deal.image_url}
                          alt={deal.product_name}
                          className="max-h-36 w-auto object-contain"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="p-4 flex flex-col flex-1">
                      <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${marketplaceColor}`}>
                        {deal.marketplace}
                      </span>

                      <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 flex-1">
                        {deal.title}
                      </h2>

                      {deal.category && (
                        <p className="text-xs text-gray-400 mb-3">{deal.category}</p>
                      )}

                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xl font-black text-gray-900">{formatBRL(deal.deal_price)}</span>
                        {deal.original_price > deal.deal_price && (
                          <span className="text-xs text-gray-400 line-through">{formatBRL(deal.original_price)}</span>
                        )}
                      </div>

                      {timeLeft && timeLeft !== 'Expirado' && (
                        <p className="text-xs text-amber-600 font-medium mb-3 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {timeLeft}
                        </p>
                      )}

                      {deal.affiliate_url ? (
                        <a
                          href={deal.affiliate_url}
                          target="_blank"
                          rel="nofollow noopener noreferrer"
                          className="mt-auto w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg text-center transition-colors"
                        >
                          Ver oferta →
                        </a>
                      ) : (
                        <div className="mt-auto w-full py-2.5 bg-gray-100 text-gray-400 text-sm rounded-lg text-center cursor-not-allowed">
                          Link indisponível
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhuma oferta ativa no momento</h2>
              <p className="text-gray-500 mb-6">Novas ofertas são adicionadas regularmente. Volte em breve!</p>
              <Link
                href="/articles"
                className="inline-flex items-center px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Ver artigos e reviews
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
