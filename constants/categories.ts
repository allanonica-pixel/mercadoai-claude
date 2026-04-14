export const CATEGORIES = [
  'Celulares',
  'Notebooks',
  'Tablets',
  'Smartwatches',
  'Fones de Ouvido',
  'Câmeras',
  'TVs',
  'Computadores',
  'Monitores',
  'Periféricos',
  'Consoles',
  'Games',
  'Eletrodomésticos',
  'Ferramentas',
  'Beleza',
  'Saúde',
  'Casa e Decoração',
  'Moda',
  'Esportes',
  'Automotivo',
]

export const SUBCATEGORIES = {
  'Celulares': [
    'Smartphones',
    'iPhone',
    'Samsung Galaxy',
    'Xiaomi',
    'Motorola',
  ],
  'Notebooks': [
    'Gaming',
    'Ultrabooks',
    '2-em-1',
    'MacBook',
    'Dell XPS',
    'Lenovo ThinkPad',
  ],
  'TVs': [
    '4K',
    '8K',
    'QLED',
    'OLED',
    'Smart TV',
  ],
}

export const TYPE_COLORS = {
  'Review': 'bg-blue-100 text-blue-800',
  'Comparativo': 'bg-green-100 text-green-800',
  'Guia de Compra': 'bg-purple-100 text-purple-800',
  'Notícias': 'bg-orange-100 text-orange-800',
}

export const ARTICLE_TYPES = [
  'Review',
  'Comparativo',
  'Guia de Compra',
  'Notícias',
] as const

export type ArticleType = typeof ARTICLE_TYPES[number]
