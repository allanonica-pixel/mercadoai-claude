'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const slides = [
  {
    title: 'Os melhores notebooks de 2026',
    subtitle: 'Comparamos mais de 50 modelos para você escolher com segurança e economia',
    cta: 'Ver análises',
    href: '/categoria/notebooks',
    bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900',
  },
  {
    title: 'Smartphones com melhor custo-benefício',
    subtitle: 'Reviews honestos dos principais lançamentos — sem patrocinadoras, sem viés',
    cta: 'Ver reviews',
    href: '/artigos',
    bg: 'bg-gradient-to-br from-zinc-900 via-neutral-800 to-stone-900',
  },
  {
    title: 'Ofertas do dia nos maiores marketplaces',
    subtitle: 'Economize até 60% em produtos selecionados diariamente pela nossa equipe',
    cta: 'Ver ofertas',
    href: '/ofertas',
    bg: 'bg-gradient-to-br from-stone-900 via-slate-800 to-slate-900',
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, paused])

  return (
    <div
      className="relative w-full h-[360px] md:h-[420px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${slide.bg} ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-5 bg-[url('/noise.png')] bg-repeat" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-12 z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white max-w-2xl leading-tight mb-4 drop-shadow-lg">
              {slide.title}
            </h2>
            <p className="text-gray-300 text-base md:text-lg max-w-xl mb-8 leading-relaxed">
              {slide.subtitle}
            </p>
            <Link
              href={slide.href}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-orange-500/30"
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      ))}

      {/* Arrow prev */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-colors"
        aria-label="Slide anterior"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Arrow next */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-colors"
        aria-label="Próximo slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-orange-500' : 'w-2 h-2 bg-white/40 hover:bg-white/60'}`}
            aria-label={`Ir para slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Badge */}
      <div className="absolute bottom-5 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
        <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-xs text-white font-medium">+10k produtos analisados</span>
      </div>
    </div>
  )
}
