import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  CalendarDays,
  Search,
  RefreshCw,
  Clock3,
  UserRound,
  Building2,
  Flag,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

import api from '../../services/api'

const STATUS_META = {
  DRAFT: {
    badge:
      'bg-slate-50 text-slate-700 ring-1 ring-slate-200',
    color: '#64748B',
    label: 'Draft',
  },

  PREPARATION: {
    badge:
      'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    color: '#F59E0B',
    label: 'Preparation',
  },

  IN_PROGRESS: {
    badge:
      'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    color: '#2F8CC9',
    label: 'In Progress',
  },

  REVIEW: {
    badge:
      'bg-purple-50 text-[#6B3A98] ring-1 ring-purple-200',
    color: '#6B3A98',
    label: 'Review',
  },

  SUBMITTED: {
    badge:
      'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    color: '#4F46E5',
    label: 'Submitted',
  },

  COMPLETED: {
    badge:
      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    color: '#16A34A',
    label: 'Completed',
  },

  CANCELLED: {
    badge:
      'bg-red-50 text-red-700 ring-1 ring-red-200',
    color: '#DC2626',
    label: 'Cancelled',
  },
}

const PRIORITY_META = {
  LOW: {
    className:
      'bg-slate-50 text-slate-600 ring-1 ring-slate-200',
    dot: 'bg-slate-400',
    label: 'Low',
  },

  MEDIUM: {
    className:
      'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    dot: 'bg-sky-500',
    label: 'Medium',
  },

  HIGH: {
    className:
      'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
    label: 'High',
  },

  URGENT: {
    className:
      'bg-red-50 text-red-700 ring-1 ring-red-200',
    dot: 'bg-red-500',
    label: 'Urgent',
  },
}

const DEADLINE_META = {
  overdue: {
    className: 'text-red-600',
    dot: 'bg-red-500',
    background: 'bg-red-50',
    label: 'Overdue',
  },

  critical: {
    className: 'text-red-600',
    dot: 'bg-red-500',
    background: 'bg-red-50',
    label: 'Due soon',
  },

  warning: {
    className: 'text-amber-600',
    dot: 'bg-amber-500',
    background: 'bg-amber-50',
    label: 'Upcoming',
  },

  normal: {
    className: 'text-emerald-600',
    dot: 'bg-emerald-500',
    background: 'bg-emerald-50',
    label: 'On track',
  },
}

const formatStatus = (status) => {
  if (!status) return 'Draft'

  return (
    STATUS_META[status]?.label ||
    status
      .toLowerCase()
      .split('_')
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(' ')
  )
}

const formatDate = (dateValue) => {
  if (!dateValue) return 'No deadline'

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 'No deadline'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const getDeadlineInfo = (deadline) => {
  if (!deadline) {
    return {
      daysRemaining: null,
      urgency: 'normal',
    }
  }

  const today = new Date()
  const deadlineDate = new Date(deadline)

  if (Number.isNaN(deadlineDate.getTime())) {
    return {
      daysRemaining: null,
      urgency: 'normal',
    }
  }

  today.setHours(0, 0, 0, 0)
  deadlineDate.setHours(0, 0, 0, 0)

  const millisecondsPerDay =
    1000 * 60 * 60 * 24

  const daysRemaining = Math.ceil(
    (deadlineDate - today) /
      millisecondsPerDay
  )

  let urgency = 'normal'

  if (daysRemaining < 0) {
    urgency = 'overdue'
  } else if (daysRemaining <= 3) {
    urgency = 'critical'
  } else if (daysRemaining <= 7) {
    urgency = 'warning'
  }

  return {
    daysRemaining,
    urgency,
  }
}

const AssignedTenders = () => {
  const navigate = useNavigate()
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] =
    useState('')
  const [statusFilter, setStatusFilter] =
    useState('ALL')

  const loadTenders = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get(
        '/tenders/assigned'
      )

      setTenders(response.data.tenders || [])
    } catch (error) {
      setTenders([])

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
          .includes(normalizedSearch) ||
        tender.priority
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        tender.assignedByName
          ?.toLowerCase()
          .includes(normalizedSearch)

      const matchesStatus =
        statusFilter === 'ALL' ||
        tender.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [tenders, searchTerm, statusFilter])

  const activeCount = useMemo(() => {
    return tenders.filter(
      (tender) =>
        !['COMPLETED', 'CANCELLED'].includes(
          tender.status
        )
    ).length
  }, [tenders])

  const completedCount = useMemo(() => {
    return tenders.filter(
      (tender) =>
        tender.status === 'COMPLETED'
    ).length
  }, [tenders])

  const urgentCount = useMemo(() => {
    return tenders.filter((tender) => {
      if (
        ['COMPLETED', 'CANCELLED'].includes(
          tender.status
        )
      ) {
        return false
      }

      const { daysRemaining } =
        getDeadlineInfo(tender.deadline)

      return (
        daysRemaining !== null &&
        daysRemaining <= 7
      )
    }).length
  }, [tenders])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            My Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Assigned Tenders
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            View, monitor and track tenders
            currently assigned to your
            account.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTenders}
          disabled={loading}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-purple-100 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-[#6B3A98] transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
        >
          <RefreshCw
            size={17}
            className={
              loading ? 'animate-spin' : ''
            }
          />

          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Total Assigned
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
                {loading ? '—' : tenders.length}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#2F8CC9] sm:h-11 sm:w-11">
              <BriefcaseBusiness size={20} />
            </div>
          </div>

          <p className="mt-3 text-xs font-medium text-[#2F8CC9]">
            Your tender workload
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Active
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
                {loading ? '—' : activeCount}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-[#6B3A98] sm:h-11 sm:w-11">
              <Clock3 size={20} />
            </div>
          </div>

          <p className="mt-3 text-xs font-medium text-[#6B3A98]">
            Currently in workflow
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Due Soon
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
                {loading ? '—' : urgentCount}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 sm:h-11 sm:w-11">
              <AlertTriangle size={20} />
            </div>
          </div>

          <p className="mt-3 text-xs font-medium text-amber-600">
            Due or overdue within 7 days
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Completed
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
                {loading
                  ? '—'
                  : completedCount}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <p className="mt-3 text-xs font-medium text-emerald-600">
            Finished assignments
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search tender, reference, client or priority..."
              className="min-h-[46px] w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#6B3A98] focus:bg-white focus:ring-2 focus:ring-[#6B3A98]/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="min-h-[46px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#6B3A98] focus:ring-2 focus:ring-[#6B3A98]/10 md:w-56"
          >
            <option value="ALL">
              All statuses
            </option>

            {availableStatuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {formatStatus(status)}
                </option>
              )
            )}
          </select>
        </div>

        {!loading && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-400">
              Showing{' '}
              <span className="font-semibold text-slate-600">
                {filteredTenders.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-600">
                {tenders.length}
              </span>{' '}
              assigned tenders
            </p>

            {(searchTerm ||
              statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('ALL')
                }}
                className="text-xs font-semibold text-[#6B3A98] transition hover:text-[#5A3182]"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="mt-6 flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <RefreshCw
              size={27}
              className="mx-auto animate-spin text-[#6B3A98]"
            />

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading assigned tenders...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Retrieving your current
              assignments
            </p>
          </div>
        </div>
      ) : filteredTenders.length === 0 ? (
        /* Empty state */
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-[#6B3A98]">
            <BriefcaseBusiness size={25} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-950">
            No assigned tenders found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {tenders.length === 0
              ? 'There are currently no tenders assigned to your account.'
              : 'No tenders match your current search or status filter.'}
          </p>
        </div>
      ) : (
        /* Tender cards */
        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredTenders.map((tender) => {
            const statusMeta =
              STATUS_META[tender.status] ||
              STATUS_META.DRAFT

            const priorityMeta =
              PRIORITY_META[
                tender.priority
              ] || PRIORITY_META.MEDIUM

            const deadlineInfo =
              getDeadlineInfo(
                tender.deadline
              )

            const deadlineMeta =
              DEADLINE_META[
                deadlineInfo.urgency
              ]

            const progress = Math.min(
              Math.max(
                Number(tender.progress) || 0,
                0
              ),
              100
            )

            return (
              <article
                key={tender.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                {/* Status accent */}
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{
                    backgroundColor:
                      statusMeta.color,
                  }}
                />

                <div className="p-5 sm:p-6">
                  {/* Header */}
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#6B3A98]">
                          {tender.referenceNo}
                        </p>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityMeta.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${priorityMeta.dot}`}
                          />

                          {priorityMeta.label}
                        </span>
                      </div>

                      <h2 className="mt-3 break-words text-lg font-bold leading-6 text-slate-950 sm:text-xl">
                        {tender.title}
                      </h2>

                      {tender.clientName && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <Building2
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="truncate">
                            {
                              tender.clientName
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${statusMeta.badge}`}
                    >
                      {formatStatus(
                        tender.status
                      )}
                    </span>
                  </div>

                  {tender.description && (
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                      {tender.description}
                    </p>
                  )}

                  {/* Tender details */}
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-[#2F8CC9]">
                          <CalendarDays
                            size={15}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Start Date
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-slate-700">
                            {formatDate(
                              tender.startDate
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`rounded-xl border border-slate-100 p-4 ${deadlineMeta.background}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-slate-600">
                          <Clock3 size={15} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                            Deadline
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-slate-700">
                            {formatDate(
                              tender.deadline
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assignment information */}
                  <div className="mt-4 flex flex-col gap-3 rounded-xl border border-purple-100 bg-purple-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6B3A98] text-white">
                        <UserRound size={16} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Assigned By
                        </p>

                        <p className="truncate text-sm font-semibold text-slate-800">
                          {tender.assignedByName ||
                            'EHG Management'}
                        </p>
                      </div>
                    </div>

                    {deadlineInfo.daysRemaining !==
                      null && (
                      <div
                        className={`flex items-center gap-2 text-xs font-semibold ${deadlineMeta.className}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${deadlineMeta.dot}`}
                        />

                        {deadlineInfo.daysRemaining <
                        0
                          ? `${Math.abs(
                              deadlineInfo.daysRemaining
                            )} day${
                              Math.abs(
                                deadlineInfo.daysRemaining
                              ) === 1
                                ? ''
                                : 's'
                            } overdue`
                          : deadlineInfo.daysRemaining ===
                              0
                            ? 'Due today'
                            : `${deadlineInfo.daysRemaining} day${
                                deadlineInfo.daysRemaining ===
                                1
                                  ? ''
                                  : 's'
                              } remaining`}
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mt-6">
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Tender Progress
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Current completion
                          status
                        </p>
                      </div>

                      <div
                        className="rounded-lg px-2.5 py-1 text-sm font-bold"
                        style={{
                          color:
                            statusMeta.color,
                          backgroundColor: `${statusMeta.color}12`,
                        }}
                      >
                        {progress}%
                      </div>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor:
                            statusMeta.color,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>0%</span>

                      <span className="flex items-center gap-1">
                        <Flag size={11} />
                        100%
                      </span>
                    </div>
                  </div>


                  {/* Workspace action */}
<div className="mt-6 border-t border-slate-100 pt-5">
  <button
    type="button"
    onClick={() =>
      navigate(
        `/employee/tenders/${tender.id}/workspace`
      )
    }
    className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#6B3A98] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5A3182] sm:w-auto"
  >
    Open Tender Workspace
  </button>
</div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AssignedTenders