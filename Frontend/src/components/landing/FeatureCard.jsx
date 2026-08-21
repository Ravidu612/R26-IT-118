function FeatureCard({ title, description, icon: Icon }) {
  return <article className="group rounded-2xl border border-[#dcebe0] bg-white p-5 shadow-[0_8px_25px_rgba(19,77,46,.05)] transition duration-200 hover:-translate-y-1 hover:border-[#a9d5b5] hover:shadow-[0_14px_30px_rgba(19,77,46,.1)] md:p-6"><div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e5f5e9] text-[#16764d] transition group-hover:bg-[#16764d] group-hover:text-white"><Icon className="h-5 w-5" /></div><span className="rounded-full border border-[#cfe5d4] bg-[#f1f9f3] px-2.5 py-1 text-[9px] font-extrabold text-[#16764d]">Connected</span></div><h3 className="mt-5 text-base font-extrabold text-[#1b432c] md:text-lg">{title}</h3><p className="mt-2 text-xs leading-5 text-[#63806f] md:text-sm">{description}</p></article>
}

export default FeatureCard
