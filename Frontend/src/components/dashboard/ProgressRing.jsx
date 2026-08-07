function ProgressRing({ value = 0, label, caption }) {
  const safeValue = Math.max(0, Math.min(100, value))

  return (
    <div className="flex items-center gap-4 sm:gap-5">
      <div className="relative h-28 w-48 shrink-0 sm:h-32 sm:w-56">
        <svg viewBox="0 0 120 72" className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={`${safeValue}% ${label}`}>
          <defs>
            <pattern id="progress-gauge-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#9fb3a5" strokeWidth="2" />
            </pattern>
          </defs>
          <path d="M 12 60 C 16 10 104 10 108 60" pathLength="100" fill="none" stroke="url(#progress-gauge-hatch)" strokeWidth="13" strokeLinecap="round" />
          <path d="M 12 60 C 16 10 104 10 108 60" pathLength="100" fill="none" stroke="#16764d" strokeWidth="13" strokeLinecap="round" strokeDasharray={`${safeValue} ${100 - safeValue}`} />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <p className="text-3xl font-extrabold leading-none tracking-[-0.05em] text-[#17231c]">{safeValue}%</p>
          <p className="mt-1 text-[10px] text-[#8a968d]">{label}</p>
        </div>
      </div>
      <div className="min-w-0 space-y-2 text-sm">
        <p className="font-semibold leading-5 text-[#24372b]">{caption}</p>
        <Legend color="bg-[#16764d]" label="Completed" />
        <Legend color="bg-[#9fb3a5]" label="Needs review" />
      </div>
    </div>
  )
}

function Legend({ color, label }) {
  return <p className="flex items-center gap-2 text-xs text-[#718077]"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</p>
}

export default ProgressRing
