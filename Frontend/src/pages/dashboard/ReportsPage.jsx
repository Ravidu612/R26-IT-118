import { Download, FileText } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import { predictionService } from '../../services/predictionService'
import { taskService } from '../../services/taskService'

const toDate = (value) => new Date(value).toISOString().slice(0, 10)

function ReportsPage() {
  const [fromDate, setFromDate] = useState('')
  const [toDateValue, setToDateValue] = useState('')
  const [predictions, setPredictions] = useState([])
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([predictionService.listPredictions(), taskService.listTasks()])
      .then(([predictionData, taskData]) => {
        setPredictions(predictionData)
        setTasks(taskData)
      })
      .catch((apiError) => setError(apiError.message || 'Failed to load reports'))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredPredictions = useMemo(
    () =>
      predictions.filter((item) => {
        const date = toDate(item.createdAt)
        const fromOk = !fromDate || date >= fromDate
        const toOk = !toDateValue || date <= toDateValue
        return fromOk && toOk
      }),
    [predictions, fromDate, toDateValue],
  )

  const exportCsv = () => {
    const header = 'date,module,result,confidence,status'
    const rows = filteredPredictions.map((item) => [toDate(item.createdAt), item.moduleType, item.result?.predicted_grade || item.result?.predicted_state || (item.result?.detected ? 'tea_leaf' : 'not_detected'), item.result?.confidence || '', item.result?.statusMessage || 'completed'].join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `teaguard-report-${Date.now()}.csv`
    link.click()
  }

  const summaryRows = [
    { label: 'Prediction Summary', value: filteredPredictions.length },
    { label: 'Tea Grade Classifications', value: filteredPredictions.filter((item) => item.moduleType === 'tea_grade_classification').length },
    { label: 'Worker Health Risk Predictions', value: filteredPredictions.filter((item) => item.moduleType === 'worker_health_risk').length },
    { label: 'Task Assignment Records', value: tasks.length },
  ]

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports"
        description="Generate operational summaries for predictions, worker risk trends, and task assignments."
        action={
          <div className="flex gap-2">
            <Button icon={Download} onClick={exportCsv}>Export CSV</Button>
            <Button variant="outline" disabled>Export PDF (Coming Soon)</Button>
          </div>
        }
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-200">From Date<input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="block w-full rounded-xl border border-[var(--border-color)] bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100" /></label>
          <label className="space-y-2 text-sm font-medium text-slate-200">To Date<input type="date" value={toDateValue} onChange={(event) => setToDateValue(event.target.value)} className="block w-full rounded-xl border border-[var(--border-color)] bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100" /></label>
        </div>
      </Card>
      {error ? <Alert tone="error" message={error} /> : null}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryRows.map((row) => <Card key={row.label}><p className="text-sm text-slate-300">{row.label}</p><p className="mt-2 text-2xl font-bold text-white">{row.value}</p></Card>)}
      </section>
      <Card title="Prediction Summary Table" subtitle="Filtered report-ready records for export and review.">
        <DataTable
          columns={[{ key: 'date', label: 'Date' }, { key: 'module', label: 'Module' }, { key: 'result', label: 'Result' }, { key: 'confidence', label: 'Confidence' }, { key: 'status', label: 'Status' }]}
          rows={filteredPredictions.map((item) => ({ id: item._id, date: new Date(item.createdAt).toLocaleString(), module: item.moduleType.replaceAll('_', ' '), result: item.result?.predicted_grade || item.result?.predicted_state || (item.result?.detected ? 'tea_leaf' : 'not_detected'), confidence: item.result?.confidence ? `${(item.result.confidence * 100).toFixed(1)}%` : '-', status: item.result?.statusMessage || 'Completed' }))}
          isLoading={isLoading}
          emptyState={<EmptyState icon={FileText} title="No report data available" description="Adjust date range or run model modules to build report data." />}
        />
      </Card>
    </div>
  )
}

export default ReportsPage
