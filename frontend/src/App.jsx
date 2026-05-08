import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getMe } from './redux/slices/authSlice'
import { setTheme } from './redux/slices/uiSlice'
import { initSocket, disconnectSocket } from './socket/socket'
import { addNotification, setNotifications } from './redux/slices/notificationSlice'
import api from './services/api'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import InternLayout from './layouts/InternLayout'

// Auth pages
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import Interns from './pages/admin/Interns'
import InternDetail from './pages/admin/InternDetail'
import Projects from './pages/admin/Projects'
import Tasks from './pages/admin/Tasks'
import Attendance from './pages/admin/Attendance'
import Teams from './pages/admin/Teams'
import Reports from './pages/admin/Reports'
import Tickets from './pages/admin/Tickets'
import Certificates from './pages/admin/Certificates'
import AdminSettings from './pages/admin/Settings'

// Intern pages
import InternDashboard from './pages/intern/Dashboard'
import MyTasks from './pages/intern/MyTasks'
import MyProjects from './pages/intern/MyProjects'
import MyAttendance from './pages/intern/MyAttendance'
import MyProfile from './pages/intern/MyProfile'
import MyCertificates from './pages/intern/MyCertificates'
import MyTickets from './pages/intern/MyTickets'

import Loader from './components/common/Loader'
import toast from 'react-hot-toast'

const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useSelector(s => s.auth)
  if (!token) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to={user?.role === 'admin' ? '/admin' : '/intern'} replace />
  return children
}

export default function App() {
  const dispatch = useDispatch()
  const { token, user, initialized } = useSelector(s => s.auth)
  const { theme } = useSelector(s => s.ui)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    dispatch(setTheme(savedTheme))
    if (token) dispatch(getMe())
    else dispatch({ type: 'auth/getMe/rejected' })
  }, [])

  useEffect(() => {
    if (!token || !user) return
    const socket = initSocket(token)

    socket.on('notification', (notif) => {
      dispatch(addNotification(notif))
      toast(notif.title, { icon: null, style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #3b82f6' } })
    })

    api.get('/notifications').then(({ data }) => dispatch(setNotifications(data))).catch(() => {})

    return () => disconnectSocket()
  }, [user?._id])

  if (!initialized) return <div className="flex h-screen items-center justify-center bg-dark-900"><Loader size="lg" /></div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="interns" element={<Interns />} />
          <Route path="interns/:id" element={<InternDetail />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="teams" element={<Teams />} />
          <Route path="reports" element={<Reports />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/intern" element={<ProtectedRoute role="intern"><InternLayout /></ProtectedRoute>}>
          <Route index element={<InternDashboard />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="projects" element={<MyProjects />} />
          <Route path="attendance" element={<MyAttendance />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="certificates" element={<MyCertificates />} />
          <Route path="tickets" element={<MyTickets />} />
        </Route>

        <Route path="/" element={<Navigate to={token ? (user?.role === 'admin' ? '/admin' : '/intern') : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
