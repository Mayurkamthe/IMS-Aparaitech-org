import { useEffect, useState } from 'react'
import { Award, Download, QrCode, Shield, ExternalLink } from 'lucide-react'
import api from '../../services/api'
import { Empty, Skeleton, PageHeader } from '../../components/common/index'
import { motion } from 'framer-motion'
import { COMPANY_NAME } from '../../utils/constants'

const TYPE_CONFIG = {
  completion: { label:'Certificate of Completion', color:'from-violet-500 to-purple-600', icon: Award },
  experience: { label:'Experience Letter',          color:'from-emerald-500 to-teal-600',  icon: Shield },
  appreciation:{ label:'Appreciation Certificate', color:'from-amber-500 to-orange-600',  icon: Award },
}

export default function MyCertificates() {
  const [certs, setCerts]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/certificates/my').then(r => setCerts(r.data.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 max-w-screen-xl">
      <PageHeader title="My Certificates" subtitle="Download and share your earned certificates" />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array(2).fill(0).map((_,i) => <div key={i} className="card p-6 h-48"><Skeleton lines={4} /></div>)}
        </div>
      ) : certs.length===0 ? (
        <div className="space-y-6">
          <Empty
            title="No certificates yet"
            description="Certificates will be generated upon completion of your internship program."
            icon={Award}
          />
          {/* Placeholder preview cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Object.entries(TYPE_CONFIG).slice(0,2).map(([type, cfg]) => (
              <div key={type} className="card overflow-hidden opacity-40">
                <div className={`h-2 bg-gradient-to-r ${cfg.color}`} />
                <div className="p-6 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center`}>
                    <cfg.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">{cfg.label}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Issued by {COMPANY_NAME}</p>
                    <p className="text-xs text-zinc-300 mt-2">Not yet issued</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((cert, i) => {
            const cfg = TYPE_CONFIG[cert.type] || TYPE_CONFIG.completion
            return (
              <motion.div key={cert._id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.1 }}
                className="card overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${cfg.color}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <cfg.icon size={24} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-zinc-900 dark:text-white">{cfg.label}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Issued by {COMPANY_NAME}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {new Date(cert.issuedDate).toLocaleDateString('en-US',{ month:'long', day:'numeric', year:'numeric' })}
                        </p>
                      </div>
                    </div>

                    {cert.qrCode && (
                      <div className="flex-shrink-0">
                        <img src={cert.qrCode} alt="QR" className="w-16 h-16 rounded-xl border border-zinc-200 dark:border-zinc-700" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                    <p className="text-xs text-zinc-400 mb-1">Certificate ID</p>
                    <p className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">{cert.certificateId}</p>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <a href={cert.pdfUrl} target="_blank"
                      className="btn-primary flex-1 text-sm">
                      <Download size={14} />Download PDF
                    </a>
                    <a href={`/verify/${cert.certificateId}`} target="_blank"
                      className="btn-secondary text-sm">
                      <Shield size={14} />Verify
                    </a>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
