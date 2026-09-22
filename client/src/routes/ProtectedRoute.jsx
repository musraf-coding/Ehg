import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">
            Loading EHG Holdings...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardByRole = {
      ADMIN: '/admin/dashboard',
       CEO: '/ceo/dashboard',
      MANAGER: '/manager/dashboard',
      EMPLOYEE: '/employee/dashboard',
    }

    return (
      <Navigate
        to={dashboardByRole[user.role] || '/login'}
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute