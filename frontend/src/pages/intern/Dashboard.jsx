import { useEffect, useState } from 'react'
import { CheckSquare, Clock, Award, Bell, TrendingUp, Calendar, AlertTriangle } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { StatCard, Badge, Skeleton } from '../../components/common/index'
import api from '../../services/api'
import { motion } from 'framer-motion'

export default function InternDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/intern').then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="card p-5"><Skeleton lines={3} /></div>)}
      </div>
    </div>
  )

  const { intern, taskStats, todayAttendance, attendancePercent, upcomingDeadlines, internshipProgress } = data || {}

  const progressColor = internshipProgress >= 75 ? 'bg-emerald-500' : internshipProgress >= 50 ? 'bg-primary-500' : 'bg-amber-500'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Welcome back, {intern?.user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-slate-400">{intern?.department} · {intern?.internId}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-dark-700 rounded-xl px-4 py-2">
          <div className={`w-2 h-2 rounded-full ${todayAttendance?.loginTime && !todayAttendance?.logoutTime ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{todayAttendance?.loginTime && !todayAttendance?.logoutTime ? 'Currently Online' : todayAttendance?.loginTime ? 'Checked Out' : 'Not Checked In'}</span>
        </div>
      </div>

      {/* Internship Progress */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 dark:text-white">Internship Progress</h3>
          <span className="text-sm font-bold text-primary-600">{internshipProgress}% Complete</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-dark-600 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${internshipProgress}%` }} transition={{ duration: 1, delay: 0.3 }}
            className={`h-full rounded-full ${progressColor}`} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Start: {intern?.internshipStart ? new Date(intern.internshipStart).toLocaleDateString() : '—'}</span>
          <span>End: {intern?.internshipEnd ? new Date(intern.internshipEnd).toLocaleDateString() : '—'}</span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: taskStats?.myTasks, icon: CheckSquare, color: 'primary' },
          { label: 'Pending', value: taskStats?.pendingTasks, icon: AlertTriangle, color: 'amber' },
          { label: 'Approved', value: taskStats?.approvedTasks, icon: Award, color: 'green' },
          { label: 'Attendance', value: `${attendancePercent}%`, icon: Clock, color: 'primary' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Deadlines */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Calendar size={16} />Upcoming Deadlines</h3>
          <div className="space-y-3">
            {upcomingDeadlines?.length > 0 ? upcomingDeadlines.map(task => {
              const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
              return (
                <div key={task._id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-dark-600 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{task.title}</p>
                    <p className="text-xs text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${daysLeft <= 1 ? 'text-red-500' : daysLeft <= 3 ? 'text-amber-500' : 'text-emerald-500'}`}>{daysLeft}d left</span>
                    <Badge status={task.priority} label={task.priority} />
                  </div>
                </div>
              )
            }) : <p className="text-slate-400 text-sm">No upcoming deadlines</p>}
          </div>
        </div>

        {/* Projects */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={16} />My Projects</h3>
          <div className="space-y-4">
            {intern?.projects?.length > 0 ? intern.projects.map(p => (
              <div key={p._id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.title}</span>
                  <Badge status={p.status} label={p.status} />
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-dark-600 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{p.progress}% complete</p>
              </div>
            )) : <p className="text-slate-400 text-sm">No projects assigned yet</p>}
          </div>
        </div>
      </div>

      {/* Today Attendance */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Clock size={16} />Today's Attendance</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Login Time', value: todayAttendance?.loginTime ? new Date(todayAttendance.loginTime).toLocaleTimeString() : 'Not checked in' },
            { label: 'Logout Time', value: todayAttendance?.logoutTime ? new Date(todayAttendance.logoutTime).toLocaleTimeString() : '—' },
            { label: 'Work Hours', value: todayAttendance?.workHours ? `${todayAttendance.workHours}h` : '—' },
            { label: 'Status', value: <Badge status={todayAttendance?.status || 'absent'} label={todayAttendance?.status || 'absent'} /> },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 dark:bg-dark-800 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">{item.label}</p>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
