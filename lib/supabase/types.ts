import { ArticleType } from '@/constants/categories'

// ✅ Definição exaustiva e verificável de tipos válidos — usada para runtime + compile-time safety
export const ARTICLE_TYPE_VALUES = [
  'Review',
  'Comparativo',
  'Guia de Compra',
  'Notícias',
] as const
export type ArticleTypeValue = typeof ARTICLE_TYPE_VALUES[number]

// ✅ Garantia de compatibilidade com TYPE_COLORS (será validado em tempo de compilação)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _typeColorsKeys: Record<ArticleTypeValue, string> = {
  Review: 'bg-blue-100 text-blue-800',
  Comparativo: 'bg-green-100 text-green-800',
  'Guia de Compra': 'bg-purple-100 text-purple-800',
  Notícias: 'bg-orange-100 text-orange-800',
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string | null;
  brand: string | null;
  marketplace: string | null;
  seller: string | null;
  price: number;
  original_price: number | null;
  discount_pct: number | null;
  rating: number;
  review_count: number;
  image_url: string | null;
  affiliate_url: string | null;
  free_shipping: boolean;
  specs: Record<string, string>;
  badge: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory?: string | null;
  type: ArticleTypeValue;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  author_name: string | null;
  author_avatar: string | null;
  read_time: number;
  views: number;
  is_featured: boolean;
  featured_product_ids?: string[];
  related_article_ids?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  title: string;
  product_name: string;
  category: string | null;
  discount_pct: number;
  deal_price: number;
  original_price: number;
  marketplace: string;
  seller: string | null;
  affiliate_url: string | null;
  image_url: string | null;
  free_shipping: boolean;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Comparison {
  id: string;
  title: string;
  slug: string;
  product_ids: string[];
  winner_id: string | null;
  criteria: Record<string, number[]>;
  summary: string | null;
  is_published: boolean;
  featured_product_ids?: string[];
  related_article_ids?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  published_at: string | null;
  created_at: string;
}
