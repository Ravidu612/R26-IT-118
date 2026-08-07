import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

const toneMap = {
  info: { icon: Info, className: 'border-cyan-200 bg-cyan-50 text-cyan-800' },
  success: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  warning: { icon: AlertTriangle, className: 'border-amber-200 bg-amber-50 text-amber-800' },
  error: { icon: XCircle, className: 'border-rose-200 bg-rose-50 text-rose-800' },
}

function Alert({ tone = 'info', message }) {
  const style = toneMap[tone] || toneMap.info
  const Icon = style.icon
  return (
    <div className={`inline-flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm ${style.className}`}>
      <Icon className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}

export default Alert
