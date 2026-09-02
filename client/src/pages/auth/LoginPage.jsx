import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockKeyhole, Mail, Building2 } from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    if (error) {
      setError('')
    }
  }

  const redirectByRole = (role) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin/dashboard', { replace: true })
        break

      case 'MANAGER':
        navigate('/manager/dashboard', { replace: true })
        break

      case 'EMPLOYEE':
        navigate('/employee/dashboard', { replace: true })
        break

      default:
        navigate('/login', { replace: true })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const email = formData.email.trim()

    if (!email || !formData.password) {
      setError('Please enter your email and password.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const user = await login(email, formData.password)

      redirectByRole(user.role)
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to login. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid lg:grid-cols-2">
        <div className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <Building2 size={26} />
            </div>

            <h1 className="mt-8 text-4xl font-bold tracking-tight">
              EHG Holdings
            </h1>

            <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
              Tender Management & Business Management System
            </p>
          </div>

          <div>
            <p className="text-sm leading-6 text-slate-400">
              Manage tenders, assignments, compliance, documents,
              attendance and business operations from one secure platform.
            </p>

            <p className="mt-6 text-xs text-slate-500">
              © EHG Holdings
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="mx-auto max-w-md">
            <div className="lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Building2 size={23} />
              </div>

              <p className="mt-4 text-lg font-bold text-slate-950">
                EHG Holdings
              </p>
            </div>

            <div className="mt-8 lg:mt-0">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Secure Access
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Welcome back
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                Sign in to access your EHG Holdings dashboard.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@ehgholdings.com"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-400">
              Authorized EHG Holdings users only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage