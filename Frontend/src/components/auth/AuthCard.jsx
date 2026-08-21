function AuthCard({ title, subtitle, children, footer, eyebrow = 'TeaGuard workspace' }) {
  return <section className="w-full max-w-[480px] rounded-[24px] border border-[#dcebe0] bg-white p-6 shadow-[0_20px_55px_rgba(19,77,46,.1)] md:p-9"><header className="mb-7 space-y-2"><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#16764d]">{eyebrow}</p><h1 className="text-3xl font-extrabold tracking-[-0.04em] text-[#123b28]">{title}</h1><p className="text-sm leading-6 text-[#63806f]">{subtitle}</p></header><div className="space-y-4">{children}</div>{footer ? <footer className="mt-7 border-t border-[#e1ebe3] pt-5 text-sm text-[#63806f]">{footer}</footer> : null}</section>
}

export default AuthCard
