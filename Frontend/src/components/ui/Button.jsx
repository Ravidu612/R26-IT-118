import { LoaderCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

const variantStyles = {
  primary:
    'bg-[var(--tea-green)] text-[#ffffff] hover:bg-[var(--tea-green-deep)] active:translate-y-px active:bg-emerald-800',
  secondary:
    'bg-[var(--tea-teal)] text-[#ffffff] hover:bg-teal-700 active:translate-y-px active:bg-teal-800',
  outline:
    'border border-[var(--border-color)] bg-white/5 text-[var(--text-main)] hover:bg-white/10 active:translate-y-px',
  ghost: 'text-[var(--text-main)] hover:bg-white/10 active:translate-y-px',
}

const sizeStyles = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm md:text-base',
  lg: 'h-12 px-6 text-base',
}

function Button({
  children,
  className,
  icon: Icon,
  isLoading = false,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || isLoading

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--soft-yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
        'disabled:cursor-not-allowed disabled:opacity-55',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{children}</span>
    </button>
  )
}

export default Button
