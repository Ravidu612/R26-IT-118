import Button from './Button'

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border-color)] bg-slate-900/45 p-8 text-center">
      {Icon ? (
        <div className="mx-auto mb-3 inline-flex rounded-full bg-teal-300/15 p-3">
          <Icon className="h-5 w-5 text-teal-200" />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">{description}</p>
      {actionLabel ? (
        <Button variant="outline" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

export default EmptyState
