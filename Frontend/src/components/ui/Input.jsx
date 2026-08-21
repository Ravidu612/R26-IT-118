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
      <label htmlFor={id} className="block text-sm font-bold text-[#294b36]">
        {label} {required ? <span className="text-[#16764d]">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={cn(
          'w-full rounded-xl border border-[#d3e5d7] bg-[#fbfefc] px-3.5 py-3 text-sm text-[#1d3f2b] shadow-sm',
          'placeholder:text-[#91a59a] focus:border-[#16764d] focus:outline-none focus:ring-2 focus:ring-[#16764d]/20',
          error ? 'border-[#b66a5e] focus:border-[#b66a5e] focus:ring-[#b66a5e]/20' : '',
          className,
        )}
        {...props}
      />
      {error ? <p className="text-xs text-[#a55247]">{error}</p> : helperText ? <p className="text-xs text-[#789080]">{helperText}</p> : null}
    </div>
  )
}

export default Input
