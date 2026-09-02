import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'

import Sidebar from '../layout/Sidebar'
import Topbar from '../layout/Topbar'

const AppLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">
        <Sidebar />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
          />

          <div className="relative h-full w-72">
            <Sidebar />

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <Topbar
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout