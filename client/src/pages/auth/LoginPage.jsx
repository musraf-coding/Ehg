import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  FileCheck2,
  Users,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

const FEATURES = [
  {
    icon: FileCheck2,
    label: 'Tender Management',
  },
  {
    icon: ShieldCheck,
    label: 'Compliance & Documents',
  },
  {
    icon: Users,
    label: 'Team Collaboration',
  },
]

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
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
      
      case 'CEO':
        navigate('/ceo/dashboard', { replace: true })
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
   <div className="min-h-dvh bg-slate-100 lg:grid lg:grid-cols-2">
      {/* ============================================================ */}
      {/* LEFT — brand panel. Hidden below lg; desktop-only real estate */}
      {/* ============================================================ */}
      <div className="relative hidden overflow-hidden bg-[#0F172A] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* subtle branded accent glows — quiet, not decoration-heavy */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#6B3A98] opacity-20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-[#2F8CC9] opacity-15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_100%]"
        />

        <div className="relative">
          <img
            src="/images/logo.jpeg"
            alt="EHG Holdings"
            className="h-16 max-w-[240px] w-auto object-contain"
          />

          <h1 className="mt-10 text-4xl font-bold tracking-tight text-white">
            EHG Holdings
          </h1>

          <p className="mt-4 max-w-sm text-base leading-7 text-slate-300">
            Tender Management &amp; Business Management System
          </p>

          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
            Manage tenders, assignments, compliance, documents, attendance
            and business operations from one secure platform.
          </p>

          <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2F8CC9]" />
            <span className="text-xs font-medium text-slate-300">
              Secure Internal Business Platform
            </span>
          </div>
        </div>

        <div className="relative">
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#2F8CC9]">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className="text-sm text-slate-200">{label}</span>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-xs text-slate-500">© EHG Holdings</p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT — login area. Full width below lg.                     */}
      {/* ============================================================ */}
      <div className="flex min-h-dvh flex-col justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-0 xl:px-20">
        <div className="mx-auto w-full max-w-md lg:max-w-sm xl:max-w-md">
          {/* Mobile / tablet brand header — replaces the left panel below lg */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <img
              src="/images/logo.jpeg"
              alt="EHG Holdings"
              className="h-14 max-w-[210px] w-auto object-contain"
            />
            <p className="mt-4 text-lg font-bold text-slate-950">
              EHG Holdings
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Tender Management &amp; Business Management System
            </p>
          </div>

          <div className="text-center lg:text-left">
            <p className="text-sm font-semibold text-[#6B3A98]">
              EHG Holdings
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Welcome back
            </h2>

            <p className="mt-3 text-sm text-slate-500">
              Sign in to access your EHG Holdings workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
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
                  inputMode="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@ehgholdings.com"
                  className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-base text-slate-900 outline-none transition focus:border-[#6B3A98] focus:ring-2 focus:ring-[#6B3A98]/20 sm:text-sm"
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
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-11 text-base text-slate-900 outline-none transition focus:border-[#6B3A98] focus:ring-2 focus:ring-[#6B3A98]/20 sm:text-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#6B3A98]/30"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[#6B3A98] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#5B3184] focus:outline-none focus:ring-2 focus:ring-[#6B3A98] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-slate-400">
              <ShieldCheck size={14} className="text-[#2F8CC9]" />
              <span>Secure access for authorized personnel</span>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Authorized EHG Holdings users only
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage