import { cn } from '../../utils/cn'

const toneStyles = {
  info: 'border border-cyan-200 bg-cyan-50 text-cyan-700',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border border-rose-200 bg-rose-50 text-rose-700',
}

function Badge({ children, tone = 'info', className }) {
  return <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', toneStyles[tone] || toneStyles.info, className)}>{children}</span>
}

export default Badge
