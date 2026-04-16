import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ComparisonForm from '@/components/admin/ComparisonForm'

interface EditComparacaoPageProps {
  params: Promise<{ id: string }>
}

export default async function EditComparacaoPage({ params }: EditComparacaoPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: comparison } = await supabase
    .from('comparisons')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!comparison) notFound()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Comparação</h1>
        <p className="text-sm text-gray-500 mt-1">{comparison.title}</p>
      </div>
      <ComparisonForm comparison={comparison} />
    </div>
  )
}
