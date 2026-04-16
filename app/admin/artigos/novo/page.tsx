import ArticleForm from '@/components/admin/ArticleForm'

export default function NovoArtigoPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Novo Artigo</h1>
        <p className="text-sm text-gray-500 mt-1">Preencha os dados e publique o artigo.</p>
      </div>
      <ArticleForm />
    </div>
  )
}
