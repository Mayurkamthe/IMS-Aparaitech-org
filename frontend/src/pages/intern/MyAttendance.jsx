import { useEffect, useState } from 'react'
import { Clock, LogIn, LogOut, CheckCircle } from 'lucide-react'
import api from '../../services/api'
import { Badge, Skeleton } from '../../components/common/index'
import toast from 'react-hot-toast'

export default function MyAttendance() {
  const [attendance, setAttendance] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [today, setToday] = useState(null)
  const [filters, setFilters] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/attendance/my?month=${filters.month}&year=${filters.year}`)
      setAttendance(data.data)
      setStats(data.stats)
      const todayStr = new Date().toISOString().split('T')[0]
      setToday(data.data.find(r => r.date?.startsWith(todayStr)))
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchAttendance() }, [filters])

  const handleCheckIn = async () => {
    setCheckinLoading(true)
    try {
      await api.post('/attendance/check-in')
      toast.success('Checked in successfully!')
      fetchAttendance()
    } catch {} finally { setCheckinLoading(false) }
  }

  const handleCheckOut = async () => {
    setCheckinLoading(true)
    try {
      await api.post('/attendance/check-out')
      toast.success('Checked out successfully!')
      fetchAttendance()
    } catch {} finally { setCheckinLoading(false) }
  }

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-slate-800 dark:text-white">My Attendance</h1></div>

      {/* Check In/Out */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Today — {new Date().toDateString()}</h3>
        <div className="flex flex-wrap items-center gap-4">
          <button disabled={checkinLoading || !!today?.loginTime} onClick={handleCheckIn}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
            <LogIn size={16} />{today?.loginTime ? `In: ${new Date(today.loginTime).toLocaleTimeString()}` : 'Check In'}
          </button>
          <button disabled={checkinLoading || !today?.loginTime || !!today?.logoutTime} onClick={handleCheckOut}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
            <LogOut size={16} />{today?.logoutTime ? `Out: ${new Date(today.logoutTime).toLocaleTimeString()}` : 'Check Out'}
          </button>
          {today?.loginTime && !today?.logoutTime && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Currently Online
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Days', value: stats.totalDays },
          { label: 'Present', value: stats.presentDays },
          { label: 'Attendance %', value: `${stats.percentage}%` },
          { label: 'Total Hours', value: `${stats.totalHours}h` },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold text-primary-600">{s.value || 0}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Month filter */}
      <div className="card p-4 flex gap-3 flex-wrap">
        <select className="input w-36" value={filters.month} onChange={e => setFilters(f => ({ ...f, month: e.target.value }))}>
          {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(2024, i).toLocaleString('default', { month: 'long' })}</option>)}
        </select>
        <select className="input w-28" value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-dark-800 border-b border-slate-100 dark:border-dark-600">
            <tr>{['Date', 'Status', 'Login', 'Logout', 'Hours'].map(h => <th key={h} className="table-header py-3 px-4 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-dark-600">
            {loading ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={5} className="px-4 py-3"><Skeleton lines={1} /></td></tr>)
              : attendance.map(r => (
              <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-dark-600/40">
                <td className="table-cell text-sm font-medium">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                <td className="table-cell"><Badge status={r.status} label={r.status.replace('_', ' ')} /></td>
                <td className="table-cell text-sm">{r.loginTime ? new Date(r.loginTime).toLocaleTimeString() : '—'}</td>
                <td className="table-cell text-sm">{r.logoutTime ? new Date(r.logoutTime).toLocaleTimeString() : '—'}</td>
                <td className="table-cell text-sm">{r.workHours ? `${r.workHours}h` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && attendance.length === 0 && <div className="py-12 text-center text-slate-400 text-sm">No attendance records for this period</div>}
      </div>
    </div>
  )
}
