import { cn } from '../../utils/cn'

function Card({ title, subtitle, children, className }) {
  return (
    <section className={cn('surface-card rounded-2xl p-5 md:p-6', className)}>
      {title ? (
        <header className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-300">{subtitle}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}

export default Card
