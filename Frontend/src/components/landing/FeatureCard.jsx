function FeatureCard({ title, description, icon: Icon }) {
  return (
    <article className="surface-card rounded-2xl p-5 md:p-6">
      <div className="mb-4 inline-flex rounded-xl bg-teal-300/15 p-3">
        <Icon className="h-5 w-5 text-teal-200" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-6 text-slate-300">{description}</p>
    </article>
  )
}

export default FeatureCard
