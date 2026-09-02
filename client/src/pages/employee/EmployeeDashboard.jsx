import {
  BriefcaseBusiness,
  ClipboardCheck,
  CalendarDays,
  FileText,
  Clock3,
  ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const stats = [
  {
    title: 'Assigned Tenders',
    value: '4',
    description: 'Currently assigned to you',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Pending Compliance',
    value: '3',
    description: 'Checklist items to complete',
    icon: ClipboardCheck,
  },
  {
    title: 'Upcoming Deadlines',
    value: '2',
    description: 'Due within the next few days',
    icon: CalendarDays,
  },
  {
    title: 'My Documents',
    value: '11',
    description: 'Files linked to your work',
    icon: FileText,
  },
]

const assignedTenders = [
  {
    name: 'Facilities Maintenance Tender',
    reference: 'EHG-TND-001',
    deadline: '08 Sep 2026',
    status: 'In Progress',
    progress: 72,
  },
  {
    name: 'Cleaning Services Tender',
    reference: 'EHG-TND-003',
    deadline: '12 Sep 2026',
    status: 'Preparation',
    progress: 45,
  },
  {
    name: 'Security Services Contract',
    reference: 'EHG-TND-005',
    deadline: '18 Sep 2026',
    status: 'Review',
    progress: 88,
  },
]

const EmployeeDashboard = () => {
  const navigate = useNavigate()

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            My Workspace
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Employee Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track your assigned tenders, compliance tasks and upcoming deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Clock3 size={18} className="text-slate-500" />

          <div>
            <p className="text-xs text-slate-400">
              Work status
            </p>

            <p className="text-sm font-semibold text-slate-900">
              Active
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-3 text-3xl font-bold text-slate-950">
                    {stat.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                {stat.description}
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                My Assigned Tenders
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tenders currently assigned to your account.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/employee/assigned-tenders')
              }
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
            >
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {assignedTenders.map((tender) => (
              <div
                key={tender.reference}
                className="px-6 py-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {tender.name}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {tender.reference}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {tender.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={16} />

                  <span>
                    Deadline: {tender.deadline}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span>{tender.progress}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{
                        width: `${tender.progress}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            My Tasks
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Items that need your attention.
          </p>

          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={() =>
                navigate('/employee/compliance')
              }
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <ClipboardCheck
                    size={19}
                    className="text-slate-700"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Compliance items
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    3 pending
                  </p>
                </div>
              </div>

              <ArrowRight
                size={16}
                className="text-slate-400"
              />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/employee/documents')
              }
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <FileText
                    size={19}
                    className="text-slate-700"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Documents
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Review project files
                  </p>
                </div>
              </div>

              <ArrowRight
                size={16}
                className="text-slate-400"
              />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/employee/leave')
              }
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <CalendarDays
                    size={19}
                    className="text-slate-700"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Leave requests
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    View your leave status
                  </p>
                </div>
              </div>

              <ArrowRight
                size={16}
                className="text-slate-400"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDashboard