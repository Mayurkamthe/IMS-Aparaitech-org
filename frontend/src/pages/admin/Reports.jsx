// Reports.jsx
import { Download, BarChart3, FileText, Users } from 'lucide-react'
export default function Reports() {
  const reports = [
    { title: 'Intern Performance Report', desc: 'Performance scores, task completion, attendance percentage for all interns', icon: BarChart3, endpoint: '/reports/interns/excel', color: 'primary' },
    { title: 'Monthly Attendance Report', desc: 'Detailed attendance logs including login/logout times and work hours', icon: Users, endpoint: '/reports/attendance/excel', color: 'green' },
    { title: 'Task & Submission Analytics', desc: 'Submission rates, approval/rejection stats and task completion trends', icon: FileText, endpoint: '#', color: 'amber' },
  ]
  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-slate-800 dark:text-white">Reports & Analytics</h1><p className="text-sm text-slate-400">Download reports in Excel format</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {reports.map((r, i) => (
          <div key={i} className="card-hover p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex-shrink-0"><r.icon size={22} className="text-primary-600 dark:text-primary-400" /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{r.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{r.desc}</p>
                <a href={`/api${r.endpoint}`} target="_blank" className="btn-primary flex items-center gap-2 text-sm w-fit">
                  <Download size={14} />Download Excel
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
