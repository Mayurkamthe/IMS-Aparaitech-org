// MyCertificates.jsx
import { useEffect, useState } from 'react'
import { Award, Download, QrCode } from 'lucide-react'
import api from '../../services/api'
import { Empty } from '../../components/common/index'

export default function MyCertificates() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/certificates/my').then(r => setCerts(r.data.data)).finally(() => setLoading(false)) }, [])

  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold text-slate-800 dark:text-white">My Certificates</h1></div>
      {!loading && certs.length === 0 ? <Empty title="No certificates yet" description="Certificates will appear here after internship completion" icon={Award} />
        : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certs.map(cert => (
            <div key={cert._id} className="card-hover p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex-shrink-0"><Award size={24} className="text-primary-600" /></div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-white capitalize">{cert.type} Certificate</h3>
                  <p className="text-xs text-slate-400 mt-1">ID: {cert.certificateId}</p>
                  <p className="text-xs text-slate-400">Issued: {new Date(cert.issuedDate).toDateString()}</p>
                  <div className="flex gap-3 mt-4">
                    <a href={cert.pdfUrl} target="_blank" className="btn-primary flex items-center gap-1.5 text-sm py-1.5 px-3"><Download size={13} />Download PDF</a>
                  </div>
                </div>
                {cert.qrCode && <img src={cert.qrCode} alt="QR" className="w-16 h-16 rounded flex-shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
