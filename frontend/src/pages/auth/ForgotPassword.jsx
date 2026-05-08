// ForgotPassword.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Layers, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', data)
      setSent(true)
      toast.success('Reset email sent!')
    } catch {} finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-700 border border-dark-600 rounded-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mb-4">
            <Layers size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-1">We will send a reset link to your email</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={24} className="text-emerald-400" />
            </div>
            <p className="text-white font-medium">Email Sent!</p>
            <p className="text-slate-400 text-sm mt-2">Check your inbox for reset instructions.</p>
            <Link to="/login" className="mt-4 btn-primary inline-flex items-center gap-2 text-sm">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label text-slate-300">Email Address</label>
              <input {...register('email', { required: true })} type="email" className="input bg-dark-800 border-dark-600 text-white" placeholder="your@email.com" />
              {errors.email && <p className="text-red-400 text-xs mt-1">Email required</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">{loading ? 'Sending...' : 'Send Reset Link'}</button>
            <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-slate-400 hover:text-white mt-2"><ArrowLeft size={14} />Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  )
}
