import Link from 'next/link'
import { CATEGORIES } from '@/constants/categories'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">MercadoAI</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium">
              Início
            </Link>

            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-gray-900 font-medium">
                Categorias
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  {CATEGORIES.slice(0, 6).map((category) => (
                    <Link
                      key={category}
                      href={`/categoria/${encodeURIComponent(category)}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/comparativos" className="text-gray-700 hover:text-gray-900 font-medium">
              Comparativos
            </Link>

            <Link href="/reviews" className="text-gray-700 hover:text-gray-900 font-medium">
              Reviews
            </Link>
          </div>

          <div className="flex items-center">
            <Link href="/buscar" className="text-gray-700 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
