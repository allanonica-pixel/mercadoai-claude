type EntityType = 'product' | 'article' | 'deal' | 'comparison'

/**
 * Chama o endpoint de revalidação para invalidar o cache das páginas públicas.
 * Deve ser chamado após criar, editar ou excluir conteúdo no painel admin.
 * Falhas são silenciosas — não bloqueiam o fluxo do usuário.
 */
export async function triggerRevalidation(type: EntityType): Promise<void> {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': process.env.NEXT_PUBLIC_REVALIDATE_SECRET ?? '',
      },
      body: JSON.stringify({ type }),
    })
  } catch {
    // Silencioso — revalidação é best-effort
  }
}
