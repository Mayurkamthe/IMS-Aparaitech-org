import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }} className={`card w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-dark-600">
              <h2 className="font-semibold text-slate-800 dark:text-white">{title}</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
