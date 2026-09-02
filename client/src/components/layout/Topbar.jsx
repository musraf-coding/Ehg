import { Bell, Menu } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth()

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-sm text-slate-500">
            EHG Holdings
          </p>

          <h2 className="text-lg font-semibold text-slate-950">
            Business Management Dashboard
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">
            {user?.name}
          </p>

          <p className="text-xs text-slate-500">
            {user?.role}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
          {user?.name?.charAt(0)?.toUpperCase() || 'E'}
        </div>
      </div>
    </header>
  )
}

export default Topbar