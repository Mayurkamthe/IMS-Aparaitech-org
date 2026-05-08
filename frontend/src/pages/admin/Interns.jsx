import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Upload, Edit, Trash2, Eye, RefreshCw, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../services/api'
import Modal from '../../components/common/Modal'
import { Badge, Empty, Skeleton } from '../../components/common/index'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const DEPTS = ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'Data Science', 'UI/UX', 'QA']
const STACKS = ['React', 'Node.js', 'Python', 'Flutter', 'Angular', 'Vue', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker']

export default function Interns() {
  const [interns, setInterns] = useState([])
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', department: '', search: '' })
  const [createModal, setCreateModal] = useState(false)
  const [importModal, setImportModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchInterns = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10, ...filters })
      const { data } = await api.get(`/interns?${params}`)
      setInterns(data.data)
      setPagination(data.pagination)
    } catch {} finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchInterns() }, [fetchInterns])

  const onCreateIntern = async (formData) => {
    setSaving(true)
    try {
      const payload = new FormData()
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v))
      payload.set('techStack', JSON.stringify(formData.techStack ? [formData.techStack] : []))
      payload.set('college', JSON.stringify({ name: formData.collegeName, degree: formData.degree }))
      await api.post('/interns', payload)
      toast.success('Intern created successfully')
      setCreateModal(false)
      reset()
      fetchInterns()
    } catch {} finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this intern?')) return
    try {
      await api.delete(`/interns/${id}`)
      toast.success('Intern deactivated')
      fetchInterns()
    } catch {}
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Interns</h1>
          <p className="text-sm text-slate-400">{pagination.total} total interns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setImportModal(true)} className="btn-secondary flex items-center gap-2 text-sm">
            <Upload size={15} />Bulk Import
          </button>
          <button onClick={() => setCreateModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} />Add Intern
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search by name or ID..." className="input pl-9" value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
        </div>
        <select className="input w-full sm:w-40" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="terminated">Terminated</option>
        </select>
        <select className="input w-full sm:w-44" value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
          <option value="">All Departments</option>
          {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button onClick={() => fetchInterns()} className="btn-secondary flex items-center gap-2 text-sm flex-shrink-0">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-dark-800 border-b border-slate-100 dark:border-dark-600">
              <tr>
                {['Intern', 'ID', 'Department', 'Tech Stack', 'Duration', 'Status', 'Score', 'Actions'].map(h => (
                  <th key={h} className="table-header py-3 px-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-dark-600">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><Skeleton lines={1} /></td></tr>
              )) : interns.length === 0 ? (
                <tr><td colSpan={8}><Empty title="No interns found" description="Add your first intern to get started" icon={Plus} /></td></tr>
              ) : interns.map((intern, i) => (
                <motion.tr key={intern._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50 dark:hover:bg-dark-600/40 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
                        {intern.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{intern.user?.name}</p>
                        <p className="text-xs text-slate-400">{intern.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell"><span className="font-mono text-xs text-slate-500">{intern.internId}</span></td>
                  <td className="table-cell text-sm">{intern.department}</td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {intern.techStack?.slice(0, 2).map(t => <span key={t} className="badge-blue text-xs px-1.5 py-0.5 rounded text-xs">{t}</span>)}
                      {intern.techStack?.length > 2 && <span className="text-xs text-slate-400">+{intern.techStack.length - 2}</span>}
                    </div>
                  </td>
                  <td className="table-cell text-xs text-slate-500">{intern.internshipDuration}</td>
                  <td className="table-cell"><Badge status={intern.status} label={intern.status} /></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <div className="w-14 h-1.5 bg-slate-200 dark:bg-dark-600 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${intern.performanceScore}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{intern.performanceScore}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/interns/${intern._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><Eye size={15} /></Link>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(intern._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-dark-600">
            <p className="text-xs text-slate-400">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => fetchInterns(pagination.page - 1)} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Prev</button>
              <button disabled={pagination.page >= pagination.pages} onClick={() => fetchInterns(pagination.page + 1)} className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => { setCreateModal(false); reset() }} title="Add New Intern" size="lg">
        <form onSubmit={handleSubmit(onCreateIntern)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input {...register('name', { required: true })} className="input" placeholder="John Doe" />{errors.name && <p className="text-red-400 text-xs mt-1">Required</p>}</div>
            <div><label className="label">Email</label><input {...register('email', { required: true })} type="email" className="input" placeholder="john@email.com" />{errors.email && <p className="text-red-400 text-xs mt-1">Required</p>}</div>
            <div><label className="label">Phone</label><input {...register('phone')} className="input" placeholder="+91 9876543210" /></div>
            <div><label className="label">Department</label>
              <select {...register('department', { required: true })} className="input">
                <option value="">Select department</option>
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="label">Tech Stack</label>
              <select {...register('techStack')} className="input">
                <option value="">Select primary stack</option>
                {STACKS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="label">Start Date</label><input {...register('internshipStart', { required: true })} type="date" className="input" /></div>
            <div><label className="label">End Date</label><input {...register('internshipEnd', { required: true })} type="date" className="input" /></div>
            <div><label className="label">College Name</label><input {...register('collegeName')} className="input" placeholder="University name" /></div>
            <div><label className="label">Degree</label><input {...register('degree')} className="input" placeholder="B.Tech Computer Science" /></div>
            <div><label className="label">Mentor</label><input {...register('mentor')} className="input" placeholder="Mentor name" /></div>
          </div>
          <p className="text-xs text-slate-400">A welcome email with login credentials will be sent automatically.</p>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setCreateModal(false); reset() }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create Intern'}</button>
          </div>
        </form>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={importModal} onClose={() => setImportModal(false)} title="Bulk Import Interns">
        <div className="space-y-4">
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <p className="text-sm text-primary-800 dark:text-primary-300 font-medium mb-2">Excel Format Required</p>
            <p className="text-xs text-primary-600 dark:text-primary-400">Columns: Name, Email, Phone, Department, Tech Stack, Start Date, End Date</p>
          </div>
          <div className="border-2 border-dashed border-slate-200 dark:border-dark-600 rounded-xl p-8 text-center">
            <Upload size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">Drop Excel/CSV file here or click to browse</p>
            <input type="file" accept=".xlsx,.csv" className="hidden" />
            <button className="mt-3 btn-secondary text-sm">Browse File</button>
          </div>
          <button className="btn-primary w-full">Import Interns</button>
        </div>
      </Modal>
    </div>
  )
}
