import { cn } from '../../utils/cn'

function Input({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  helperText,
  className,
  required = false,
  ...props
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label} {required ? <span className="text-[var(--soft-yellow)]">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full rounded-xl border border-[var(--border-color)] bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100',
          'placeholder:text-slate-400 focus:border-[var(--tea-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--tea-teal)]/35',
          error ? 'border-amber-400 focus:border-amber-400 focus:ring-amber-400/30' : '',
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-amber-300">{error}</p> : helperText ? <p className="text-xs text-slate-400">{helperText}</p> : null}
    </div>
  )
}

export default Input
