// MyProfile.jsx
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Github, Linkedin, Save, Key } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { Skeleton } from '../../components/common/index'

export default function MyProfile() {
  const [intern, setIntern] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    api.get('/interns/me').then(r => { setIntern(r.data.data); reset({ name: r.data.data.user?.name, phone: r.data.data.user?.phone, github: r.data.data.github, linkedin: r.data.data.linkedin }) }).finally(() => setLoading(false))
  }, [])

  const onSave = async (data) => {
    setSaving(true)
    try {
      await api.put('/interns/me', data)
      toast.success('Profile updated!')
    } catch {} finally { setSaving(false) }
  }

  if (loading) return <Skeleton lines={8} />
  return (
    <div className="space-y-5 max-w-2xl">
      <div><h1 className="text-xl font-bold text-slate-800 dark:text-white">My Profile</h1><p className="text-sm text-slate-400">{intern?.internId}</p></div>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-2xl font-bold text-primary-600">
            {intern?.user?.name?.[0]}
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-white">{intern?.user?.name}</h2>
            <p className="text-slate-400 text-sm">{intern?.department}</p>
            <p className="text-xs text-slate-400">{intern?.user?.email}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input {...register('name')} className="input" /></div>
            <div><label className="label">Phone</label><input {...register('phone')} className="input" /></div>
            <div><label className="label flex items-center gap-1"><Github size={13} />GitHub</label><input {...register('github')} className="input" placeholder="https://github.com/..." /></div>
            <div><label className="label flex items-center gap-1"><Linkedin size={13} />LinkedIn</label><input {...register('linkedin')} className="input" placeholder="https://linkedin.com/in/..." /></div>
          </div>
          <div><label className="label">Skills (comma separated)</label><input {...register('skills')} defaultValue={intern?.skills?.join(', ')} className="input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">City</label><input {...register('address.city')} defaultValue={intern?.address?.city} className="input" /></div>
            <div><label className="label">State</label><input {...register('address.state')} defaultValue={intern?.address?.state} className="input" /></div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2"><Save size={15} />{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  )
}
