import type { Metadata } from 'next'
import { Sora, DM_Sans } from 'next/font/google'
import './globals.css'
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
    default: 'MercadoAI — Os melhores produtos com os melhores preços',
    template: '%s | MercadoAI',
  },
  description:
    'Comparamos produtos, analisamos preços e ajudamos você a encontrar as melhores ofertas nos principais marketplaces do Brasil.',
  keywords: 'comparativo de produtos, reviews, melhores ofertas, mercado livre, amazon, shopee, tecnologia',
  authors: [{ name: 'Equipe MercadoAI' }],
  creator: 'MercadoAI',
  openGraph: {
    title: 'MercadoAI — Os melhores produtos com os melhores preços',
    description:
      'Comparamos produtos e ajudamos você a encontrar as melhores ofertas nos principais marketplaces do Brasil.',
    url: SITE_URL,
    siteName: 'MercadoAI',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630 }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MercadoAI — Os melhores produtos com os melhores preços',
    description:
      'Comparamos produtos e ajudamos você a encontrar as melhores ofertas nos principais marketplaces do Brasil.',
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
