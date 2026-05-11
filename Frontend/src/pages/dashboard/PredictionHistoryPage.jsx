import { FileSearch, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Alert from '../../components/ui/Alert'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import Select from '../../components/ui/Select'
import { predictionService } from '../../services/predictionService'

const moduleOptions = [
  { label: 'All Modules', value: 'all' },
  { label: 'Tea Leaf Detection', value: 'tea_leaf_detection' },
  { label: 'Tea Grade Classification', value: 'tea_grade_classification' },
  { label: 'Worker Health Risk', value: 'worker_health_risk' },
]

function PredictionHistoryPage() {
  const [records, setRecords] = useState([])
  const [selected, setSelected] = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRecords = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await predictionService.listPredictions()
      setRecords(data)
    } catch (apiError) {
      setError(apiError.message || 'Failed to load prediction history')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timerId = setTimeout(() => {
      loadRecords().catch(() => {})
    }, 0)
    return () => clearTimeout(timerId)
  }, [])

  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        const matchesModule = moduleFilter === 'all' || item.moduleType === moduleFilter
        const status = item.result?.statusMessage?.toLowerCase().includes('fallback') ? 'failed' : 'success'
        const matchesStatus = statusFilter === 'all' || status === statusFilter
        const matchesSearch = `${item.moduleType} ${item.result?.predicted_grade || ''} ${item.result?.predicted_state || ''}`.toLowerCase().includes(searchText.toLowerCase())
        const matchesDate = !dateFilter || new Date(item.createdAt).toISOString().slice(0, 10) === dateFilter
        return matchesModule && matchesStatus && matchesSearch && matchesDate
      }),
    [records, moduleFilter, statusFilter, searchText, dateFilter],
  )

  const removeRecord = async (id) => {
    await predictionService.deletePrediction(id)
    setRecords((current) => current.filter((item) => item._id !== id))
    if (selected?._id === id) setSelected(null)
  }

  const loadDetail = async (id) => {
    setIsDetailLoading(true)
    setError('')
    try {
      const detail = await predictionService.getPrediction(id)
      setSelected(detail)
    } catch (apiError) {
      setError(apiError.message || 'Failed to load prediction detail')
    } finally {
      setIsDetailLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Prediction History" description="Search, filter, inspect, and manage AI prediction records across all modules." showSearch searchValue={searchText} onSearchChange={setSearchText} />
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <Select id="module-filter" label="Module Filter" value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)} options={moduleOptions} />
          <Select id="status-filter" label="Status Filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={[{ label: 'All Status', value: 'all' }, { label: 'Success', value: 'success' }, { label: 'Failed', value: 'failed' }, { label: 'Pending', value: 'pending' }]} />
          <label className="space-y-2 text-sm font-medium text-slate-200">
            Date Filter
            <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="block w-full rounded-xl border border-[var(--border-color)] bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 focus:border-[var(--tea-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--tea-teal)]/35" />
          </label>
        </div>
      </Card>
      {error ? <Alert tone="error" message={error} /> : null}
      <DataTable
        columns={[{ key: 'date', label: 'Date' }, { key: 'module', label: 'Module' }, { key: 'input', label: 'Input' }, { key: 'result', label: 'Result' }, { key: 'confidence', label: 'Confidence' }, { key: 'user', label: 'User' }, { key: 'status', label: 'Status', render: (value) => <Badge tone={value === 'Success' ? 'success' : 'warning'}>{value}</Badge> }]}
        rows={filteredRecords.map((item) => ({ id: item._id, date: new Date(item.createdAt).toLocaleString(), module: item.moduleType.replaceAll('_', ' '), input: item.imageMeta?.fileName || 'health form', result: item.result?.predicted_grade || item.result?.predicted_state || (item.result?.detected ? 'tea_leaf' : 'not_detected'), confidence: item.result?.confidence ? `${(item.result.confidence * 100).toFixed(1)}%` : '-', user: item.createdBy || 'system', status: item.result?.statusMessage?.toLowerCase().includes('fallback') ? 'Failed' : 'Success' }))}
        isLoading={isLoading}
        emptyState={<EmptyState icon={FileSearch} title="No prediction records found" description="Adjust filters or run prediction modules to populate history." />}
        renderRowActions={(row) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => loadDetail(row.id).catch(() => {})}>View</Button>
            <Button size="sm" variant="outline" icon={Trash2} onClick={() => removeRecord(row.id).catch((apiError) => setError(apiError.message))}>Delete</Button>
          </div>
        )}
      />
      {selected ? (
        <div className="fixed inset-0 z-40 bg-black/60 p-4">
          <div className="mx-auto max-h-full w-full max-w-3xl overflow-auto rounded-2xl border border-[var(--border-color)] bg-slate-950 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Prediction Detail</h2>
              <Button size="sm" variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
            {isDetailLoading ? <p className="text-sm text-slate-300">Loading detail...</p> : <pre className="overflow-auto rounded-xl bg-slate-900/80 p-4 text-xs text-slate-200">{JSON.stringify(selected, null, 2)}</pre>}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default PredictionHistoryPage
