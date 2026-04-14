export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function getTimeRemaining(expiresAt: string | null): string | null {
  if (!expiresAt) return null

  const now = new Date()
  const expiry = new Date(expiresAt)

  if (expiry <= now) return 'Expirado'

  const diffInMs = expiry.getTime() - now.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays > 0) {
    return `${diffInDays} dia${diffInDays !== 1 ? 's' : ''} restante${diffInDays !== 1 ? 's' : ''}`
  }

  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  if (diffInHours > 0) {
    return `${diffInHours} hora${diffInHours !== 1 ? 's' : ''} restante${diffInHours !== 1 ? 's' : ''}`
  }

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  return `${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''} restante${diffInMinutes !== 1 ? 's' : ''}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
