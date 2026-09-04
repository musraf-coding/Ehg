import { Bell, Menu } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

const getInitials = (name) => {
  if (!name) return 'E'

  const parts = name.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth()

  const initials = getInitials(user?.name)

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* LEFT — menu button + page header */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B3A98]/40 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <p className="hidden text-xs font-medium text-slate-500 sm:block">
            EHG Holdings
          </p>

          <h2 className="truncate text-sm font-semibold text-slate-950 sm:text-lg">
          <span className="sm:hidden">Dashboard</span>
          <span className="hidden sm:inline">Business Management Dashboard</span>
        </h2>
        </div>
      </div>

      {/* RIGHT — notifications + account */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B3A98]/40"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span
            aria-hidden="true"
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"
          />
        </button>

        <div className="hidden pl-1 text-right sm:block">
          <p className="max-w-[140px] truncate text-sm font-semibold text-slate-900">
            {user?.name}
          </p>

          <p className="text-xs text-slate-500">{user?.role}</p>
        </div>

        <div
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6B3A98] to-[#2F8CC9] text-xs font-bold text-white"
        >
          {initials}
        </div>
      </div>
    </header>
  )
}

export default Topbar