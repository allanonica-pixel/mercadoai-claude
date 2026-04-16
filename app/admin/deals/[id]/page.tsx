import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DealForm from '@/components/admin/DealForm'

interface EditDealPageProps {
  params: Promise<{ id: string }>
}

export default async function EditDealPage({ params }: EditDealPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!deal) notFound()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Deal</h1>
        <p className="text-sm text-gray-500 mt-1">{deal.title}</p>
      </div>
      <DealForm deal={deal} />
    </div>
  )
}
