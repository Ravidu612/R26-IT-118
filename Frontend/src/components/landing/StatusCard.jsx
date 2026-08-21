const statusStyles = {
  Connected: 'border-[#b9dcc2] bg-[#eff9f1] text-[#16764d]',
  Prototype: 'border-[#cfe4d3] bg-[#f5faf6] text-[#5d826a]',
  Offline: 'border-[#d5e6d9] bg-[#f7fbf8] text-[#6d8977]',
}

function StatusCard({ title, status, description }) {
  return <article className="rounded-2xl border border-[#dcebe0] bg-white p-5 shadow-[0_8px_25px_rgba(19,77,46,.05)]"><div className="mb-4 flex items-start justify-between gap-3"><h3 className="max-w-[180px] text-base font-extrabold leading-6 text-[#1b432c]">{title}</h3><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${statusStyles[status] || statusStyles.Offline}`}>{status}</span></div><p className="text-sm leading-6 text-[#63806f]">{description}</p></article>
}

export default StatusCard
