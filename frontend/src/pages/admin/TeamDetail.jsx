import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Crown, Users, Hash, Video, FolderOpen, MessageSquare, Settings, Plus, Trash2 } from 'lucide-react'
import api from '../../services/api'
import { Badge, Skeleton, PageHeader } from '../../components/common/index'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { useForm } from 'react-hook-form'

export default function AdminTeamDetail() {
  const { id } = useParams()
  const [team, setTeam]         = useState(null)
  const [channels, setChannels] = useState([])
  const [messages, setMessages] = useState([])
  const [activeChannel, setActiveChannel] = useState('general')
  const [loading, setLoading]   = useState(true)
  const [channelModal, setChannelModal] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, chRes] = await Promise.all([
          api.get(`/teams/${id}`),
          api.get(`/teams/${id}/channels`),
        ])
        setTeam(tRes.data.data)
        setChannels(chRes.data.data)
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!id) return
    api.get(`/teams/${id}/messages?channel=${activeChannel}&limit=30`).then(r => setMessages(r.data.data))
  }, [id, activeChannel])

  const addChannel = async (data) => {
    try {
      const r = await api.post(`/teams/${id}/channels`, { name: data.name.toLowerCase().replace(/\s+/g,'-'), description: data.description, type: data.type || 'text' })
      setChannels(prev => [...prev, r.data.data])
      toast.success('Channel created'); setChannelModal(false); reset()
    } catch {}
  }

  const deleteChannel = async (chId) => {
    if (!confirm('Delete this channel and all its messages?')) return
    try {
      await api.delete(`/teams/${id}/channels/${chId}`)
      setChannels(prev => prev.filter(c => c._id !== chId))
      toast.success('Channel deleted')
    } catch {}
  }

  if (loading) return <div className="max-w-4xl space-y-4"><Skeleton lines={8}/></div>
  if (!team)   return <div className="text-center py-20 text-zinc-400">Team not found</div>

  return (
    <div className="space-y-5 max-w-screen-xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/teams" className="btn-secondary p-2.5"><ArrowLeft size={16}/></Link>
        <PageHeader title={team.name} subtitle={`${team.members?.length||0} members · ${channels.length} channels`}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: team info */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2"><Users size={16}/>Members</h3>
            <div className="space-y-2.5">
              {team.members?.map(m => {
                const isLeader = team.leader?._id === m._id
                return (
                  <div key={m._id} className="flex items-center gap-3 p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs font-bold text-violet-600 flex-shrink-0">
                      {m.user?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{m.user?.name}</p>
                      <p className="text-xs text-zinc-400">{m.department}</p>
                    </div>
                    {isLeader && <Crown size={13} className="text-amber-500 flex-shrink-0"/>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2"><Hash size={16}/>Channels</h3>
              <button onClick={() => setChannelModal(true)} className="btn-secondary p-1.5"><Plus size={14}/></button>
            </div>
            <div className="space-y-1.5">
              {channels.map(ch => (
                <div key={ch._id} onClick={() => setActiveChannel(ch.name)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer group transition-colors
                    ${activeChannel===ch.name ? 'bg-violet-100 dark:bg-violet-900/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}>
                  <Hash size={13} className="text-zinc-400 flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{ch.name}</p>
                    {ch.description && <p className="text-xs text-zinc-400 truncate">{ch.description}</p>}
                  </div>
                  {!ch.isDefault && (
                    <button onClick={e => { e.stopPropagation(); deleteChannel(ch._id) }}
                      className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all">
                      <Trash2 size={12}/>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {team.projects?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2"><FolderOpen size={16}/>Projects</h3>
              <div className="space-y-2">
                {team.projects.map(p => (
                  <div key={p._id} className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{p.title}</p>
                    <Badge status={p.status} label={p.status}/>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: recent messages */}
        <div className="lg:col-span-2 card overflow-hidden flex flex-col" style={{height:'600px'}}>
          <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 flex-shrink-0">
            <Hash size={15} className="text-zinc-400"/>
            <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{activeChannel}</span>
            <span className="text-xs text-zinc-400 ml-auto">{messages.length} messages</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0
              ? <div className="flex items-center justify-center h-full text-zinc-400 text-sm">No messages in #{activeChannel} yet</div>
              : messages.map(m => (
              <div key={m._id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs font-bold text-violet-600 flex-shrink-0">
                  {m.sender?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{m.sender?.name}</span>
                    <span className="text-xs text-zinc-400">{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap break-words">{m.content || <span className="italic text-zinc-400">[file]</span>}</p>
                  {m.attachments?.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.attachments.map((att, i) => (
                        <a key={i} href={att.url} target="_blank" rel="noreferrer"
                          className="text-xs text-violet-600 hover:underline flex items-center gap-1">
                          <FolderOpen size={11}/>{att.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
            <p className="text-xs text-zinc-400 text-center">Read-only admin view · Students interact via the Student Portal</p>
          </div>
        </div>
      </div>

      <Modal isOpen={channelModal} onClose={() => {setChannelModal(false);reset()}} title="Add New Channel">
        <form onSubmit={handleSubmit(addChannel)} className="space-y-4">
          <div><label className="label">Channel Name <span className="text-red-500">*</span></label>
            <input {...register('name',{required:true})} className="input" placeholder="e.g. design-review"/></div>
          <div><label className="label">Description</label>
            <input {...register('description')} className="input" placeholder="What is this channel for?"/></div>
          <div><label className="label">Type</label>
            <select {...register('type')} className="input">
              <option value="text">Text Channel</option>
              <option value="announcement">Announcement Channel</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => {setChannelModal(false);reset()}} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Create Channel</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
