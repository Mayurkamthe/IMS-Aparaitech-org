import { useEffect, useState } from 'react'
import { CheckSquare, Upload, MessageSquare, Send, X, ExternalLink } from 'lucide-react'
import api from '../../services/api'
import Modal from '../../components/common/Modal'
import { Badge, Empty, Skeleton } from '../../components/common/index'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const priorityColors = { low: 'text-emerald-500', medium: 'text-amber-500', high: 'text-red-500' }
const priorityBg = { low: 'bg-emerald-50 dark:bg-emerald-900/10', medium: 'bg-amber-50 dark:bg-amber-900/10', high: 'bg-red-50 dark:bg-red-900/10' }

export default function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitModal, setSubmitModal] = useState(null)
  const [commentModal, setCommentModal] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles] = useState([])
  const [filters, setFilters] = useState({ status: '', priority: '' })
  const { register, handleSubmit, reset } = useForm()
  const { register: regC, handleSubmit: handleC, reset: resetC } = useForm()

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(filters)
      const { data } = await api.get(`/tasks/my-tasks?${params}`)
      setTasks(data.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchTasks() }, [filters])

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('taskId', submitModal._id)
      formData.append('githubLink', data.githubLink || '')
      formData.append('liveLink', data.liveLink || '')
      formData.append('notes', data.notes || '')
      files.forEach(f => formData.append('files', f))
      await api.post('/tasks/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Task submitted successfully!')
      setSubmitModal(null); setFiles([]); reset(); fetchTasks()
    } catch {} finally { setSubmitting(false) }
  }

  const onComment = async (data) => {
    try {
      await api.post(`/tasks/${commentModal._id}/comment`, data)
      toast.success('Comment added')
      resetC(); fetchTasks()
    } catch {}
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-slate-800 dark:text-white">My Tasks</h1><p className="text-sm text-slate-400">{tasks.length} tasks assigned</p></div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <select className="input w-40" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Status</option>
          {['pending', 'in_progress', 'submitted', 'approved', 'rejected'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select className="input w-32" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
          <option value="">All Priority</option>
          {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? Array(6).fill(0).map((_, i) => <div key={i} className="card p-5"><Skeleton lines={4} /></div>)
          : tasks.length === 0 ? <div className="col-span-3"><Empty title="No tasks assigned" icon={CheckSquare} /></div>
          : tasks.map((task, i) => {
          const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
          const isOverdue = daysLeft < 0
          return (
            <motion.div key={task._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-white truncate">{task.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                </div>
                <Badge status={task.status} label={task.status.replace('_', ' ')} />
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`text-xs font-semibold uppercase ${priorityColors[task.priority]}`}>{task.priority}</span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="badge-slate text-xs capitalize">{task.type}</span>
                {task.project && <span className="badge-blue text-xs">{task.project.title}</span>}
              </div>

              <div className={`flex items-center justify-between text-xs rounded-lg px-3 py-2 mb-3 ${isOverdue ? 'bg-red-50 dark:bg-red-900/10' : 'bg-slate-50 dark:bg-dark-800'}`}>
                <span className="text-slate-400">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                <span className={`font-medium ${isOverdue ? 'text-red-500' : daysLeft <= 2 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                </span>
              </div>

              {/* Rejected feedback */}
              {task.status === 'rejected' && task.comments?.slice(-1)[0] && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-2 mb-3">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">Review Feedback:</p>
                  <p className="text-xs text-red-500 mt-1">{task.comments.slice(-1)[0].text}</p>
                </div>
              )}

              <div className="flex gap-2">
                {['pending', 'in_progress', 'rejected'].includes(task.status) && (
                  <button onClick={() => setSubmitModal(task)} className="btn-primary flex-1 flex items-center justify-center gap-1 text-xs py-1.5">
                    <Upload size={12} />{task.status === 'rejected' ? 'Resubmit' : 'Submit'}
                  </button>
                )}
                <button onClick={() => setCommentModal(task)} className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-3">
                  <MessageSquare size={12} />{task.comments?.length || 0}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Submit Modal */}
      <Modal isOpen={!!submitModal} onClose={() => { setSubmitModal(null); setFiles([]); reset() }} title={`Submit: ${submitModal?.title}`} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Upload Files</label>
            <div className="border-2 border-dashed border-slate-200 dark:border-dark-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setFiles(Array.from(e.dataTransfer.files)) }}>
              <Upload size={24} className="mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-400">Drag & drop or <label className="text-primary-500 cursor-pointer hover:underline">browse<input type="file" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files))} /></label></p>
              <p className="text-xs text-slate-500 mt-1">ZIP, PDF, DOC, Images supported</p>
            </div>
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 dark:bg-dark-800 rounded-lg px-3 py-2">
                    <span className="text-xs text-slate-600 dark:text-slate-300 truncate">{f.name}</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))}><X size={13} className="text-slate-400" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="label flex items-center gap-1"><ExternalLink size={13} />GitHub Repository Link</label>
            <input {...register('githubLink')} className="input" placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="label flex items-center gap-1"><ExternalLink size={13} />Live Demo URL</label>
            <input {...register('liveLink')} className="input" placeholder="https://your-demo.vercel.app" />
          </div>
          <div>
            <label className="label">Notes / Comments</label>
            <textarea {...register('notes')} className="input h-20 resize-none" placeholder="Any notes for the reviewer..." />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setSubmitModal(null); setFiles([]); reset() }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Send size={14} />{submitting ? 'Submitting...' : 'Submit Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Comments Modal */}
      <Modal isOpen={!!commentModal} onClose={() => setCommentModal(null)} title="Comments">
        {commentModal && (
          <div className="space-y-3">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {commentModal.comments?.length > 0 ? commentModal.comments.map((c, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 flex-shrink-0">
                    {c.user?.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{c.user?.name}</span>
                      <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{c.text}</p>
                  </div>
                </div>
              )) : <p className="text-slate-400 text-sm text-center py-4">No comments yet</p>}
            </div>
            <form onSubmit={handleC(onComment)} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-dark-600">
              <input {...regC('text', { required: true })} className="input flex-1" placeholder="Add a comment..." />
              <button type="submit" className="btn-primary px-4 text-sm">Post</button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}
