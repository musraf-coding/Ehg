import { useEffect, useMemo, useState } from 'react'
import {
  BriefcaseBusiness,
  CalendarDays,
  Search,
  RefreshCw,
} from 'lucide-react'

import api from '../../services/api'

const formatStatus = (status) => {
  if (!status) return '-'

  return status
    .toLowerCase()
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')
}

const formatDate = (dateValue) => {
  if (!dateValue) return 'No deadline'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateValue))
}

const AssignedTenders = () => {
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const loadTenders = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/tenders/assigned')

      setTenders(response.data.tenders || [])
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Unable to load assigned tenders.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTenders()
  }, [])

  const availableStatuses = useMemo(() => {
    return [
      ...new Set(
        tenders
          .map((tender) => tender.status)
          .filter(Boolean)
      ),
    ]
  }, [tenders])

  const filteredTenders = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase()

    return tenders.filter((tender) => {
      const matchesSearch =
        !normalizedSearch ||
        tender.title
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        tender.referenceNo
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        tender.clientName
          ?.toLowerCase()
          .includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'ALL' ||
        tender.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [tenders, searchTerm, statusFilter])

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Tender Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Assigned Tenders
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and track tenders currently assigned to your account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-400">
              Total assigned
            </p>

            <p className="mt-1 text-xl font-bold text-slate-950">
              {tenders.length}
            </p>
          </div>

          <button
            type="button"
            onClick={loadTenders}
            disabled={loading}
            className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? 'animate-spin' : ''}
            />

            Refresh
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search by tender, reference or client"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200 md:w-56"
          >
            <option value="ALL">
              All statuses
            </option>

            {availableStatuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />

            <p className="mt-4 text-sm text-slate-500">
              Loading assigned tenders...
            </p>
          </div>
        </div>
      ) : filteredTenders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <BriefcaseBusiness
              size={22}
              className="text-slate-600"
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-950">
            No assigned tenders found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            No tenders match your current search or filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {filteredTenders.map((tender) => (
            <article
              key={tender.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {tender.referenceNo}
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-slate-950">
                    {tender.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {tender.clientName || 'Client not specified'}
                  </p>
                </div>

                <span className="w-fit shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {formatStatus(tender.status)}
                </span>
              </div>

              {tender.description && (
                <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-600">
                  {tender.description}
                </p>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Start date
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CalendarDays size={16} />

                    {formatDate(tender.startDate)}
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Deadline
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CalendarDays size={16} />

                    {formatDate(tender.deadline)}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Tender progress
                  </span>

                  <span className="font-semibold text-slate-900">
                    {tender.progress}%
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-950 transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          Number(tender.progress) || 0,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default AssignedTenders