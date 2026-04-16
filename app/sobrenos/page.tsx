import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça o MercadoAI — nosso propósito, como trabalhamos e como entrar em contato conosco.',
}

const faqs = [
  {
    q: 'O MercadoAI é gratuito?',
    a: 'Sim, completamente gratuito. Monetizamos por meio de links de afiliados — quando você compra através dos nossos links, recebemos uma pequena comissão sem custo adicional para você.',
  },
  {
    q: 'Como vocês escolhem os produtos que recomendam?',
    a: 'Nossa equipe analisa avaliações de usuários, especificações técnicas, custo-benefício e confiabilidade do vendedor antes de qualquer recomendação.',
  },
  {
    q: 'Os preços são atualizados em tempo real?',
    a: 'Trabalhamos para manter os preços atualizados, mas recomendamos sempre verificar o valor final no marketplace parceiro antes de finalizar a compra.',
  },
  {
    q: 'Posso sugerir um produto para análise?',
    a: 'Claro! Envie sua sugestão por e-mail e nossa equipe avaliará incluí-la em nossa próxima edição de conteúdo.',
  },
  {
    q: 'Como funciona o programa de afiliados?',
    a: 'Somos participantes de programas de afiliados de Mercado Livre, Amazon, Shopee e outros. Ao clicar em nossos links e efetuar uma compra, recebemos uma comissão sem qualquer acréscimo no seu preço.',
  },
]

export default function SobreNosPage() {
  return (
    <div className="pt-[104px]">

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 to-white border-b border-gray-100 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold mb-4">
            Nossa missão
          </span>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Sobre o MercadoAI
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Ajudamos consumidores brasileiros a tomar decisões de compra mais inteligentes — com comparativos honestos, reviews detalhados e as melhores ofertas dos principais marketplaces.
          </p>
        </div>
      </section>

      {/* Quem somos */}
      <section className="py-16 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quem somos</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  O MercadoAI é um portal independente de comparação de produtos e análises de consumo. Nascemos da frustração com a falta de conteúdo técnico e honesto em português sobre tecnologia e produtos do cotidiano.
                </p>
                <p>
                  Nossa equipe é formada por entusiastas de tecnologia, consumidores experientes e redatores especializados que testam e analisam produtos antes de qualquer publicação.
                </p>
                <p>
                  Somos completamente independentes — nossas opiniões não são influenciadas por fabricantes ou marketplaces.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '500+', label: 'Produtos analisados' },
                { num: '100+', label: 'Artigos publicados' },
                { num: '50+', label: 'Comparativos' },
                { num: '100%', label: 'Independente' },
              ].map(({ num, label }) => (
                <div key={label} className="bg-orange-50 rounded-xl p-5 text-center">
                  <p className="text-3xl font-black text-orange-600">{num}</p>
                  <p className="text-sm text-gray-600 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Perguntas frequentes</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group bg-white rounded-xl border border-gray-200 overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors list-none">
                  {q}
                  <svg
                    className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fale conosco</h2>
          <p className="text-gray-500 mb-8">
            Tem dúvidas, sugestões ou quer propor uma parceria? Entre em contato.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <a
                  href="mailto:contato@mercadoai.com"
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  contato@mercadoai.com
                </a>
              </div>
              <div className="text-sm text-gray-500">
                <p>Respondemos em até 48 horas úteis.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            <Link href="/termos" className="hover:text-gray-700 transition-colors">Termos de Uso</Link>
            <span>·</span>
            <Link href="/privacidade" className="hover:text-gray-700 transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
