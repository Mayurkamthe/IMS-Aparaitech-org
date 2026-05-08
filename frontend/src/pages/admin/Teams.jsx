import { useEffect, useState } from 'react'
import { Plus, UsersRound, Edit, Trash2, Crown } from 'lucide-react'
import api from '../../services/api'
import Modal from '../../components/common/Modal'
import { Empty, Skeleton } from '../../components/common/index'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const [tRes, iRes] = await Promise.all([api.get('/teams'), api.get('/interns?limit=100&status=active')])
      setTeams(tRes.data.data)
      setInterns(iRes.data.data)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchTeams() }, [])

  const onCreate = async (data) => {
    setSaving(true)
    try {
      const members = Array.isArray(data.members) ? data.members : [data.members]
      await api.post('/teams', { ...data, members })
      toast.success('Team created')
      setModal(false); reset(); fetchTeams()
    } catch {} finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-slate-800 dark:text-white">Teams</h1><p className="text-sm text-slate-400">{teams.length} teams</p></div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={15} />Create Team</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="card p-5"><Skeleton lines={4} /></div>)
          : teams.length === 0 ? <div className="col-span-3"><Empty title="No teams yet" icon={UsersRound} /></div>
          : teams.map((team, i) => (
          <motion.div key={team._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-hover p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{team.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{team.description}</p>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors"><Edit size={14} /></button>
                <button onClick={async () => { if (confirm('Delete team?')) { await api.delete(`/teams/${team._id}`); fetchTeams() } }} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>

            {/* Leader */}
            {team.leader && (
              <div className="flex items-center gap-2 mb-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-2">
                <Crown size={13} className="text-amber-500 flex-shrink-0" />
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">{team.leader?.user?.name}</span>
                <span className="text-xs text-amber-500">Team Leader</span>
              </div>
            )}

            {/* Members */}
            <div className="mb-3">
              <p className="text-xs font-medium text-slate-500 mb-2">{team.members?.length || 0} Members</p>
              <div className="flex flex-wrap gap-2">
                {team.members?.slice(0, 6).map(m => (
                  <div key={m._id} className="flex items-center gap-1.5 bg-slate-100 dark:bg-dark-600 rounded-full px-2.5 py-1">
                    <div className="w-4 h-4 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center text-xs text-primary-700 dark:text-primary-300 font-bold">{m.user?.name?.[0]}</div>
                    <span className="text-xs text-slate-600 dark:text-slate-300">{m.user?.name?.split(' ')[0]}</span>
                  </div>
                ))}
                {team.members?.length > 6 && <span className="text-xs text-slate-400 self-center">+{team.members.length - 6} more</span>}
              </div>
            </div>

            {team.projects?.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-dark-600">
                <p className="text-xs text-slate-400">{team.projects.length} project(s) assigned</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => { setModal(false); reset() }} title="Create Team" size="lg">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div><label className="label">Team Name</label><input {...register('name', { required: true })} className="input" placeholder="Team Alpha" /></div>
          <div><label className="label">Description</label><textarea {...register('description')} className="input h-16 resize-none" /></div>
          <div><label className="label">Team Leader</label>
            <select {...register('leader')} className="input">
              <option value="">Select leader</option>
              {interns.map(i => <option key={i._id} value={i._id}>{i.user?.name} — {i.department}</option>)}
            </select>
          </div>
          <div><label className="label">Members (hold Ctrl for multiple)</label>
            <select {...register('members')} multiple className="input h-32">
              {interns.map(i => <option key={i._id} value={i._id}>{i.user?.name} — {i.department}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setModal(false); reset() }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create Team'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
