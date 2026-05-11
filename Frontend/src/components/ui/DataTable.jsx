import Loader from './Loader'
import EmptyState from './EmptyState'

function DataTable({ columns, rows, isLoading = false, error = '', emptyState, renderRowActions }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-slate-900/55 p-6">
        <Loader text="Loading table data..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-300/30 bg-rose-300/10 p-4 text-sm text-rose-100">
        {error}
      </div>
    )
  }

  if (!rows.length) return emptyState || <EmptyState title="No records found" description="Data will appear here once records are available." />

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-slate-900/45">
      <table className="min-w-full text-left text-sm text-slate-200">
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-300">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold">
                {column.label}
              </th>
            ))}
            {renderRowActions ? <th className="px-4 py-3">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || `${row.module || 'row'}-${index}`} className="border-t border-[var(--border-color)] align-top">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3">
                  {column.render ? column.render(row[column.key], row) : row[column.key] || '-'}
                </td>
              ))}
              {renderRowActions ? <td className="px-4 py-3">{renderRowActions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
