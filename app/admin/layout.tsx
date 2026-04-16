import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header admin */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900 text-lg">Mercadoai</span>
          <span className="text-xs font-medium bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <a
          href="/"
          target="_blank"
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          Ver site
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </header>

      <div className="flex pt-14 min-h-screen">
        <AdminSidebar />
        <main className="flex-1 ml-56 p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
