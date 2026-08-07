import { cn } from '../../utils/cn'

function Card({ title, subtitle, children, className }) {
  return (
    <section className={cn('surface-card rounded-[14px] p-5 md:p-6', className)}>
      {title ? (
        <header className="mb-5 border-b border-[var(--border-color)] pb-4">
          <h3 className="text-lg font-bold tracking-[-0.02em] text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-300">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}

export default Card
