// Badge.jsx
const variants = {
  active: 'badge-green', pending: 'badge-yellow', completed: 'badge-blue',
  terminated: 'badge-red', ongoing: 'badge-blue', review: 'badge-yellow',
  approved: 'badge-green', rejected: 'badge-red', submitted: 'badge-yellow',
  in_progress: 'badge-blue', open: 'badge-yellow', resolved: 'badge-green',
  closed: 'badge-slate', low: 'badge-green', medium: 'badge-yellow', high: 'badge-red',
  present: 'badge-green', absent: 'badge-red', late: 'badge-yellow', half_day: 'badge-yellow',
  leave: 'badge-slate'
}
export function Badge({ label, status }) {
  const text = label || status || ''
  return <span className={variants[status] || 'badge-slate'}>{text.replace('_', ' ')}</span>
}

// StatCard.jsx
export function StatCard({ label, value, icon: Icon, color = 'primary', trend, subtitle }) {
  const colors = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
  }
  return (
    <div className="stat-card">
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {trend !== undefined && (
          <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? '+' : ''}{trend}% from last week
          </p>
        )}
      </div>
      {Icon && <div className={`p-3 rounded-xl ${colors[color]}`}><Icon size={22} /></div>}
    </div>
  )
}

// Empty.jsx
export function Empty({ title = 'No data', description, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-dark-600 flex items-center justify-center mb-4"><Icon size={24} className="text-slate-400" /></div>}
      <p className="font-medium text-slate-700 dark:text-slate-300">{title}</p>
      {description && <p className="text-sm text-slate-400 mt-1 max-w-xs">{description}</p>}
    </div>
  )
}

// Skeleton
export function Skeleton({ lines = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 ${i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  )
}
