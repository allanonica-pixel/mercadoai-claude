import { CATEGORIES } from '@/constants/categories'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="pt-104">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo ao MercadoAI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encontre os melhores produtos com análises detalhadas, comparações e ofertas exclusivas.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            Categorias Populares
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {CATEGORIES.slice(0, 10).map((category) => (
              <Link
                key={category}
                href={`/categoria/${encodeURIComponent(category)}`}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 text-center"
              >
                <div className="font-medium text-gray-900">{category}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-gray-600 mb-6">
            Explore nossos artigos, comparativos e ofertas exclusivas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/artigo"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Ver Artigos
            </Link>
            <Link
              href="/comparativos"
              className="px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors duration-200"
            >
              Ver Comparativos
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
