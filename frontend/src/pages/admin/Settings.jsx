// Settings.jsx
import { useSelector, useDispatch } from 'react-redux'
import { toggleTheme } from '../../redux/slices/uiSlice'
import { Sun, Moon, Bell, Shield, User } from 'lucide-react'

export default function AdminSettings() {
  const dispatch = useDispatch()
  const { theme } = useSelector(s => s.ui)
  const { user } = useSelector(s => s.auth)

  return (
    <div className="space-y-5 max-w-2xl">
      <div><h1 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h1><p className="text-sm text-slate-400">Manage your preferences</p></div>

      <div className="card p-6 space-y-5">
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><User size={18} />Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl font-bold text-primary-600">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className="badge-blue capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Sun size={18} />Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark Mode</p>
            <p className="text-xs text-slate-400">Toggle between light and dark theme</p>
          </div>
          <button onClick={() => dispatch(toggleTheme())} className={`relative w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-slate-200'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2"><Shield size={18} />Security</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-dark-600">
            <div><p className="text-sm font-medium text-slate-700 dark:text-slate-300">Change Password</p><p className="text-xs text-slate-400">Update your account password</p></div>
            <button className="btn-secondary text-sm">Change</button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div><p className="text-sm font-medium text-slate-700 dark:text-slate-300">Login History</p><p className="text-xs text-slate-400">View recent login activity</p></div>
            <button className="btn-secondary text-sm">View</button>
          </div>
        </div>
      </div>
    </div>
  )
}
