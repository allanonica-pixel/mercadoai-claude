import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SITE_URL } from '@/lib/constants'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MercadoAI - Comparativos e Reviews de Produtos',
  description: 'Encontre os melhores produtos com análises detalhadas, comparações e ofertas exclusivas.',
  openGraph: {
    title: 'MercadoAI - Comparativos e Reviews de Produtos',
    description: 'Encontre os melhores produtos com análises detalhadas, comparações e ofertas exclusivas.',
    url: SITE_URL,
    siteName: 'MercadoAI',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MercadoAI - Comparativos e Reviews de Produtos',
    description: 'Encontre os melhores produtos com análises detalhadas, comparações e ofertas exclusivas.',
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
