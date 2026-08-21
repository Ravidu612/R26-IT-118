function ProgressRing({ value = 0, label, caption }) {
  const safeValue = Math.max(0, Math.min(100, value))
  return <div className="flex items-center gap-3"><div className="relative h-32 w-32 shrink-0"><svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90" role="img" aria-label={`${safeValue}% ${label}`}><circle cx="60" cy="60" r="44" pathLength="100" fill="none" stroke="#dce7df" strokeWidth="12" /><circle cx="60" cy="60" r="44" pathLength="100" fill="none" stroke="#079254" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${safeValue} ${100 - safeValue}`} /></svg><div className="absolute inset-0 grid place-items-center text-center"><p className="text-3xl font-extrabold leading-none tracking-[-0.05em] text-[#17231c]">{safeValue}%</p><p className="absolute bottom-7 text-[10px] text-[#8a968d]">{label}</p></div></div><p className="min-w-0 text-[11px] font-semibold leading-5 text-[#24372b]">{caption}</p></div>
}

export default ProgressRing
