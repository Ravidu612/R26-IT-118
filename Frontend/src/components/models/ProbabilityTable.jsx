function ProbabilityTable({ rows = [] }) {
  const maxProbability = Math.max(...rows.map((row) => Number(row.probability) || 0), 1)

  return (
    <div className="overflow-hidden rounded-[12px] border border-[var(--border-color)]">
      <table className="w-full border-collapse text-left text-sm text-slate-200">
        <thead className="border-b border-[var(--border-color)] bg-white/5 text-xs uppercase tracking-wide text-slate-300">
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
            rows.map((row) => {
              const probability = Number(row.probability) || 0
              const percentage = probability <= 1 ? probability * 100 : probability
              const width = Math.max((probability / maxProbability) * 100, 2)

              return (
                <tr key={row.label} className="border-t border-[var(--border-color)] transition-colors hover:bg-emerald-50/40">
                  <td className="px-3 py-2 font-semibold">{row.label}</td>
                  <td className="px-3 py-3">
                    <div className="flex min-w-[180px] items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden bg-[#e7f0e9]">
                        <div className="h-full bg-[var(--tea-green)]" style={{ width: `${width}%` }} />
                      </div>
                      <span className="w-14 text-right font-semibold text-[var(--tea-green)]">{percentage.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ProbabilityTable
