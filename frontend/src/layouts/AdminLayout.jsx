import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '../redux/slices/uiSlice'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { motion, AnimatePresence } from 'framer-motion'

const adminNav = [
  { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard', exact: true },
  { label: 'Interns', path: '/admin/interns', icon: 'Users' },
  { label: 'Projects', path: '/admin/projects', icon: 'FolderKanban' },
  { label: 'Tasks', path: '/admin/tasks', icon: 'CheckSquare' },
  { label: 'Attendance', path: '/admin/attendance', icon: 'Clock' },
  { label: 'Teams', path: '/admin/teams', icon: 'UsersRound' },
  { label: 'Reports', path: '/admin/reports', icon: 'BarChart3' },
  { label: 'Certificates', path: '/admin/certificates', icon: 'Award' },
  { label: 'Support', path: '/admin/tickets', icon: 'LifeBuoy' },
  { label: 'Settings', path: '/admin/settings', icon: 'Settings' },
]

export default function AdminLayout() {
  const { sidebarOpen } = useSelector(s => s.ui)
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-900">
      <Sidebar nav={adminNav} role="admin" />
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => {}} />}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
