function WeeklyActivityChart({ data = [] }) {
  const maxValue = Math.max(1, ...data.map((item) => item.value))

  return (
    <div className="flex h-48 items-end gap-2 pt-4 sm:gap-4">
      {data.map((item, index) => {
        const height = Math.max(8, Math.round((item.value / maxValue) * 100))
        const featured = index === Math.floor(data.length / 2)
        return (
          <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-full w-full items-end justify-center">
              <div className={`w-full max-w-9 rounded-t-md transition-all ${featured ? 'bg-[#185e3f]' : index % 2 ? 'bg-[#68bd91]' : 'bg-[#dce9df]'}`} style={{ height: `${height}%` }} title={`${item.value} activities`} />
            </div>
            <span className="text-[11px] font-medium text-[#8a968d]">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default WeeklyActivityChart
