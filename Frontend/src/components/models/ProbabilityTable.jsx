function ProbabilityTable({ rows = [] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-color)]">
      <table className="w-full border-collapse text-left text-sm text-slate-200">
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-300">
          <tr>
            <th className="px-3 py-2">Class</th>
            <th className="px-3 py-2">Probability</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-3 text-slate-400" colSpan={2}>
                No probability data available yet.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.label} className="border-t border-[var(--border-color)]">
                <td className="px-3 py-2">{row.label}</td>
                <td className="px-3 py-2">{Number(row.probability).toFixed(4)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ProbabilityTable
