import { useEffect, useState } from 'react'
import { Plus, MessageSquare, LifeBuoy } from 'lucide-react'
import api from '../../services/api'
import Modal from '../../components/common/Modal'
import { Badge, Empty } from '../../components/common/index'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function MyTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const { register, handleSubmit, reset } = useForm()
  const { register: regR, handleSubmit: handleR, reset: resetR } = useForm()

  const fetchTickets = () => { api.get('/tickets').then(r => setTickets(r.data.data)).finally(() => setLoading(false)) }
  useEffect(() => { fetchTickets() }, [])

  const onCreate = async (data) => {
    try {
      await api.post('/tickets', data)
      toast.success('Ticket raised!')
      setCreateModal(false); reset(); fetchTickets()
    } catch {}
  }

  const onReply = async (data) => {
    try {
      const r = await api.post(`/tickets/${selected._id}/reply`, data)
      toast.success('Reply sent')
      resetR(); fetchTickets()
      setSelected(prev => ({ ...prev, replies: [...(prev.replies || []), { message: data.message, isAdmin: false, createdAt: new Date() }] }))
    } catch {}
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-slate-800 dark:text-white">Support Tickets</h1></div>
        <button onClick={() => setCreateModal(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={15} />Raise Ticket</button>
      </div>

      {tickets.length === 0 && !loading ? <Empty title="No tickets raised" description="Use the button above to raise a support ticket" icon={LifeBuoy} />
        : (
        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t._id} className="card-hover p-4 cursor-pointer" onClick={() => setSelected(t)}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-white">{t.subject}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Badge status={t.priority} label={t.priority} />
                  <Badge status={t.status} label={t.status.replace('_', ' ')} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1"><MessageSquare size={11} />{t.replies?.length || 0} replies</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={createModal} onClose={() => { setCreateModal(false); reset() }} title="Raise Support Ticket">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div><label className="label">Subject</label><input {...register('subject', { required: true })} className="input" placeholder="Brief description of your issue" /></div>
          <div><label className="label">Category</label>
            <select {...register('category')} className="input">
              {['technical', 'task', 'attendance', 'general', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className="label">Priority</label>
            <select {...register('priority')} className="input">
              {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div><label className="label">Description</label><textarea {...register('description', { required: true })} className="input h-24 resize-none" placeholder="Describe your issue in detail..." /></div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setCreateModal(false); reset() }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Submit Ticket</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.subject} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-dark-800 rounded-lg p-4">
              <div className="flex gap-2 mb-2"><Badge status={selected.status} label={selected.status.replace('_', ' ')} /><Badge status={selected.priority} label={selected.priority} /></div>
              <p className="text-sm text-slate-700 dark:text-slate-300">{selected.description}</p>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {selected.replies?.map((r, i) => (
                <div key={i} className={`flex ${r.isAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs rounded-xl px-4 py-2.5 text-sm ${r.isAdmin ? 'bg-slate-100 dark:bg-dark-600 text-slate-800 dark:text-slate-200' : 'bg-primary-600 text-white'}`}>
                    <p className={`text-xs font-medium mb-1 ${r.isAdmin ? 'text-slate-500' : 'text-primary-200'}`}>{r.isAdmin ? 'Admin' : 'You'}</p>
                    {r.message}
                  </div>
                </div>
              ))}
            </div>
            {selected.status !== 'closed' && selected.status !== 'resolved' && (
              <form onSubmit={handleR(onReply)} className="flex gap-2">
                <input {...regR('message', { required: true })} className="input flex-1" placeholder="Add a reply..." />
                <button type="submit" className="btn-primary text-sm px-4">Send</button>
              </form>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
