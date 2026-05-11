function AuthCard({ title, subtitle, children, footer }) {
  return (
    <section className="surface-card w-full max-w-md rounded-2xl p-6 md:p-8">
      <header className="mb-6 space-y-2 text-left">
        <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
        <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
      </header>
      <div className="space-y-4">{children}</div>
      {footer ? <footer className="mt-6 border-t border-[var(--border-color)] pt-4 text-sm text-slate-300">{footer}</footer> : null}
    </section>
  )
}

export default AuthCard
