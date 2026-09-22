import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  UserPlus,
  Users,
  Mail,
  Building2,
  ShieldCheck,
  CircleUserRound,
  X,
  Eye,
  EyeOff,
   Settings2,
} from 'lucide-react'

import api from '../../services/api'


const roleStyles = {
  ADMIN: 'bg-purple-50 text-[#6B3A98] ring-1 ring-purple-200',
  CEO: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  MANAGER: 'bg-sky-50 text-[#2F8CC9] ring-1 ring-sky-200',
  EMPLOYEE: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
}

const statusStyles = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  INACTIVE: 'bg-red-50 text-red-700 ring-1 ring-red-200',
}

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'EMPLOYEE',
  department: '',
  status: 'ACTIVE',
}

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [showAddUser, setShowAddUser] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState(initialForm)


  const [showCompanyModal, setShowCompanyModal] = useState(false)
const [selectedUser, setSelectedUser] = useState(null)
const [userCompanies, setUserCompanies] = useState([])
const [companyLoading, setCompanyLoading] = useState(false)
const [companyError, setCompanyError] = useState('')


const [availableCompanies, setAvailableCompanies] = useState([])
const [selectedCompanyId, setSelectedCompanyId] = useState('')
const [isPrimaryCompany, setIsPrimaryCompany] = useState(false)
const [assigningCompany, setAssigningCompany] = useState(false)

const [updatingMembership, setUpdatingMembership] = useState(null)



const [showPermissionModal, setShowPermissionModal] = useState(false)
const [permissionUser, setPermissionUser] = useState(null)
const [companyPermissions, setCompanyPermissions] = useState([])
const [permissionCompanies, setPermissionCompanies] = useState([])
const [permissionLoading, setPermissionLoading] = useState(false)
const [permissionError, setPermissionError] = useState('')



const [selectedPermissionCompanyId, setSelectedPermissionCompanyId] =
  useState('')

const [permissionForm, setPermissionForm] = useState({
  canView: true,
  canManage: false,
  canViewMetrics: false,
})

const [savingPermission, setSavingPermission] = useState(false)


  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/users')

      setUsers(response.data.users || [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load users.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const employeeCount = useMemo(
    () =>
      users.filter(
        (user) => user.role === 'EMPLOYEE'
      ).length,
    [users]
  )

  const managerCount = useMemo(
    () =>
      users.filter(
        (user) => user.role === 'MANAGER'
      ).length,
    [users]
  )

  const activeCount = useMemo(
    () =>
      users.filter(
        (user) => user.status === 'ACTIVE'
      ).length,
    [users]
  )

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return users
    }

    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.department
          ?.toLowerCase()
          .includes(query) ||
        user.role?.toLowerCase().includes(query) ||
        user.status?.toLowerCase().includes(query)
      )
    })
  }, [users, search])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setShowPassword(false)
    setError('')
  }

  const closeModal = () => {
    setShowAddUser(false)
    resetForm()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!form.name.trim()) {
      setError('Full name is required.')
      return
    }

    if (!form.email.trim()) {
      setError('Email is required.')
      return
    }

    if (form.password.length < 8) {
      setError(
        'Password must contain at least 8 characters.'
      )
      return
    }

    try {
      setSubmitting(true)

      const response = await api.post('/users', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
        department: form.department.trim(),
        status: form.status,
      })

      setUsers((current) => [
        ...current,
        response.data.user,
      ])

      setSuccess(
        `${response.data.user.name} was added successfully.`
      )

      setShowAddUser(false)
      resetForm()
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to create user.'
      )
    } finally {
      setSubmitting(false)
    }
  }


  const openCompanyModal = async (user) => {
  try {
    setSelectedUser(user)
    setShowCompanyModal(true)
    setCompanyLoading(true)
    setCompanyError('')
    setUserCompanies([])
    setSelectedCompanyId('')
    setIsPrimaryCompany(false)

    const [membershipResponse, companiesResponse] =
      await Promise.all([
        api.get(`/users/${user.id}/companies`),
        api.get('/companies'),
      ])

    setUserCompanies(
      membershipResponse.data.companies ||
        membershipResponse.data.data ||
        []
    )

    setAvailableCompanies(
      companiesResponse.data.companies ||
        companiesResponse.data.data ||
        []
    )
  } catch (err) {
    setCompanyError(
      err.response?.data?.message ||
        'Unable to load company memberships.'
    )
  } finally {
    setCompanyLoading(false)
  }
}

const handleAssignCompany = async () => {
  if (!selectedUser || !selectedCompanyId) {
    setCompanyError('Please select a company.')
    return
  }

  try {
    setAssigningCompany(true)
    setCompanyError('')

    await api.post(
      `/users/${selectedUser.id}/companies`,
      {
        companyId: Number(selectedCompanyId),
        isPrimary: isPrimaryCompany,
      }
    )

    const response = await api.get(
      `/users/${selectedUser.id}/companies`
    )

    setUserCompanies(
      response.data.companies ||
        response.data.data ||
        []
    )

    setSelectedCompanyId('')
    setIsPrimaryCompany(false)
  } catch (err) {
    setCompanyError(
      err.response?.data?.message ||
        'Unable to assign company.'
    )
  } finally {
    setAssigningCompany(false)
  }
}



const handleSetPrimaryCompany = async (membership) => {
  if (!selectedUser) return

  try {
    setUpdatingMembership(membership.company_id)
    setCompanyError('')

    const response = await api.put(
      `/users/${selectedUser.id}/companies/${membership.company_id}`,
      {
        isPrimary: true,
      }
    )

    setUserCompanies(
      response.data.companies ||
        response.data.data ||
        []
    )
  } catch (err) {
    setCompanyError(
      err.response?.data?.message ||
        'Unable to update primary company.'
    )
  } finally {
    setUpdatingMembership(null)
  }
}

const handleDeactivateCompany = async (membership) => {
  if (!selectedUser) return

  const confirmed = window.confirm(
    `Deactivate ${membership.company_name} for ${selectedUser.name}? The membership history will be preserved.`
  )

  if (!confirmed) return

  try {
    setUpdatingMembership(membership.company_id)
    setCompanyError('')

    const response = await api.delete(
      `/users/${selectedUser.id}/companies/${membership.company_id}`,
      {
        data: {},
      }
    )

    setUserCompanies(
      response.data.companies ||
        response.data.data ||
        []
    )
  } catch (err) {
    setCompanyError(
      err.response?.data?.message ||
        'Unable to deactivate company membership.'
    )
  } finally {
    setUpdatingMembership(null)
  }
}



const openPermissionModal = async (user) => {
  try {
    setPermissionUser(user)
    setShowPermissionModal(true)
    setPermissionLoading(true)
    setPermissionError('')
    setCompanyPermissions([])
    setPermissionCompanies([])

    setSelectedPermissionCompanyId('')

setPermissionForm({
  canView: true,
  canManage: false,
  canViewMetrics: false,
})

    const [permissionResponse, companiesResponse] =
      await Promise.all([
        api.get(
          `/users/${user.id}/company-permissions`
        ),
        api.get('/companies'),
      ])

    setCompanyPermissions(
      permissionResponse.data.permissions ||
        permissionResponse.data.data ||
        []
    )

    setPermissionCompanies(
      companiesResponse.data.companies ||
        companiesResponse.data.data ||
        []
    )
  } catch (err) {
    setPermissionError(
      err.response?.data?.message ||
        'Unable to load company permissions.'
    )
  } finally {
    setPermissionLoading(false)
  }
}



const handleSavePermission = async () => {
  if (!permissionUser || !selectedPermissionCompanyId) {
    setPermissionError('Please select a company.')
    return
  }

  try {
    setSavingPermission(true)
    setPermissionError('')

    const response = await api.post(
      `/users/${permissionUser.id}/company-permissions`,
      {
        companyId: Number(selectedPermissionCompanyId),
        canView: permissionForm.canView,
        canManage: permissionForm.canManage,
        canViewMetrics: permissionForm.canViewMetrics,
      }
    )

    setCompanyPermissions(
      response.data.permissions ||
        response.data.data ||
        []
    )

    setSelectedPermissionCompanyId('')

    setPermissionForm({
      canView: true,
      canManage: false,
      canViewMetrics: false,
    })
  } catch (err) {
    setPermissionError(
      err.response?.data?.message ||
        'Unable to save company permission.'
    )
  } finally {
    setSavingPermission(false)
  }
}




const handleRevokePermission = async (permission) => {
  if (!permissionUser) return

  const confirmed = window.confirm(
    `Revoke access to ${permission.company_name} for ${permissionUser.name}?`
  )

  if (!confirmed) return

  try {
    setSavingPermission(true)
    setPermissionError('')

    const response = await api.delete(
      `/users/${permissionUser.id}/company-permissions/${permission.company_id}`
    )

    setCompanyPermissions(
      response.data.permissions ||
        response.data.data ||
        []
    )
  } catch (err) {
    setPermissionError(
      err.response?.data?.message ||
        'Unable to revoke company permission.'
    )
  } finally {
    setSavingPermission(false)
  }
}

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Users
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage EHG Holdings employees and system
            accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError('')
            setSuccess('')
            setShowAddUser(true)
          }}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#6B3A98] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5A3182] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B3A98]/40 sm:w-auto"
        >
          <UserPlus size={18} />
          Add User
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {/* Summary cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Users
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                {users.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-[#6B3A98]">
              <Users size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Employees
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                {employeeCount}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#2F8CC9]">
              <CircleUserRound size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Managers
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                {managerCount}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Accounts
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">
                {activeCount}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Users panel */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-4 py-5 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              System Users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {employeeCount} employees and{' '}
              {managerCount} managers currently registered.
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search users..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#6B3A98] focus:ring-2 focus:ring-[#6B3A98]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            Loading users...
          </div>
        ) : error && !showAddUser ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchUsers}
              className="mt-4 text-sm font-semibold text-[#6B3A98] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Users
              size={32}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No users found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try a different search term.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Department
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                            {user.name
                              ?.trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {user.name}
                            </p>

                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail size={13} />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Building2
                            size={15}
                            className="text-slate-400"
                          />

                          {user.department || '—'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            roleStyles[user.role] ||
                            roleStyles.EMPLOYEE
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[user.status] ||
                            statusStyles.INACTIVE
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openCompanyModal(user)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-purple-200 hover:bg-purple-50 hover:text-[#6B3A98]"
                          >
                            <Settings2 size={15} />
                            Manage Companies
                          </button>

                          {['CEO', 'MANAGER'].includes(user.role) && (
                            <button
                              type="button"
                              onClick={() => openPermissionModal(user)}
                              className="inline-flex items-center gap-2 rounded-lg border border-sky-200 px-3 py-2 text-xs font-semibold text-[#2F8CC9] transition hover:bg-sky-50"
                            >
                              <ShieldCheck size={15} />
                              Permissions
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {user.name
                        ?.trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold text-slate-900">
                        {user.name}
                      </p>

                      <p className="mt-1 break-all text-xs text-slate-500">
                        {user.email}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            roleStyles[user.role] ||
                            roleStyles.EMPLOYEE
                          }`}
                        >
                          {user.role}
                        </span>

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[user.status] ||
                            statusStyles.INACTIVE
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>

                      {user.department && (
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                          <Building2 size={13} />
                          {user.department}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close add user dialog"
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]"
          />

          <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Add User
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new EHG Holdings system
                  account.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-6"
            >
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Tonderai Makanjera"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#6B3A98] focus:ring-2 focus:ring-[#6B3A98]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="employee@ehgholdings.com"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#6B3A98] focus:ring-2 focus:ring-[#6B3A98]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#6B3A98] focus:ring-2 focus:ring-[#6B3A98]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Role *
                  </label>

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-[#6B3A98] focus:ring-2 focus:ring-[#6B3A98]/10"
                  >
                   <option value="EMPLOYEE">
                      Employee
                    </option>
                    <option value="MANAGER">
                      Manager
                    </option>
                    <option value="CEO">
                      CEO
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status *
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-[#6B3A98] focus:ring-2 focus:ring-[#6B3A98]/10"
                  >
                    <option value="ACTIVE">
                      Active
                    </option>
                    <option value="INACTIVE">
                      Inactive
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Department
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Tender Operations"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-[#6B3A98] focus:ring-2 focus:ring-[#6B3A98]/10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Temporary Password *
                  </label>

                  <div className="relative">
                    <input
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      className="h-11 w-full rounded-xl border border-slate-200 px-3.5 pr-12 text-sm outline-none transition focus:border-[#6B3A98] focus:ring-2 focus:ring-[#6B3A98]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    The user can use this password to sign
                    in after the account is created.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="min-h-[44px] rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[44px] rounded-xl bg-[#6B3A98] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5A3182] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? 'Creating...'
                    : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Company Membership Modal */}
{showCompanyModal && (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
    <button
      type="button"
      aria-label="Close company membership dialog"
      onClick={() => setShowCompanyModal(false)}
      className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1px]"
    />

    <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B3A98]">
            Company Membership
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            {selectedUser?.name}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            View and manage this user's company assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCompanyModal(false)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-6">
        {!companyLoading && (
  <div className="mb-6 rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
    <div>
      <h3 className="text-sm font-semibold text-slate-900">
        Assign Company
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        Add this user to another company under EHG Holdings.
      </p>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
      <select
        value={selectedCompanyId}
        onChange={(event) => {
          setSelectedCompanyId(event.target.value)
          setCompanyError('')
        }}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition focus:border-[#6B3A98] focus:ring-2 focus:ring-[#6B3A98]/10"
      >
        <option value="">
          Select company
        </option>

        {availableCompanies
          .filter(
            (company) =>
              company.status === 'ACTIVE'
          )
          .map((company) => (
            <option
              key={company.id}
              value={company.id}
            >
              {company.name}
              {company.code
                ? ` (${company.code})`
                : ''}
            </option>
          ))}
      </select>

      <button
        type="button"
        onClick={handleAssignCompany}
        disabled={
          assigningCompany ||
          !selectedCompanyId
        }
        className="h-11 rounded-xl bg-[#6B3A98] px-5 text-sm font-semibold text-white transition hover:bg-[#5A3182] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {assigningCompany
          ? 'Assigning...'
          : 'Assign'}
      </button>
    </div>

    <label className="mt-4 inline-flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={isPrimaryCompany}
        onChange={(event) =>
          setIsPrimaryCompany(
            event.target.checked
          )
        }
        className="h-4 w-4 rounded border-slate-300 accent-[#6B3A98]"
      />

      <span className="text-sm text-slate-600">
        Set as primary company
      </span>
    </label>
  </div>
)}



        {companyLoading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Loading company memberships...
          </p>
        ) : companyError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {companyError}
          </div>
        ) : userCompanies.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center">
            <Building2
              size={30}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-semibold text-slate-700">
              No company assigned
            </p>

            <p className="mt-1 text-sm text-slate-500">
              This user does not currently have a company membership.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userCompanies.map((membership) => (
             <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <p className="font-semibold text-slate-900">
      {membership.company_name ||
        membership.company?.name ||
        'Company'}
    </p>

    <p className="mt-1 text-xs text-slate-500">
      {membership.company_code ||
        membership.company?.code ||
        'No company code'}
    </p>
  </div>

  <div className="flex flex-col items-start gap-3 sm:items-end">
    <div className="flex flex-wrap gap-2">
      {Boolean(membership.is_primary) && (
        <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-[#6B3A98] ring-1 ring-purple-200">
          Primary
        </span>
      )}

      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          membership.status === 'ACTIVE'
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
            : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
        }`}
      >
        {membership.status}
      </span>
    </div>

    {membership.status === 'ACTIVE' && (
      <div className="flex flex-wrap gap-2">
        {!Boolean(membership.is_primary) && (
          <button
            type="button"
            onClick={() =>
              handleSetPrimaryCompany(membership)
            }
            disabled={
              updatingMembership ===
              membership.company_id
            }
            className="rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-[#6B3A98] transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Set Primary
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            handleDeactivateCompany(membership)
          }
          disabled={
            updatingMembership ===
            membership.company_id
          }
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Deactivate
        </button>
      </div>
    )}
  </div>
</div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-slate-200 px-6 py-4">
        <button
          type="button"
          onClick={() => setShowCompanyModal(false)}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


{showPermissionModal && permissionUser && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B3A98]">
            Company Delegation
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Company Permissions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {permissionUser.name}
            {' · '}
            {permissionUser.role}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowPermissionModal(false)
            setPermissionUser(null)
            setPermissionError('')
          }}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
        {permissionLoading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading company permissions...
          </div>
        ) : (
          <>
            {permissionError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {permissionError}
              </div>
            )}

            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
  <div className="mb-4">
    <h3 className="text-sm font-semibold text-slate-900">
      Grant / Update Company Access
    </h3>

    <p className="mt-1 text-xs text-slate-500">
      Select a company and choose what this user can access.
    </p>
  </div>

  <div className="space-y-4">
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        Company
      </label>

      <select
        value={selectedPermissionCompanyId}
onChange={(e) => {
  const companyId = e.target.value

  setSelectedPermissionCompanyId(companyId)
  setPermissionError('')

  const existingPermission =
    companyPermissions.find(
      (permission) =>
        Number(permission.company_id) ===
        Number(companyId)
    )

  if (existingPermission) {
    setPermissionForm({
      canView: Boolean(existingPermission.can_view),
      canManage: Boolean(existingPermission.can_manage),
      canViewMetrics: Boolean(
        existingPermission.can_view_metrics
      ),
    })
  } else {
    setPermissionForm({
      canView: true,
      canManage: false,
      canViewMetrics: false,
    })
  }
}}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#6B3A98] focus:ring-2 focus:ring-purple-100"
      >
        <option value="">Select company</option>

        {permissionCompanies
          .filter((company) => company.status === 'ACTIVE')
          .map((company) => (
            <option
              key={company.id}
              value={company.id}
            >
              {company.name}
              {company.code
                ? ` (${company.code})`
                : ''}
            </option>
          ))}
      </select>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3">
        <input
          type="checkbox"
          checked={permissionForm.canView}
          onChange={(e) =>
            setPermissionForm((prev) => ({
              ...prev,
              canView: e.target.checked,
            }))
          }
        />

        <span className="text-sm font-medium text-slate-700">
          View
        </span>
      </label>

      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3">
        <input
          type="checkbox"
          checked={permissionForm.canManage}
          onChange={(e) =>
            setPermissionForm((prev) => ({
              ...prev,
              canManage: e.target.checked,
            }))
          }
        />

        <span className="text-sm font-medium text-slate-700">
          Manage
        </span>
      </label>

      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-3">
        <input
          type="checkbox"
          checked={permissionForm.canViewMetrics}
          onChange={(e) =>
            setPermissionForm((prev) => ({
              ...prev,
              canViewMetrics: e.target.checked,
            }))
          }
        />

        <span className="text-sm font-medium text-slate-700">
          Metrics
        </span>
      </label>
    </div>

    <button
      type="button"
      onClick={handleSavePermission}
      disabled={
        !selectedPermissionCompanyId ||
        savingPermission
      }
      className="inline-flex items-center justify-center rounded-lg bg-[#6B3A98] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5c3184] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {savingPermission
        ? 'Saving...'
        : 'Save Permission'}
    </button>
  </div>
</div>

            {companyPermissions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
                <ShieldCheck
                  size={32}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-3 font-semibold text-slate-700">
                  No company permissions assigned
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  This user currently has no delegated company
                  access.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {companyPermissions.map((permission) => (
                  <div
                    key={
                      permission.id ||
                      `${permissionUser.id}-${permission.company_id}`
                    }
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {permission.company_name ||
                            permission.company?.name ||
                            'Company'}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {permission.company_code ||
                            permission.company?.code ||
                            'No company code'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {Boolean(permission.can_view) && (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                            View
                          </span>
                        )}

                        {Boolean(permission.can_manage) && (
                          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-[#6B3A98] ring-1 ring-purple-200">
                            Manage
                          </span>
                        )}

                        {Boolean(
                          permission.can_view_metrics
                        ) && (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                            Metrics
                          </span>
                        )}

                        <button
                        type="button"
                        onClick={() => handleRevokePermission(permission)}
                        disabled={savingPermission}
                        className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Revoke Access
                      </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
        <button
          type="button"
          onClick={() => {
            setShowPermissionModal(false)
            setPermissionUser(null)
            setPermissionError('')
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Close
        </button>
      </div>

      
    </div>
    
  </div>
  
)}
    </div>
  )
}

export default UsersPage