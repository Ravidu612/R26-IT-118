import { cn } from '../../utils/cn'

function Select({ id, label, options, value, onChange, required = false, helperText, className, ...props }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-bold text-[#294b36]">
        {label} {required ? <span className="text-[#16764d]">*</span> : null}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={cn(
          'w-full rounded-xl border border-[#d3e5d7] bg-[#fbfefc] px-3.5 py-3 text-sm text-[#1d3f2b] shadow-sm',
          'focus:border-[#16764d] focus:outline-none focus:ring-2 focus:ring-[#16764d]/20',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white text-[#1d3f2b]">
            {option.label}
          </option>
        ))}
      </select>
      {helperText ? <p className="text-xs text-[#789080]">{helperText}</p> : null}
    </div>
  )
}

export default Select
