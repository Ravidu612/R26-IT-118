import { cn } from '../../utils/cn'

const toneStyles = {
  info: 'bg-teal-300/20 text-teal-100',
  success: 'bg-emerald-300/20 text-emerald-100',
  warning: 'bg-amber-300/20 text-amber-100',
  danger: 'bg-rose-300/20 text-rose-100',
}

function Badge({ children, tone = 'info', className }) {
  return <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', toneStyles[tone] || toneStyles.info, className)}>{children}</span>
}

export default Badge
