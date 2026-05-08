import { useEffect, useState } from 'react'
import { Plus, CheckSquare, Eye, Trash2, Edit, MessageSquare } from 'lucide-react'
import api from '../../services/api'
import Modal from '../../components/common/Modal'
import { Badge, Empty, Skeleton } from '../../components/common/index'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [reviewModal, setReviewModal] = useState(null)
  const [filters, setFilters] = useState({ status: '', priority: '', type: '' })
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm()
  const { register: regR, handleSubmit: handleR } = useForm()

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(filters)
      const [tRes, iRes] = await Promise.all([api.get(`/tasks?${params}`), api.get('/interns?limit=100')])
      setTasks(tRes.data.data)
      setInterns(iRes.data.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchTasks() }, [filters])

  const onCreate = async (data) => {
    setSaving(true)
    try {
      await api.post('/tasks', { ...data, assignedTo: [data.assignedTo] })
      toast.success('Task created and intern notified')
      setModal(false); reset(); fetchTasks()
    } catch {} finally { setSaving(false) }
  }

  const onReview = async (data) => {
    try {
      await api.put(`/tasks/submission/${reviewModal}/review`, data)
      toast.success('Submission reviewed')
      setReviewModal(null); fetchTasks()
    } catch {}
  }

  const priorityColors = { low: 'text-emerald-500', medium: 'text-amber-500', high: 'text-red-500' }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Task Management</h1>
          <p className="text-sm text-slate-400">{tasks.length} tasks total</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={15} />Create Task</button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select className="input w-36" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          {['pending', 'in_progress', 'submitted', 'approved', 'rejected'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="input w-32" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
          <option value="">All Priority</option>
          {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="input w-32" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="">All Types</option>
          {['daily', 'weekly', 'project'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-dark-800 border-b border-slate-100 dark:border-dark-600">
            <tr>{['Task', 'Type', 'Priority', 'Assigned To', 'Due Date', 'Status', 'Actions'].map(h => <th key={h} className="table-header py-3 px-4 text-left">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-dark-600">
            {loading ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton lines={1} /></td></tr>)
              : tasks.length === 0 ? <tr><td colSpan={7}><Empty title="No tasks yet" icon={CheckSquare} /></td></tr>
              : tasks.map((task, i) => (
              <motion.tr key={task._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="hover:bg-slate-50 dark:hover:bg-dark-600/40 transition-colors">
                <td className="table-cell">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">{task.title}</p>
                    <p className="text-xs text-slate-400 truncate max-w-xs">{task.description}</p>
                  </div>
                </td>
                <td className="table-cell"><span className="badge-slate capitalize">{task.type}</span></td>
                <td className="table-cell"><span className={`text-xs font-semibold uppercase ${priorityColors[task.priority]}`}>{task.priority}</span></td>
                <td className="table-cell">
                  <div className="flex -space-x-1">
                    {task.assignedTo?.slice(0, 3).map(i => (
                      <div key={i._id} className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 border-2 border-white dark:border-dark-700 flex items-center justify-center text-xs text-primary-600 font-bold">
                        {i.user?.name?.[0]}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="table-cell text-xs">{new Date(task.dueDate).toLocaleDateString()}</td>
                <td className="table-cell"><Badge status={task.status} label={task.status.replace('_', ' ')} /></td>
                <td className="table-cell">
                  <div className="flex gap-1">
                    {task.status === 'submitted' && <button onClick={() => setReviewModal(task._id)} className="text-xs btn-primary py-1 px-2">Review</button>}
                    <button className="p-1.5 rounded text-slate-400 hover:text-red-500 transition-colors" onClick={async () => { if (confirm('Delete task?')) { await api.delete(`/tasks/${task._id}`); fetchTasks() } }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); reset() }} title="Create Task" size="lg">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div><label className="label">Title</label><input {...register('title', { required: true })} className="input" placeholder="Task title" /></div>
          <div><label className="label">Description</label><textarea {...register('description', { required: true })} className="input h-20 resize-none" placeholder="Detailed task description..." /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Type</label>
              <select {...register('type')} className="input">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div><label className="label">Priority</label>
              <select {...register('priority')} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div><label className="label">Due Date</label><input {...register('dueDate', { required: true })} type="date" className="input" /></div>
          </div>
          <div><label className="label">Assign To</label>
            <select {...register('assignedTo', { required: true })} className="input">
              <option value="">Select intern</option>
              {interns.map(i => <option key={i._id} value={i._id}>{i.user?.name} — {i.department}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setModal(false); reset() }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create Task'}</button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Review Submission">
        <form onSubmit={handleR(onReview)} className="space-y-4">
          <div><label className="label">Decision</label>
            <select {...regR('status', { required: true })} className="input">
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
            </select>
          </div>
          <div><label className="label">Comment (optional)</label><textarea {...regR('reviewComment')} className="input h-24 resize-none" placeholder="Feedback for the intern..." /></div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setReviewModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Submit Review</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
