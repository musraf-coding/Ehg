import {
  BriefcaseBusiness,
  ClipboardCheck,
  Users,
  FileCheck2,
  TrendingUp,
  CalendarClock,
  Activity,
  UserPlus,
  FolderCheck,
  PenSquare,
  ClipboardList,
} from 'lucide-react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

// ---------------------------------------------------------------------------
// DEMO DATA — structured for an easy swap to backend API responses later.
// ---------------------------------------------------------------------------
const stats = [
  {
    title: 'Active Team Tenders',
    value: '8',
    description: 'Tenders currently handled by your team',
    icon: BriefcaseBusiness,
    accent: 'blue',
    trend: '1 due this week',
  },
  {
    title: 'Assigned Employees',
    value: '16',
    description: 'Employees available for tender assignments',
    icon: Users,
    accent: 'purple',
    trend: 'Active workforce',
  },
  {
    title: 'Pending Reviews',
    value: '6',
    description: 'Tender submissions awaiting your review',
    icon: FileCheck2,
    accent: 'amber',
    trend: '2 awaiting sign-off',
  },
  {
    title: 'Compliance Pending',
    value: '4',
    description: 'Checklist items requiring attention',
    icon: ClipboardCheck,
    accent: 'red',
    trend: '1 overdue',
  },
]

// Shared status vocabulary — kept identical to the Admin Dashboard so a
// tender's color means the same thing everywhere in the system.
const STATUS_META = {
  Preparation: { badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', color: '#F59E0B' },
  'In Progress': { badge: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200', color: '#2F8CC9' },
  Review: { badge: 'bg-purple-50 text-[#6B3A98] ring-1 ring-purple-200', color: '#6B3A98' },
  Submitted: { badge: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200', color: '#4F46E5' },
  Completed: { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', color: '#16A34A' },
}

const tenderStatusData = [
  { name: 'Preparation', value: 2 },
  { name: 'In Progress', value: 5 },
  { name: 'Review', value: 3 },
  { name: 'Submitted', value: 2 },
  { name: 'Completed', value: 4 },
]

const teamPerformanceChartData = [
  { month: 'Jan', reviewed: 4, target: 5 },
  { month: 'Feb', reviewed: 6, target: 5 },
  { month: 'Mar', reviewed: 5, target: 6 },
  { month: 'Apr', reviewed: 7, target: 6 },
  { month: 'May', reviewed: 6, target: 6 },
  { month: 'Jun', reviewed: 8, target: 7 },
]

const teamPerformance = [
  { label: 'Tender progress', value: 74, color: '#2F8CC9' },
  { label: 'Review completion', value: 82, color: '#6B3A98' },
  { label: 'Compliance completion', value: 79, color: '#16A34A' },
]
const teamTenders = [
  {
    name: 'Facilities Maintenance Tender',
    assignees: ['Tonderai Makanjera', 'Knowledge Kundizeza'],
    status: 'In Progress',
    progress: 72,
  },
  {
    name: 'Security Services Contract',
    assignees: ['Deltruth Skrywer', 'Sisasenkosi Sakho'],
    status: 'Review',
    progress: 88,
  },
  {
    name: 'Cleaning Services Tender',
    assignees: ['Deon Markus', 'Ruusa Petrus'],
    status: 'Preparation',
    progress: 45,
  },
]

const upcomingReviews = [
  { reference: 'Security Services Contract — final review', dueDate: '10 Sep 2026', daysRemaining: 2, urgency: 'critical' },
  { reference: 'Facilities Maintenance Tender — submission', dueDate: '15 Sep 2026', daysRemaining: 7, urgency: 'warning' },
  { reference: 'Cleaning Services Tender — compliance check', dueDate: '27 Sep 2026', daysRemaining: 18, urgency: 'normal' },
]

const URGENCY_META = {
  critical: { dot: 'bg-red-500', text: 'text-red-600', label: 'Due soon' },
  warning: { dot: 'bg-amber-500', text: 'text-amber-600', label: 'Upcoming' },
  normal: { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'On track' },
}

const recentTeamActivity = [
  { icon: UserPlus, text: 'Employee assigned — Security Services Contract', time: '1h ago' },
  { icon: FileCheck2, text: 'Review completed — Cleaning Services Tender', time: '4h ago' },
  { icon: FolderCheck, text: 'Compliance item updated — Insurance Certificate', time: '6h ago' },
  { icon: PenSquare, text: 'Document uploaded — Facilities Maintenance Tender', time: '1d ago' },
]

// Accent tokens for the KPI cards — restrained, semantic use of color only.
const ACCENT_META = {
  blue: { icon: 'bg-sky-50 text-[#2F8CC9]', trend: 'text-[#2F8CC9]' },
  purple: { icon: 'bg-purple-50 text-[#6B3A98]', trend: 'text-[#6B3A98]' },
  amber: { icon: 'bg-amber-50 text-amber-600', trend: 'text-amber-600' },
  red: { icon: 'bg-red-50 text-red-600', trend: 'text-red-600' },
}

const ManagerDashboard = () => {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Manager Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor assigned tenders, team activity, compliance and reviews.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />

          <div>
            <p className="text-xs text-slate-400">Work overview</p>
            <p className="text-sm font-semibold text-slate-900">Active</p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const accent = ACCENT_META[stat.accent]

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">{stat.value}</p>
                </div>

                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.icon}`}>
                  <Icon size={21} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="truncate text-xs text-slate-400">{stat.description}</p>
                <p className={`shrink-0 text-xs font-semibold ${accent.trend}`}>{stat.trend}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts row: Team Performance + Tender Status */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Team Tender Performance</h2>
              <p className="mt-1 text-sm text-slate-500">Monthly reviewed tenders vs. target</p>
            </div>
            <TrendingUp size={20} className="text-slate-400" />
          </div>

          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={teamPerformanceChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, borderColor: '#E2E8F0', fontSize: 13 }}
                  cursor={{ fill: '#F1F5F9' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value) => (value === 'reviewed' ? 'Reviewed' : 'Target')}
                />
                <Bar dataKey="reviewed" fill="#2F8CC9" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#6B3A98"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#6B3A98' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Tender Status</h2>
              <p className="mt-1 text-sm text-slate-500">Across {tenderStatusData.reduce((sum, item) => sum + item.value, 0)} team tenders</p>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={tenderStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="85%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {tenderStatusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_META[entry.name]?.color || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#E2E8F0', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>

            <ul className="mt-2 space-y-2">
              {tenderStatusData.map((entry) => (
                <li key={entry.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_META[entry.name]?.color || '#94A3B8' }}
                    />
                    {entry.name}
                  </span>
                  <span className="font-semibold text-slate-900">{entry.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Team Tender Progress + Team Performance */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Team Tender Progress</h2>
              <p className="mt-1 text-sm text-slate-500">Current progress of tenders managed by your team.</p>
            </div>
            <BriefcaseBusiness size={21} className="text-slate-400" />
          </div>

          <div className="divide-y divide-slate-100">
            {teamTenders.map((tender) => {
              const meta = STATUS_META[tender.status] || STATUS_META.Preparation

              return (
                <div key={tender.name} className="px-6 py-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{tender.name}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                      {tender.assignees.map((employee) => (
                        <span
                          key={employee}
                          className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                        >
                          {employee}
                        </span>
                      ))}
                    </div>
                    </div>

                    <span className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}>
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
                        className="h-full rounded-full transition-all"
                        style={{ width: `${tender.progress}%`, backgroundColor: meta.color }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Team Performance</h2>
              <p className="mt-1 text-sm text-slate-500">Current management indicators.</p>
            </div>
            <ClipboardList size={21} className="text-slate-400" />
          </div>

          <div className="mt-6 space-y-5">
            {teamPerformance.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.value}%</span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Reviews + Recent Team Activity */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Upcoming Reviews</h2>
              <p className="mt-1 text-sm text-slate-500">Reviews and submissions due soon.</p>
            </div>
            <CalendarClock size={20} className="text-slate-400" />
          </div>

          <ul className="divide-y divide-slate-100">
            {upcomingReviews.map((item) => {
              const urgency = URGENCY_META[item.urgency]

              return (
                <li key={item.reference} className="flex items-center justify-between gap-3 px-6 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${urgency.dot}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{item.reference}</p>
                      <p className="text-xs text-slate-500">{item.dueDate}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className={`text-sm font-semibold ${urgency.text}`}>{item.daysRemaining}d</p>
                    <p className="text-[11px] text-slate-400">{urgency.label}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Recent Team Activity</h2>
              <p className="mt-1 text-sm text-slate-500">Latest actions from your team.</p>
            </div>
            <Activity size={20} className="text-slate-400" />
          </div>

          <ul className="divide-y divide-slate-100">
            {recentTeamActivity.map((activity) => {
              const Icon = activity.icon

              return (
                <li key={activity.text} className="flex items-center gap-3 px-6 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <Icon size={16} />
                  </span>

                  <p className="min-w-0 flex-1 truncate text-sm text-slate-700">{activity.text}</p>

                  <span className="shrink-0 text-xs text-slate-400">{activity.time}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard