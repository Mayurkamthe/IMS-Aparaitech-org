import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login, clearError } from '../../redux/slices/authSlice'
import { Layers, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, user, token } = useSelector(s => s.auth)
  const [showPwd, setShowPwd] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    if (user && token) navigate(user.role === 'admin' ? '/admin' : '/intern', { replace: true })
  }, [user, token])

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()) }
  }, [error])

  const onSubmit = (data) => dispatch(login(data))

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)', backgroundSize: '40px 40px', opacity: 0.3 }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-800/10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-dark-700 border border-dark-600 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-600/30">
              <Layers size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Internship LMS</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Role tabs */}
          <div className="grid grid-cols-2 bg-dark-800 rounded-lg p-1 mb-6 gap-1">
            <div className="py-2 px-4 rounded-md bg-primary-600 text-white text-sm font-medium text-center">Admin</div>
            <div className="py-2 px-4 rounded-md text-slate-400 text-sm font-medium text-center">Intern</div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label text-slate-300">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                  className="input pl-9 bg-dark-800 border-dark-600 text-white placeholder:text-slate-500 focus:ring-primary-500"
                  placeholder="admin@company.com" type="email" />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label text-slate-300 mb-0">Password</label>
                <a href="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type={showPwd ? 'text' : 'password'}
                  className="input pl-9 pr-10 bg-dark-800 border-dark-600 text-white placeholder:text-slate-500"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-dark-500 bg-dark-800 text-primary-600" />
              <label htmlFor="remember" className="text-sm text-slate-400">Remember me</label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-dark-600">
            <p className="text-center text-xs text-slate-500">
              Demo Admin: <span className="text-slate-300">admin@company.com</span> / <span className="text-slate-300">Admin@123</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
