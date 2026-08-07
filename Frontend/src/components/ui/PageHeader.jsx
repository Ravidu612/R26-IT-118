import { Search } from 'lucide-react'

function PageHeader({ title, description, action, showSearch = false, searchValue = '', onSearchChange }) {
  return (
    <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
        <p className="text-sm text-slate-300">{description}</p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
        {showSearch ? (
          <label className="relative block w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search records..."
              className="w-full rounded-lg border border-[var(--border-color)] bg-slate-900/80 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-[var(--tea-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--tea-teal)]/35"
            />
          </label>
        ) : null}
        {action ? <div>{action}</div> : null}
      </div>
    </header>
  )
}

export default PageHeader
