import Link from 'next/link'
import { Article } from '@/lib/supabase/types'
import { TYPE_COLORS } from '@/constants/categories'
import { formatDate } from '@/lib/utils'

interface ArticleCardProps {
  article: Article
  showType?: boolean
}

export default function ArticleCard({ article, showType = true }: ArticleCardProps) {
  return (
    <Link
      href={`/artigo/${article.slug}`}
      className="group bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow"
      itemScope
      itemType="https://schema.org/Article"
    >
      {/* Cover image */}
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {article.cover_image ? (
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            itemProp="image"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-4xl opacity-30">📝</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Type badge */}
        {showType && (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3 ${TYPE_COLORS[article.type] ?? 'bg-gray-100 text-gray-700'}`}>
            {article.type}
          </span>
        )}

        {/* Title */}
        <h2
          className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors leading-snug"
          itemProp="headline"
        >
          {article.title}
        </h2>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4" itemProp="description">
            {article.excerpt}
          </p>
        )}

        {/* Author row */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {article.author_avatar ? (
            <img
              src={article.author_avatar}
              alt={article.author_name ?? ''}
              className="w-5 h-5 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 text-[10px] font-bold">
                {(article.author_name ?? 'M')[0]}
              </span>
            </div>
          )}
          <span itemProp="author">{article.author_name ?? 'Equipe Mercadoai'}</span>
          <span>·</span>
          <span>{article.read_time} min</span>
          <span>·</span>
          <time dateTime={article.published_at} itemProp="datePublished">
            {formatDate(article.published_at)}
          </time>
        </div>
      </div>
    </Link>
  )
}
