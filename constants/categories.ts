export const CATEGORIES: Record<string, string[]> = {
  'Eletrônicos':      ['Áudio', 'Câmeras', 'Acessórios', 'Carregadores', 'Cabos'],
  'Smartphones':      ['Android', 'iPhone', 'Acessórios', 'Capas', 'Películas'],
  'Notebooks':        ['Gamer', 'Ultrafino', 'Corporativo', 'Chromebook', 'Acessórios'],
  'Games':            ['Console', 'PC Gamer', 'Periféricos', 'Jogos', 'Cadeiras Gamer'],
  'Eletrodomésticos': ['Cozinha', 'Limpeza', 'Climatização', 'Lavanderia', 'Geladeiras'],
  'Fones':            ['In-ear', 'Over-ear', 'On-ear', 'True Wireless', 'Headset Gamer'],
  'Smartwatches':     ['Fitness', 'Esportivo', 'Casual', 'Infantil', 'Acessórios'],
  'Casa & Cozinha':   ['Organização', 'Decoração', 'Utensílios', 'Iluminação', 'Jardim'],
  'Geral':            [],
}

export const CATEGORY_SLUGS: Record<string, string> = {
  'Eletrônicos':      'eletronicos',
  'Smartphones':      'smartphones',
  'Notebooks':        'notebooks',
  'Games':            'games',
  'Eletrodomésticos': 'eletrodomesticos',
  'Fones':            'fones',
  'Smartwatches':     'smartwatches',
  'Casa & Cozinha':   'casa-cozinha',
}

export const ARTICLE_TYPES = ['Review', 'Comparativo', 'Guia de Compra', 'Notícias'] as const
export type ArticleType = typeof ARTICLE_TYPES[number]

export const MARKETPLACES = [
  'Mercado Livre', 'Amazon', 'Shopee',
  'Americanas', 'Magazine Luiza', 'Casas Bahia', 'Outro',
] as const

export const PRODUCT_BADGES = ['Destaque', 'Mais Vendido', 'Oferta Relâmpago'] as const

export const TYPE_COLORS: Record<string, string> = {
  'Review':         'bg-emerald-100 text-emerald-700',
  'Comparativo':    'bg-amber-100 text-amber-700',
  'Guia de Compra': 'bg-sky-100 text-sky-700',
  'Notícias':       'bg-rose-100 text-rose-700',
}

// Rótulos de exibição para o usuário final
export const TYPE_LABELS: Record<string, string> = {
  'Review':         'Artigo',
  'Comparativo':    'Comparativo',
  'Guia de Compra': 'Guia de Compra',
  'Notícias':       'Notícias',
}

export const DEFAULT_AUTHOR_NAME = 'Equipe Mercadoai'
