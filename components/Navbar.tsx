'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { CATEGORIES, CATEGORY_SLUGS } from '@/constants/categories'

// Ícones SVG para cada categoria do dropdown
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Eletrônicos': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 21h8M12 17v4" />
    </svg>
  ),
  'Smartphones': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="5" y="2" width="14" height="20" rx="2" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01" />
    </svg>
  ),
  'Notebooks': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 18h20" />
    </svg>
  ),
  'Games': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 11h6M12 8v6M19 3l-5 5M14 3h5v5" />
    </svg>
  ),
  'Eletrodomésticos': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  'Fones': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 18v-6a9 9 0 0118 0v6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
    </svg>
  ),
  'Smartwatches': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7v5l3 3M9 3h6l1 4H8zM8 17l-1 4h10l-1-4" />
    </svg>
  ),
  'Casa & Cozinha': (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 22V12h6v10" />
    </svg>
  ),
}

const categoryBar = [
  { label: 'Todos', href: '/articles' },
  { label: 'Eletrônicos', href: '/categoria/eletronicos' },
  { label: 'Smartphones', href: '/categoria/smartphones' },
  { label: 'Notebooks', href: '/categoria/notebooks' },
  { label: 'Games', href: '/categoria/games' },
  { label: 'Eletrodomésticos', href: '/categoria/eletrodomesticos' },
  { label: 'Fones', href: '/categoria/fones' },
  { label: 'Smartwatches', href: '/categoria/smartwatches' },
  { label: 'Casa & Cozinha', href: '/categoria/casa-cozinha' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors px-2 py-1 rounded ${
        isActive(href)
          ? 'text-orange-500 bg-orange-50'
          : 'text-gray-700 hover:text-orange-500'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <>
      {/* Barra principal — fixed top-0 z-50 h-16 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="https://public.readdy.ai/ai/img_res/3f2f095b-9985-4601-9265-8f102d76ede6.png"
              alt="Mercadoai"
              width={140}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Links desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Dropdown Categorias */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors px-2 py-1 rounded ${
                  dropdownOpen ? 'text-orange-500 bg-orange-50' : 'text-gray-700 hover:text-orange-500'
                }`}
              >
                Categorias
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 overflow-hidden">
                  {Object.keys(CATEGORIES).filter(c => c !== 'Geral').map((cat) => (
                    <Link
                      key={cat}
                      href={`/categoria/${CATEGORY_SLUGS[cat] ?? cat.toLowerCase()}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors group"
                    >
                      <span className="text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0">
                        {CATEGORY_ICONS[cat]}
                      </span>
                      <span className="font-medium">{cat}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLink('/ofertas', 'Ofertas')}

            <span className="w-px h-5 bg-gray-200 mx-1" />

            {navLink('/articles?categoria=Review', 'Reviews')}
            {navLink('/comparativo', 'Comparativos')}
            {navLink('/noticias', 'Notícias')}
            {navLink('/guias', 'Guias')}
          </nav>

          {/* Busca */}
          <div className="hidden md:flex items-center">
            <form
              action="/products"
              method="get"
              className={`flex items-center border border-gray-200 rounded-full bg-gray-50 transition-all duration-200 ${searchFocused ? 'w-72 border-orange-300 bg-white shadow-sm' : 'w-48'}`}
            >
              <svg className="w-4 h-4 ml-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                name="q"
                placeholder="Buscar produtos..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 px-3 py-2 outline-none"
              />
            </form>
          </div>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Menu mobile */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
            <Link href="/" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700 hover:text-orange-500">Início</Link>
            <Link href="/ofertas" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700 hover:text-orange-500">Ofertas</Link>
            <Link href="/articles?categoria=Review" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700 hover:text-orange-500">Reviews</Link>
            <Link href="/comparativo" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700 hover:text-orange-500">Comparativos</Link>
            <Link href="/noticias" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700 hover:text-orange-500">Notícias</Link>
            <Link href="/guias" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-gray-700 hover:text-orange-500">Guias de Compra</Link>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categorias</p>
              {Object.keys(CATEGORIES).filter(c => c !== 'Geral').map((cat) => (
                <Link
                  key={cat}
                  href={`/categoria/${CATEGORY_SLUGS[cat] ?? cat.toLowerCase()}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-2 text-sm text-gray-600 hover:text-orange-500 transition-colors"
                >
                  <span className="text-gray-400">{CATEGORY_ICONS[cat]}</span>
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Barra de categorias — fixed top-16 z-40 h-10 */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center overflow-x-auto scrollbar-none gap-1 h-10">
            {categoryBar.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  pathname === href || (href !== '/articles' && pathname.startsWith(href))
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Ofertas com ponto pulsante */}
            <Link
              href="/ofertas"
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors whitespace-nowrap ml-1"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              Ofertas
            </Link>

            <Link
              href="/articles"
              className="flex-shrink-0 ml-auto text-xs font-medium text-orange-500 hover:text-orange-700 transition-colors whitespace-nowrap pl-4"
            >
              Ver todas →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
