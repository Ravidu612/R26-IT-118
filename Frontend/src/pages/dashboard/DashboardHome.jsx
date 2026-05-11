import { Activity, AlertTriangle, BarChart3, ClipboardCheck, HeartPulse, Leaf, ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import PageHeader from '../../components/ui/PageHeader'
import { useApi } from '../../hooks/useApi'
import { modelService } from '../../services/modelService'
import { predictionService } from '../../services/predictionService'
import { taskService } from '../../services/taskService'
import { workerService } from '../../services/workerService'

const toConfidence = (value) => (typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : '-')

function DashboardHome() {
  const predictionsApi = useApi(predictionService.listPredictions, { defaultData: [] })
  const tasksApi = useApi(taskService.listTasks, { defaultData: [] })
  const workersApi = useApi(workerService.listWorkers, { defaultData: [] })
  const statusApi = useApi(modelService.getModelStatus, { defaultData: null })

  const predictions = predictionsApi.data || []
  const gradePredictions = predictions.filter((item) => item.moduleType === 'tea_grade_classification')
  const healthPredictions = predictions.filter((item) => item.moduleType === 'worker_health_risk')
  const leafPredictions = predictions.filter((item) => item.moduleType === 'tea_leaf_detection')
  const highRiskWorkers = healthPredictions.filter((item) => ['High', 'Critical'].includes(item.result?.risk_level)).length

  const summaryCards = [
    { title: 'Total Predictions', value: predictions.length, icon: BarChart3 },
    { title: 'Tea Leaves Detected', value: leafPredictions.length, icon: Leaf },
    { title: 'Diseased / Rejected Samples', value: leafPredictions.filter((x) => !x.result?.detected).length, icon: AlertTriangle },
    { title: 'Tea Grades Classified', value: gradePredictions.length, icon: ShieldCheck },
    { title: 'Worker Health Checks', value: healthPredictions.length, icon: HeartPulse },
    { title: 'High Risk Workers', value: highRiskWorkers, icon: Activity },
    { title: 'Hugging Face API Status', value: statusApi.isLoading ? 'Checking' : statusApi.error ? 'Error' : 'Online', icon: ClipboardCheck },
  ]

  const gradeCounts = useMemo(() => {
    const counts = {}
    gradePredictions.forEach((item) => {
      const key = item.result?.predicted_grade || 'Unknown'
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [gradePredictions])

  const recentRows = predictions.slice(0, 8).map((item) => ({
    id: item._id,
    date: new Date(item.createdAt).toLocaleString(),
    module: item.moduleType.replaceAll('_', ' '),
    inputType: item.imageMeta?.fileName ? 'Image' : 'Health Form',
    result: item.result?.predicted_grade || item.result?.predicted_state || (item.result?.detected ? 'tea_leaf' : 'not_detected'),
    confidence: toConfidence(item.result?.confidence),
    status: item.result?.statusMessage?.toLowerCase()?.includes('fallback') ? 'Fallback' : 'Success',
  }))

  const statusItems = [
    { name: 'Tea Leaf Detection model', value: statusApi.data?.teaLeaf?.runtime || 'checking' },
    { name: 'Tea Grade Classification model', value: statusApi.data?.teaGrade?.runtime || 'checking' },
    { name: 'Worker Health Risk model', value: statusApi.data?.workerHealth?.runtime || 'checking' },
  ]

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" description="AI operations overview for tea leaf validation, grading, and worker safety modules." />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <p className="inline-flex items-center gap-2 text-sm text-slate-300">
              <card.icon className="h-4 w-4 text-emerald-200" />
              {card.title}
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <Card title="Tea Grade Distribution" subtitle="Top observed output grades from recent predictions." className="xl:col-span-1">
          {gradeCounts.length ? gradeCounts.map(([label, count]) => <p key={label} className="mb-2 text-sm text-slate-200">{label}: {count}</p>) : <EmptyState icon={BarChart3} title="No grade predictions yet" description="Run tea grade classification to populate this section." />}
        </Card>
        <Card title="Worker Health Overview" subtitle="Current risk observation from worker health predictions." className="xl:col-span-1">
          <p className="text-sm text-slate-200">High/Critical risk workers: {highRiskWorkers}</p>
          <p className="mt-2 text-sm text-slate-300">Total task queue entries: {(tasksApi.data || []).length}</p>
          <p className="mt-2 text-sm text-slate-300">Workers in system: {(workersApi.data || []).length}</p>
        </Card>
        <Card title="Model API Status" subtitle="Live backend model-service runtime status." className="xl:col-span-1">
          {statusApi.error ? <p className="text-sm text-rose-300">{statusApi.error}</p> : statusItems.map((item) => <p key={item.name} className="mb-2 text-sm text-slate-200">{item.name}: <Badge tone={String(item.value).includes('running') ? 'success' : 'warning'}>{item.value}</Badge></p>)}
        </Card>
      </section>
      <Card title="Recent AI Predictions" subtitle="Latest outputs across all prediction modules.">
        <DataTable
          columns={[{ key: 'date', label: 'Date' }, { key: 'module', label: 'Module' }, { key: 'inputType', label: 'Input Type' }, { key: 'result', label: 'Result' }, { key: 'confidence', label: 'Confidence' }, { key: 'status', label: 'Status' }]}
          rows={recentRows}
          isLoading={predictionsApi.isLoading}
          error={predictionsApi.error}
          emptyState={<EmptyState icon={Leaf} title="No predictions yet" description="Run model modules to start generating prediction history." />}
        />
      </Card>
      <Card title="Task Assignment Summary" subtitle="Risk-based recommendation policy currently active in the system.">
        <ul className="space-y-2 text-sm text-slate-300">
          <li>- Low risk: normal work</li>
          <li>- Medium risk: light work preferred</li>
          <li>- High risk: light work only with supervisor review</li>
          <li>- Critical risk: rest required with medical review</li>
        </ul>
      </Card>
    </div>
  )
}

export default DashboardHome
