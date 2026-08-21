import { MoreVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'

function HistoryActions({ record, onDelete }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!window.confirm('Delete this saved checking result?')) return
    setIsDeleting(true)
    setError('')
    try {
      await onDelete(record._id)
      setIsOpen(false)
    } catch (deleteError) {
      setError(deleteError.message || 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  return <div className="relative"><button type="button" onClick={() => setIsOpen((open) => !open)} className="rounded-md border border-[#e4ebe5] p-1.5 text-[#53665a] hover:bg-[#f1f8f3]" aria-label="Open record actions" aria-expanded={isOpen}><MoreVertical className="h-3.5 w-3.5" /></button>{isOpen ? <div className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-[#dce9df] bg-white p-1.5 shadow-[0_12px_28px_rgba(33,61,45,.16)]"><button type="button" onClick={handleDelete} disabled={isDeleting} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold text-[#c94f45] hover:bg-[#fff3f1] disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />{isDeleting ? 'Deleting...' : 'Delete record'}</button>{error ? <p className="px-2.5 pb-1 text-[10px] text-[#c94f45]">{error}</p> : null}</div> : null}</div>
}

export default HistoryActions
