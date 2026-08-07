import { cn } from '../../utils/cn'

function Select({ id, label, options, value, onChange, required = false, helperText, className, ...props }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label} {required ? <span className="text-[var(--soft-yellow)]">*</span> : null}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={cn(
          'w-full rounded-lg border border-[var(--border-color)] bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100',
          'focus:border-[var(--tea-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--tea-teal)]/35',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900">
            {option.label}
          </option>
        ))}
      </select>
      {helperText ? <p className="text-xs text-slate-400">{helperText}</p> : null}
    </div>
  )
}

export default Select
