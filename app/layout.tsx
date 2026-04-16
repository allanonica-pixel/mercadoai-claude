import type { Metadata } from 'next'
import { Sora, DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { SITE_URL } from '@/lib/constants'

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: {
    default: 'Mercadoai — Comparativos e Reviews de Produtos',
    template: '%s | Mercadoai',
  },
  description: 'Encontre os melhores produtos com análises detalhadas, comparações e ofertas exclusivas nos maiores marketplaces do Brasil.',
  keywords: 'comparativo de produtos, reviews, melhores ofertas, mercado livre, amazon, shopee, tecnologia',
  authors: [{ name: 'Equipe Mercadoai' }],
  creator: 'Mercadoai',
  openGraph: {
    title: 'Mercadoai — Comparativos e Reviews de Produtos',
    description: 'Encontre os melhores produtos com análises detalhadas, comparações e ofertas exclusivas.',
    url: SITE_URL,
    siteName: 'Mercadoai',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mercadoai — Comparativos e Reviews de Produtos',
    description: 'Encontre os melhores produtos com análises detalhadas, comparações e ofertas exclusivas.',
    images: [`${SITE_URL}/og-image.png`],
    site: '@mercadoai',
  },
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
