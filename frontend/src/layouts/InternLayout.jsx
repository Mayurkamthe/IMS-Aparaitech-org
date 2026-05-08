import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { motion } from 'framer-motion'

const internNav = [
  { label: 'Dashboard', path: '/intern', icon: 'LayoutDashboard', exact: true },
  { label: 'My Tasks', path: '/intern/tasks', icon: 'CheckSquare' },
  { label: 'Projects', path: '/intern/projects', icon: 'FolderKanban' },
  { label: 'Attendance', path: '/intern/attendance', icon: 'Clock' },
  { label: 'Certificates', path: '/intern/certificates', icon: 'Award' },
  { label: 'Support', path: '/intern/tickets', icon: 'LifeBuoy' },
  { label: 'My Profile', path: '/intern/profile', icon: 'User' },
]

export default function InternLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-900">
      <Sidebar nav={internNav} role="intern" />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
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
