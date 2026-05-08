import { useEffect, useState } from 'react'
import { Users, FolderKanban, CheckSquare, Clock, Award, TrendingUp, UserCheck, UserX } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { StatCard, Skeleton, Badge } from '../../components/common/index'
import api from '../../services/api'
import { motion } from 'framer-motion'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/admin').then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <div key={i} className="card p-5"><Skeleton lines={3} /></div>)}
      </div>
    </div>
  )

  const { stats, weeklySubmissions, monthlyAttendance, deptDistribution, topPerformers, recentActivities, taskStats } = data || {}

  const weeklyData = DAYS.map((day, i) => {
    const found = weeklySubmissions?.find(s => s._id === i + 1)
    return { day, submitted: found?.count || 0, approved: found?.approved || 0 }
  })

  const pieData = deptDistribution?.map(d => ({ name: d._id, value: d.count })) || []

  const taskData = [
    { name: 'Pending', value: taskStats?.pending || 0 },
    { name: 'In Progress', value: taskStats?.in_progress || 0 },
    { name: 'Submitted', value: taskStats?.submitted || 0 },
    { name: 'Approved', value: taskStats?.approved || 0 },
    { name: 'Rejected', value: taskStats?.rejected || 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Overview of your internship program</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Interns', value: stats?.totalInterns, icon: Users, color: 'primary' },
          { label: 'Active Interns', value: stats?.activeInterns, icon: UserCheck, color: 'green' },
          { label: 'Completed', value: stats?.completedInterns, icon: Award, color: 'primary' },
          { label: 'Today Present', value: stats?.todayAttendance, icon: Clock, color: 'amber' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Ongoing Projects', value: stats?.ongoingProjects, icon: FolderKanban, color: 'primary' },
          { label: 'Total Projects', value: stats?.totalProjects, icon: FolderKanban, color: 'slate' },
          { label: 'Terminated', value: stats?.terminatedInterns, icon: UserX, color: 'red' },
        ].map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Weekly Submissions</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Bar dataKey="submitted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="approved" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Department Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
        </div>
      </div>

      {/* Task Stats + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Task Status Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={taskData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} width={80} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {taskData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Top Performers</h3>
          <div className="space-y-3">
            {topPerformers?.length > 0 ? topPerformers.map((intern, i) => (
              <div key={intern._id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-4">#{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 text-primary-600 text-xs font-bold">
                  {intern.user?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{intern.user?.name}</p>
                  <p className="text-xs text-slate-400">{intern.department}</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-20 h-1.5 bg-slate-200 dark:bg-dark-600 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${intern.performanceScore}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{intern.performanceScore}</span>
                </div>
              </div>
            )) : <p className="text-slate-400 text-sm">No performance data yet</p>}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivities?.length > 0 ? recentActivities.slice(0, 6).map((act, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 text-xs font-bold">{act.user?.name?.[0] || 'S'}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">{act.user?.name || 'System'}</span>
                <span className="text-slate-500"> — {act.action} in {act.module}</span>
                <p className="text-xs text-slate-400">{new Date(act.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )) : <p className="text-slate-400 text-sm">No recent activity</p>}
        </div>
      </div>
    </div>
  )
}
