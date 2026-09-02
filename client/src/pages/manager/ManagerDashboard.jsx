import {
  BriefcaseBusiness,
  ClipboardCheck,
  Users,
  FileCheck2,
  Clock3,
  TrendingUp,
} from 'lucide-react'

const stats = [
  {
    title: 'Managed Tenders',
    value: '8',
    description: 'Tenders under your supervision',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Team Members',
    value: '14',
    description: 'Employees in your working group',
    icon: Users,
  },
  {
    title: 'Pending Reviews',
    value: '6',
    description: 'Submissions requiring review',
    icon: FileCheck2,
  },
  {
    title: 'Compliance Pending',
    value: '4',
    description: 'Checklist items requiring attention',
    icon: ClipboardCheck,
  },
]

const teamTenders = [
  {
    name: 'Facilities Maintenance Tender',
    assignee: 'Tender Team A',
    status: 'In Progress',
    progress: 72,
  },
  {
    name: 'Security Services Contract',
    assignee: 'Tender Team B',
    status: 'Review',
    progress: 88,
  },
  {
    name: 'Cleaning Services Tender',
    assignee: 'Tender Team C',
    status: 'Preparation',
    progress: 45,
  },
]

const ManagerDashboard = () => {
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Manager Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor assigned tenders, team activity, compliance and reviews.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Clock3 size={18} className="text-slate-500" />

          <div>
            <p className="text-xs text-slate-400">
              Work overview
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
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Team Tender Progress
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current progress of tenders managed by your team.
              </p>
            </div>

            <BriefcaseBusiness
              size={21}
              className="text-slate-400"
            />
          </div>

          <div className="divide-y divide-slate-100">
            {teamTenders.map((tender) => (
              <div
                key={tender.name}
                className="px-6 py-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {tender.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {tender.assignee}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {tender.status}
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Team Performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current management indicators.
              </p>
            </div>

            <TrendingUp
              size={21}
              className="text-slate-400"
            />
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Tender progress
                </span>

                <span className="font-semibold text-slate-900">
                  74%
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[74%] rounded-full bg-slate-900" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Review completion
                </span>

                <span className="font-semibold text-slate-900">
                  82%
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[82%] rounded-full bg-slate-900" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Compliance completion
                </span>

                <span className="font-semibold text-slate-900">
                  79%
                </span>
              </div>

              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[79%] rounded-full bg-slate-900" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard