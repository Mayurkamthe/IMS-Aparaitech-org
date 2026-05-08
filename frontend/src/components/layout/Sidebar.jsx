import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/slices/authSlice'
import { toggleSidebar } from '../../redux/slices/uiSlice'
import * as Icons from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const DynIcon = ({ name, size = 18 }) => {
  const Icon = Icons[name] || Icons.Circle
  return <Icon size={size} />
}

export default function Sidebar({ nav, role }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { sidebarOpen } = useSelector(s => s.ui)
  const { user } = useSelector(s => s.auth)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
  }

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -264 }} animate={{ x: 0 }} exit={{ x: -264 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed left-0 top-0 h-full w-64 z-30 bg-dark-800 border-r border-dark-600 flex flex-col"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 h-16 border-b border-dark-600">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
              <Icons.Layers size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">Internship LMS</p>
              <p className="text-slate-500 text-xs mt-0.5 capitalize">{role} Panel</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
            {nav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
              >
                <DynIcon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User info */}
          <div className="border-t border-dark-600 p-3">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-600/30 flex items-center justify-center flex-shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-primary-400 text-xs font-semibold">{user?.name?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-slate-500 text-xs truncate capitalize">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
                <Icons.LogOut size={16} />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
