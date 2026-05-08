import { useDispatch, useSelector } from 'react-redux'
import { toggleSidebar, toggleTheme } from '../../redux/slices/uiSlice'
import { markRead, markAllRead } from '../../redux/slices/notificationSlice'
import { Menu, Sun, Moon, Bell, Search, X, Check } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { theme } = useSelector(s => s.ui)
  const { items, unread } = useSelector(s => s.notifications)
  const { user } = useSelector(s => s.auth)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkRead = async (id) => {
    dispatch(markRead(id))
    await api.put(`/notifications/${id}/read`).catch(() => {})
  }

  const handleMarkAll = async () => {
    dispatch(markAllRead())
    await api.put('/notifications/read-all').catch(() => {})
  }

  return (
    <header className="h-16 bg-white dark:bg-dark-700 border-b border-slate-100 dark:border-dark-600 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={() => dispatch(toggleSidebar())} className="text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors">
          <Menu size={20} />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-600 rounded-lg px-3 py-2 w-64">
          <Search size={15} className="text-slate-400" />
          <input placeholder="Search..." className="bg-transparent text-sm outline-none w-full placeholder:text-slate-400 dark:text-white" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => dispatch(toggleTheme())} className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-600 transition-colors">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-600 transition-colors">
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 card shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-dark-600">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unread > 0 && <button onClick={handleMarkAll} className="text-xs text-primary-600 hover:underline flex items-center gap-1"><Check size={12} />Mark all read</button>}
                    <button onClick={() => setNotifOpen(false)}><X size={15} className="text-slate-400" /></button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-dark-600">
                  {items.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">No notifications</div>
                  ) : items.slice(0, 10).map(n => (
                    <div key={n._id} onClick={() => handleMarkRead(n._id)}
                      className={`px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-600 transition-colors ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                      <div className="flex items-start gap-2">
                        {!n.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />}
                        <div className={!n.isRead ? '' : 'pl-4'}>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="avatar" />
              : <span className="text-primary-700 dark:text-primary-300 text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
