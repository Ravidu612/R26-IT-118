const statusStyles = {
  Connected: 'bg-emerald-300/20 text-emerald-200',
  Prototype: 'bg-amber-300/20 text-amber-200',
  Offline: 'bg-rose-300/20 text-rose-200',
}

function StatusCard({ title, status, description }) {
  return (
    <article className="surface-card rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.Offline}`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-slate-300">{description}</p>
    </article>
  )
}

export default StatusCard
