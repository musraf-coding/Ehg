import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'

import Sidebar from '../layout/Sidebar'
import Topbar from '../layout/Topbar'

const AppLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-dvh overflow-x-hidden bg-slate-100">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-72">
        <Sidebar />
      </div>

      {/* Mobile / tablet sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]"
          />

          {/* Drawer */}
          <div className="relative h-dvh w-[85%] max-w-72 shadow-2xl">
            <Sidebar />

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B3A98]/50"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main application area */}
      <div className="flex min-h-dvh min-w-0 flex-col lg:pl-72">
        <Topbar
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

       <footer className="border-t border-slate-200 bg-white">
  <div className="w-full overflow-hidden bg-white">
    <img
      src="/images/footer.jpeg"
      alt="EHG Holdings"
      className="block h-auto w-full object-contain"
    />
  </div>

  <div className="px-4 py-3 sm:px-6 lg:px-8">
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <p>© 2026 EHG Holdings. All rights reserved.</p>

      <p>Tender Management &amp; Business Management System</p>
    </div>
  </div>
</footer>
      </div>
    </div>
  )
}

export default AppLayout  