import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Github, Linkedin, Mail, Phone, MapPin, GraduationCap, Calendar, Award, Clock } from 'lucide-react'
import api from '../../services/api'
import { Badge, Skeleton } from '../../components/common/index'

export default function InternDetail() {
  const { id } = useParams()
  const [intern, setIntern] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/interns/${id}`).then(r => setIntern(r.data.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="space-y-4"><Skeleton lines={6} /></div>
  if (!intern) return <div className="text-center py-16 text-slate-400">Intern not found</div>

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/interns" className="p-2 rounded-lg btn-secondary"><ArrowLeft size={16} /></Link>
        <div><h1 className="text-xl font-bold text-slate-800 dark:text-white">Intern Profile</h1><p className="text-sm text-slate-400">{intern.internId}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile Card */}
        <div className="card p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-3xl font-bold text-primary-600 mx-auto mb-4">
            {intern.user?.avatar ? <img src={intern.user.avatar} className="w-full h-full rounded-full object-cover" alt="avatar" /> : intern.user?.name?.[0]}
          </div>
          <h2 className="font-bold text-slate-800 dark:text-white text-lg">{intern.user?.name}</h2>
          <p className="text-slate-400 text-sm">{intern.department}</p>
          <div className="mt-2"><Badge status={intern.status} label={intern.status} /></div>

          <div className="mt-4 space-y-2 text-left">
            {intern.user?.email && <div className="flex items-center gap-2 text-sm text-slate-500"><Mail size={14} />{intern.user.email}</div>}
            {intern.user?.phone && <div className="flex items-center gap-2 text-sm text-slate-500"><Phone size={14} />{intern.user.phone}</div>}
            {intern.github && <a href={intern.github} target="_blank" className="flex items-center gap-2 text-sm text-primary-500 hover:underline"><Github size={14} />GitHub Profile</a>}
            {intern.linkedin && <a href={intern.linkedin} target="_blank" className="flex items-center gap-2 text-sm text-primary-500 hover:underline"><Linkedin size={14} />LinkedIn Profile</a>}
          </div>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-slate-400">Performance</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{intern.performanceScore}/100</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-dark-600 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full" style={{ width: `${intern.performanceScore}%` }} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Calendar size={16} />Internship Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-400 text-xs">Start Date</p><p className="font-medium text-slate-700 dark:text-slate-300">{new Date(intern.internshipStart).toDateString()}</p></div>
              <div><p className="text-slate-400 text-xs">End Date</p><p className="font-medium text-slate-700 dark:text-slate-300">{new Date(intern.internshipEnd).toDateString()}</p></div>
              <div><p className="text-slate-400 text-xs">Duration</p><p className="font-medium text-slate-700 dark:text-slate-300">{intern.internshipDuration}</p></div>
              <div><p className="text-slate-400 text-xs">Mentor</p><p className="font-medium text-slate-700 dark:text-slate-300">{intern.mentor || '—'}</p></div>
              <div><p className="text-slate-400 text-xs">Team</p><p className="font-medium text-slate-700 dark:text-slate-300">{intern.team?.name || '—'}</p></div>
            </div>
          </div>

          {intern.college?.name && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><GraduationCap size={16} />Education</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-400 text-xs">College</p><p className="font-medium text-slate-700 dark:text-slate-300">{intern.college.name}</p></div>
                <div><p className="text-slate-400 text-xs">Degree</p><p className="font-medium text-slate-700 dark:text-slate-300">{intern.college.degree || '—'}</p></div>
                <div><p className="text-slate-400 text-xs">Branch</p><p className="font-medium text-slate-700 dark:text-slate-300">{intern.college.branch || '—'}</p></div>
              </div>
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Tech Stack & Skills</h3>
            <div className="flex flex-wrap gap-2">
              {[...(intern.techStack || []), ...(intern.skills || [])].map((s, i) => (
                <span key={i} className="badge-blue">{s}</span>
              ))}
              {!intern.techStack?.length && !intern.skills?.length && <span className="text-slate-400 text-sm">No skills listed</span>}
            </div>
          </div>

          {intern.projects?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Assigned Projects</h3>
              <div className="space-y-2">
                {intern.projects.map(p => (
                  <div key={p._id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-dark-600 last:border-0">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{p.title}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-dark-600 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                      <Badge status={p.status} label={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
