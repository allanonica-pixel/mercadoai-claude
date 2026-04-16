import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

interface EditProdutoPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProdutoPage({ params }: EditProdutoPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!product) notFound()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
        <p className="text-sm text-gray-500 mt-1 truncate max-w-lg">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
