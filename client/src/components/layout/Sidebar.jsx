import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  FolderOpen,
  ReceiptText,
  ChartNoAxesCombined,
  Clock3,
  CalendarDays,
  Users,
  Bell,
  Settings,
  LogOut,
  BriefcaseBusiness,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

const menuByRole = {
  ADMIN: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Tender Management', icon: BriefcaseBusiness, path: '/admin/tenders' },
    { label: 'Compliance', icon: ClipboardCheck, path: '/admin/compliance' },
    { label: 'Document Library', icon: FolderOpen, path: '/admin/documents' },
    { label: 'Invoices', icon: ReceiptText, path: '/admin/invoices' },
    { label: 'Reports & Analytics', icon: ChartNoAxesCombined, path: '/admin/reports' },
    { label: 'Attendance', icon: Clock3, path: '/admin/attendance' },
    { label: 'Leave Management', icon: CalendarDays, path: '/admin/leave' },
    { label: 'Users', icon: Users, path: '/admin/users' },
    { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ],

  MANAGER: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/manager/dashboard' },
    { label: 'Tender Management', icon: BriefcaseBusiness, path: '/manager/tenders' },
    { label: 'Team / Assigned Tenders', icon: FileText, path: '/manager/team-tenders' },
    { label: 'Compliance Review', icon: ClipboardCheck, path: '/manager/compliance' },
    { label: 'Document Library', icon: FolderOpen, path: '/manager/documents' },
    { label: 'Invoices', icon: ReceiptText, path: '/manager/invoices' },
    { label: 'Reports & Analytics', icon: ChartNoAxesCombined, path: '/manager/reports' },
    { label: 'Attendance', icon: Clock3, path: '/manager/attendance' },
    { label: 'Leave', icon: CalendarDays, path: '/manager/leave' },
    { label: 'Notifications', icon: Bell, path: '/manager/notifications' },
    { label: 'Settings', icon: Settings, path: '/manager/settings' },
  ],

  EMPLOYEE: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/employee/dashboard' },
    { label: 'Assigned Tenders', icon: BriefcaseBusiness, path: '/employee/assigned-tenders' },
    { label: 'My Documents', icon: FolderOpen, path: '/employee/documents' },
    { label: 'Compliance Checklist', icon: ClipboardCheck, path: '/employee/compliance' },
    { label: 'Comments / Activity', icon: FileText, path: '/employee/activity' },
    { label: 'Attendance', icon: Clock3, path: '/employee/attendance' },
    { label: 'Leave', icon: CalendarDays, path: '/employee/leave' },
    { label: 'Notifications', icon: Bell, path: '/employee/notifications' },
    { label: 'Settings', icon: Settings, path: '/employee/settings' },
  ],
}

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const menuItems = menuByRole[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950 text-white">
      <div className="border-b border-slate-800 px-6 py-6">
        <h1 className="text-xl font-bold tracking-tight">
          EHG Holdings
        </h1>

        <p className="mt-1 text-xs text-slate-400">
          Business Management System
        </p>
      </div>

      <div className="border-b border-slate-800 px-6 py-4">
        <p className="truncate text-sm font-semibold">
          {user?.name}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {user?.role}
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white text-slate-950'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />

                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar