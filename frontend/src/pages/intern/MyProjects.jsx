// MyProjects.jsx
import { useEffect, useState } from 'react'
import { FolderKanban } from 'lucide-react'
import api from '../../services/api'
import { Badge, Empty, Skeleton } from '../../components/common/index'

export default function MyProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/projects').then(r => setProjects(r.data.data)).finally(() => setLoading(false)) }, [])

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-slate-800 dark:text-white">My Projects</h1><p className="text-sm text-slate-400">{projects.length} projects</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="card p-5"><Skeleton lines={4} /></div>)
          : projects.length === 0 ? <div className="col-span-2"><Empty title="No projects assigned" icon={FolderKanban} /></div>
          : projects.map(p => (
          <div key={p._id} className="card-hover p-5">
            <div className="flex items-start justify-between mb-3">
              <div><h3 className="font-semibold text-slate-800 dark:text-white">{p.title}</h3><p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p></div>
              <Badge status={p.status} label={p.status} />
            </div>
            <div className="flex flex-wrap gap-1 mb-3">{p.techStack?.map(t => <span key={t} className="badge-blue text-xs">{t}</span>)}</div>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Progress</span><span className="font-medium">{p.progress}%</span></div>
              <div className="h-2 bg-slate-100 dark:bg-dark-600 rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${p.progress}%` }} /></div>
            </div>
            {p.milestones?.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-dark-600">
                <p className="text-xs font-medium text-slate-500 mb-2">Milestones</p>
                {p.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                    <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${m.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-dark-500'}`} />
                    <span className={m.completed ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-300'}>{m.title}</span>
                  </div>
                ))}
              </div>
            )}
            {p.githubRepo && <a href={p.githubRepo} target="_blank" className="mt-2 text-xs text-primary-500 hover:underline block">View Repository</a>}
          </div>
        ))}
      </div>
    </div>
  )
}
