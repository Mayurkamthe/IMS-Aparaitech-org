import { useEffect, useState } from 'react'
import { UsersRound, Crown, FolderKanban, Mail, Phone, User } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../../services/api'
import { Empty, Skeleton } from '../../components/common/index'
import { useSelector } from 'react-redux'

export default function MyTeam() {
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const { internData } = useSelector(s => s.auth)

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true)
      try {
        const teamId = internData?.team?._id || internData?.team
        if (teamId) {
          // Intern has a team reference — fetch it directly
          const { data } = await api.get(`/teams/${teamId}`)
          setTeam(data.data)
        } else {
          // Fallback: scan all teams and find one this intern is a member of
          const { data } = await api.get('/teams')
          const internId = internData?._id
          const myTeam = data.data?.find(t =>
            t.members?.some(m => (m._id || m) === internId) ||
            (t.leader?._id || t.leader) === internId
          )
          setTeam(myTeam || null)
        }
      } catch (e) {
        console.error('MyTeam fetch error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchTeam()
  }, [internData])

  if (loading) return (
    <div className="space-y-5">
      <div className="card p-5"><Skeleton lines={5} /></div>
    </div>
  )

  if (!team) return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">My Team</h1>
        <p className="text-sm text-slate-400">Your team details</p>
      </div>
      <div className="card p-6">
        <Empty title="No team assigned" description="You haven't been assigned to a team yet. Contact your admin." icon={UsersRound} />
      </div>
    </div>
  )

  const internId = internData?._id
  const isLeader = (team.leader?._id || team.leader) === internId

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">My Team</h1>
        <p className="text-sm text-slate-400">Your team details and members</p>
      </div>

      {/* Team Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <UsersRound size={26} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{team.name}</h2>
              {isLeader && (
                <span className="flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                  <Crown size={11} /> Team Leader
                </span>
              )}
            </div>
            {team.description && <p className="text-sm text-slate-400 mt-1">{team.description}</p>}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span>{team.members?.length || 0} members</span>
              {team.projects?.length > 0 && <span>{team.projects.length} project(s)</span>}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Members */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <UsersRound size={16} className="text-primary-500" /> Members
          </h3>
          <div className="space-y-3">
            {!team.members || team.members.length === 0
              ? <p className="text-sm text-slate-400">No members yet.</p>
              : team.members.map((member, i) => (
                <motion.div key={member._id || i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-700/50 hover:bg-slate-100 dark:hover:bg-dark-600/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm flex-shrink-0">
                    {member.user?.name?.[0]?.toUpperCase() || <User size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800 dark:text-white text-sm truncate">{member.user?.name}</p>
                      {(team.leader?._id || team.leader) === member._id && (
                        <Crown size={11} className="text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{member.department}</p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    {member.user?.email && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Mail size={10} />{member.user.email}
                      </span>
                    )}
                    {member.user?.phone && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Phone size={10} />{member.user.phone}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            }
          </div>
        </div>

        {/* Projects */}
        <div className="card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <FolderKanban size={16} className="text-primary-500" /> Team Projects
          </h3>
          {!team.projects || team.projects.length === 0
            ? <p className="text-sm text-slate-400">No projects assigned yet.</p>
            : <div className="space-y-2">
              {team.projects.map((project, i) => (
                <motion.div key={project._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-dark-700/50">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{project.title || project}</p>
                  {project.status && (
                    <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full font-medium
                      ${project.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : project.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-dark-600 dark:text-slate-400'}`}>
                      {project.status}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  )
}
