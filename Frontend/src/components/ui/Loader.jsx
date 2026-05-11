import { LoaderCircle } from 'lucide-react'

function Loader({ text = 'Loading...' }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-200">
      <LoaderCircle className="h-4 w-4 animate-spin text-teal-200" />
      <span>{text}</span>
    </div>
  )
}

export default Loader
