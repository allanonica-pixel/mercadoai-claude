import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ArticleForm from '@/components/admin/ArticleForm'

interface EditArtigoPageProps {
  params: Promise<{ id: string }>
}

export default async function EditArtigoPage({ params }: EditArtigoPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!article) notFound()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Artigo</h1>
        <p className="text-sm text-gray-500 mt-1 truncate max-w-lg">{article.title}</p>
      </div>
      <ArticleForm article={article} />
    </div>
  )
}
