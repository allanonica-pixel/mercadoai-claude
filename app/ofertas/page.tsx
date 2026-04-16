import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import OfertasClient from '@/components/OfertasClient'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Melhores Ofertas do Dia',
  description: 'As melhores ofertas e promoções nos principais marketplaces do Brasil. Descontos de até 60% em produtos selecionados diariamente.',
  openGraph: {
    title: 'Melhores Ofertas do Dia | MercadoAI',
    description: 'Economize com as melhores promoções do Mercado Livre, Amazon, Shopee e mais.',
  },
}

export default async function OfertasPage() {
  const supabase = await createClient()

  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('is_active', true)
    .order('discount_pct', { ascending: false })

  const totalDeals = deals?.length ?? 0

  return (
    <div className="pt-[104px] bg-gray-50 min-h-screen">

      {/* Hero banner */}
      <section className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
                <span className="text-white/90 text-sm font-medium">Ofertas ao vivo</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
                Melhores Ofertas do Dia
              </h1>
              <p className="text-white/80 text-sm">
                {totalDeals} oferta{totalDeals !== 1 ? 's' : ''} ativa{totalDeals !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex-shrink-0 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-white/80 text-xs">Atualizado em tempo real</p>
                <p className="text-white font-bold text-sm">Economize Agora</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros + Grid (client) */}
      <OfertasClient deals={deals ?? []} />

    </div>
  )
}
