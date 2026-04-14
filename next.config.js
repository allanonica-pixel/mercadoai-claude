/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para produção
  output: 'standalone', // Gera um build autocontido para Vercel

  // Otimizações de imagem
  images: {
    domains: [
      'ucencxnnvtiitpucfnds.supabase.co',
      'images.unsplash.com',
      'placehold.co',
      'cdn.pixabay.com',
      'i.pravatar.cc',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      's3.amazonaws.com',
      'imgur.com',
      'i.imgur.com',
      'media.giphy.com',
      'giphy.com'
    ],
    minimumCacheTTL: 300,
  },

  // Configurações de fontes
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },

  // Configurações de SSR/SSG
  // Ajuste conforme necessário para seu conteúdo
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  // Configurações de segurança
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
