'use client'

import AdminSidebar from './AdminSidebar'

interface AdminShellProps {
  title: string
  children: React.ReactNode
}

export default function AdminShell({ title, children }: AdminShellProps) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 ml-56 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base font-semibold text-gray-800">{title}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            <span>Admin</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
