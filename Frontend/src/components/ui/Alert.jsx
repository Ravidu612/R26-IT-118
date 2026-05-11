import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

const toneMap = {
  info: { icon: Info, className: 'border-teal-300/30 bg-teal-300/10 text-teal-100' },
  success: { icon: CheckCircle2, className: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100' },
  warning: { icon: AlertTriangle, className: 'border-amber-300/30 bg-amber-300/10 text-amber-100' },
  error: { icon: XCircle, className: 'border-rose-300/30 bg-rose-300/10 text-rose-100' },
}

function Alert({ tone = 'info', message }) {
  const style = toneMap[tone] || toneMap.info
  const Icon = style.icon
  return (
    <div className={`inline-flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm ${style.className}`}>
      <Icon className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}

export default Alert
