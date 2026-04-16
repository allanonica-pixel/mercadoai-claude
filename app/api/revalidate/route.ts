import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

type EntityType = 'product' | 'article' | 'deal' | 'comparison'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let entityType: EntityType | undefined
  try {
    const body = await request.json()
    entityType = body.type as EntityType
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  // Revalida homepage sempre (seções de artigos recentes, produtos em destaque)
  revalidatePath('/')

  switch (entityType) {
    case 'product':
      revalidatePath('/produto/[slug]', 'page')
      revalidatePath('/categoria/[category]', 'page')
      revalidatePath('/ofertas')
      break

    case 'article':
      revalidatePath('/artigo/[slug]', 'page')
      revalidatePath('/articles')
      revalidatePath('/reviews')
      revalidatePath('/guias')
      revalidatePath('/noticias')
      revalidatePath('/comparativo')
      break

    case 'deal':
      revalidatePath('/ofertas')
      break

    case 'comparison':
      revalidatePath('/comparativo/[slug]', 'page')
      revalidatePath('/comparativo')
      break

    default:
      // Revalida tudo como fallback
      revalidatePath('/', 'layout')
  }

  return NextResponse.json({ revalidated: true, type: entityType ?? 'all' })
}
